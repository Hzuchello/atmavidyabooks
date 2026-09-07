/* Ôjas — livreiro virtual. Webhook n8n + fallback WhatsApp. */
(function () {
  const WEBHOOK =
    window.OJAS_WEBHOOK_N8N ||
    'https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/b67fa726-41c4-497c-8bcb-ba2e24fab203/chat';
  const WHATSAPP = '5541991283609';
  const WA_LINK = 'https://wa.me/' + WHATSAPP;
  const APRESENTACAO = 'Oi, sou Ôjas, seu livreiro digital. Em que posso ajudar no acervo?';

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function sessionId() {
    const k = 'ojas_session';
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
      sessionStorage.setItem(k, id);
    }
    return id;
  }

  function extrairTexto(data) {
    if (data == null) return '';
    if (typeof data === 'string') return data.trim();
    if (Array.isArray(data)) return extrairTexto(data[0]);
    const bruto =
      data.output ??
      data.text ??
      data.message ??
      data.json?.output ??
      data.json?.text ??
      data.data?.output ??
      data.data?.text;
    if (bruto && typeof bruto === 'object') return extrairTexto(bruto);
    return (bruto || '').toString().trim();
  }

  async function falarComOjas(texto) {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: sessionId(),
        chatInput: texto
      })
    });
    const raw = await res.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (e) { data = { output: raw }; }
    const textoResp = extrairTexto(data);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (!textoResp) console.warn('Ôjas sem texto. HTTP', res.status, raw.slice(0, 400));
    return textoResp;
  }

  function montar() {
    if (document.getElementById('ojas-root')) return;

    const root = el(`
      <div id="ojas-root">
        <button type="button" id="ojas-fab" aria-label="Falar com Ôjas">Ôjas</button>
        <div id="ojas-painel" hidden>
          <div class="ojas-cab">
            <strong>Ôjas</strong>
            <span>livreiro virtual</span>
            <button type="button" id="ojas-fechar" aria-label="Fechar">×</button>
          </div>
          <div id="ojas-chat">
            <div id="ojas-msgs"></div>
            <form id="ojas-form">
              <input type="text" id="ojas-input" placeholder="Escreva ao Ôjas…" autocomplete="off" />
              <button type="submit">Enviar</button>
            </form>
            <div id="ojas-wa-box">
              <a class="btn-primary" id="ojas-wa" target="_blank" rel="noopener">Falar com humano</a>
            </div>
          </div>
        </div>
      </div>`);
    document.body.appendChild(root);

    const painel = root.querySelector('#ojas-painel');
    const msgs = root.querySelector('#ojas-msgs');
    const form = root.querySelector('#ojas-form');
    root.querySelector('#ojas-wa').href = WA_LINK;

    function limparResposta(texto) {
      return String(texto || '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/\*+/g, '')
        .replace(/_+/g, '')
        .replace(/`+/g, '')
        .replace(/^\s*[-•]\s+/gm, '• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    function bolha(quem, texto) {
      const b = document.createElement('div');
      b.className = 'ojas-msg ojas-msg-' + quem;
      b.textContent = quem === 'bot' ? limparResposta(texto) : texto;
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }

    let apresentou = false;

    function abrirPainel() {
      painel.hidden = false;
      if (!apresentou) {
        apresentou = true;
        bolha('bot', APRESENTACAO);
      }
    }

    root.querySelector('#ojas-fab').addEventListener('click', () => {
      if (painel.hidden) abrirPainel();
      else painel.hidden = true;
    });

    root.querySelector('#ojas-fechar').addEventListener('click', () => {
      painel.hidden = true;
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const input = root.querySelector('#ojas-input');
      const texto = input.value.trim();
      if (!texto) return;
      input.value = '';
      bolha('eu', texto);
      try {
        const resp = await falarComOjas(texto);
        bolha('bot', resp || 'Não obtive resposta agora. Use Falar com humano se preferir.');
      } catch (err) {
        bolha('bot', 'Ôjas não respondeu agora. Use Falar com humano.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
