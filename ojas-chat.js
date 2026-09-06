/* Ôjas — livreiro virtual. Webhook n8n + fallback WhatsApp. */
(function () {
  const WEBHOOK =
    window.OJAS_WEBHOOK_N8N ||
    'https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/b67fa726-41c4-497c-8bcb-ba2e24fab203/chat';
  const WHATSAPP = '5541991283609';
  const WA_LINK = 'https://wa.me/' + WHATSAPP;
  const APRESENTACAO = 'Oi, sou Ôjas, seu livreiro digital. Em que posso ajudar no acervo?';
  const PEDIU_WA = /whatsapp|zap\b|wa\.me|falar com (um )?humano|atendente humano/i;
  const DESPEDIDA = /^(tchau|adeus|encerrar|encera|até logo|ate logo|obrigad[oa]\.?)$/i;

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
            <div id="ojas-wa-box" hidden>
              <p id="ojas-wa-txt"></p>
              <a class="btn-primary" id="ojas-wa" target="_blank" rel="noopener">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>`);
    document.body.appendChild(root);

    const painel = root.querySelector('#ojas-painel');
    const chat = root.querySelector('#ojas-chat');
    const msgs = root.querySelector('#ojas-msgs');
    const form = root.querySelector('#ojas-form');
    const waBox = root.querySelector('#ojas-wa-box');
    const waTxt = root.querySelector('#ojas-wa-txt');
    const wa = root.querySelector('#ojas-wa');
    wa.href = WA_LINK;

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

    function oferecerWhatsapp(texto) {
      waTxt.textContent = texto;
      waBox.hidden = false;
      form.hidden = false;
    }

    function encerrarChat(texto) {
      waTxt.textContent = texto;
      waBox.hidden = false;
      form.hidden = true;
    }

    function mostrarOffline() {
      encerrarChat('Ôjas está fora do ar neste momento. Siga no WhatsApp.');
    }

    let apresentou = false;

    function abrirPainel() {
      painel.hidden = false;
      chat.hidden = false;
      if (!apresentou) {
        apresentou = true;
        form.hidden = false;
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

    wa.addEventListener('click', () => {
      encerrarChat('Atendimento neste chat encerrado. Siga no WhatsApp.');
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const input = root.querySelector('#ojas-input');
      const texto = input.value.trim();
      if (!texto) return;
      input.value = '';
      bolha('eu', texto);

      if (DESPEDIDA.test(texto)) {
        encerrarChat('Atendimento neste chat encerrado. Se precisar, o WhatsApp da casa.');
        return;
      }

      if (PEDIU_WA.test(texto)) {
        oferecerWhatsapp('WhatsApp da Livraria Ātma Vidyā.');
        bolha('bot', 'Aqui está o WhatsApp da livraria. O chat continua aberto se quiser seguir aqui.');
        return;
      }

      try {
        const resp = await falarComOjas(texto);
        const falou = resp || '';
        if (!falou) {
          bolha('bot', 'Não obtive resposta agora.');
          oferecerWhatsapp('Pode seguir pelo WhatsApp, ou tente de novo aqui.');
          return;
        }
        bolha('bot', falou);
        if (PEDIU_WA.test(falou) || /99128-3609|991283609/.test(falou)) {
          oferecerWhatsapp('WhatsApp da livraria — o chat permanece aberto.');
        }
      } catch (err) {
        mostrarOffline();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
