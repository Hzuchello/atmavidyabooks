/* Ôjas — livreiro virtual. Webhook n8n + fallback WhatsApp. */
(function () {
  const WEBHOOK =
    window.OJAS_WEBHOOK_N8N ||
    'https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/b67fa726-41c4-497c-8bcb-ba2e24fab203/chat';
  const WHATSAPP = '5541991283609';
  const TIMEOUT_MS = 4000;

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

  async function pingBot() {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: 'ojas-ping',
          chatInput: 'ping'
        }),
        signal: ctrl.signal
      });
      clearTimeout(t);
      return res.ok || res.status === 200 || res.status === 201;
    } catch (e) {
      clearTimeout(t);
      return false;
    }
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
          <div id="ojas-offline" hidden>
            <p>Ôjas está fora do ar neste momento.</p>
            <a class="btn-primary" id="ojas-wa" target="_blank" rel="noopener">WhatsApp</a>
          </div>
          <div id="ojas-chat" hidden>
            <div id="ojas-msgs"></div>
            <form id="ojas-form">
              <input type="text" id="ojas-input" placeholder="Escreva ao Ôjas…" autocomplete="off" />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      </div>`);
    document.body.appendChild(root);

    const painel = root.querySelector('#ojas-painel');
    const offline = root.querySelector('#ojas-offline');
    const chat = root.querySelector('#ojas-chat');
    const msgs = root.querySelector('#ojas-msgs');
    const form = root.querySelector('#ojas-form');
    const wa = root.querySelector('#ojas-wa');
    wa.href = 'https://wa.me/' + WHATSAPP;

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

    function encerrarNoWhatsapp(texto) {
      if (!/whatsapp|99128-3609|991283609/i.test(texto || '')) return;
      form.hidden = true;
      offline.hidden = false;
    }

    let abertoUmaVez = false;

    async function abrirPainel() {
      painel.hidden = false;
      if (abertoUmaVez) return;
      abertoUmaVez = true;
      offline.hidden = true;
      chat.hidden = true;
      const online = await pingBot();
      if (!online) {
        offline.hidden = false;
        return;
      }
      chat.hidden = false;
      form.hidden = false;
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
        const falou = resp || 'Não obtive resposta. Tente o WhatsApp.';
        bolha('bot', falou);
        encerrarNoWhatsapp(falou);
      } catch (err) {
        bolha('bot', 'Ôjas saiu do ar. Use o WhatsApp.');
        form.hidden = true;
        offline.hidden = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
