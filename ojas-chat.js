/* Ôjas — livreiro virtual. Webhook n8n + fallback WhatsApp. */
(function () {
  const WEBHOOK =
    window.OJAS_WEBHOOK_N8N ||
    'https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/b67fa726-41c4-497c-8bcb-ba2e24fab203/chat';
  const WHATSAPP = '5541991283609';
  const WA_LINK = 'https://wa.me/' + WHATSAPP;
  const APRESENTACAO = 'Oi, sou Ôjas, seu livreiro digital. Em que posso ajudar no acervo?';
  const HIST_KEY = 'ojas_historico';
  const SID_KEY = 'ojas_session';
  const UID_KEY = 'ojas_uid';

  function lerHistorico() {
    try {
      const bruto = sessionStorage.getItem(HIST_KEY);
      const lista = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function gravarHistorico(lista) {
    sessionStorage.setItem(HIST_KEY, JSON.stringify(lista.slice(-40)));
  }

  function uidGuardado() {
    return sessionStorage.getItem(UID_KEY) || '';
  }

  function uidDaSessao(session) {
    return (session && session.user && session.user.id) || '';
  }

  function resetarConversa() {
    sessionStorage.removeItem(HIST_KEY);
    sessionStorage.removeItem(SID_KEY);
    sessionStorage.setItem(UID_KEY, '');
    const msgs = document.getElementById('ojas-msgs');
    if (msgs) msgs.innerHTML = '';
  }

  function aplicarAuth(event, session) {
    const novo = uidDaSessao(session);
    const velho = uidGuardado();

    if (event === 'SIGNED_OUT' || (velho && novo && velho !== novo)) {
      resetarConversa();
      if (novo) sessionStorage.setItem(UID_KEY, novo);
      const painel = document.getElementById('ojas-painel');
      if (painel && !painel.hidden) {
        const msgs = document.getElementById('ojas-msgs');
        if (msgs && !msgs.children.length) {
          const b = document.createElement('div');
          b.className = 'ojas-msg ojas-msg-bot';
          b.textContent = APRESENTACAO;
          msgs.appendChild(b);
          gravarHistorico([{ quem: 'bot', texto: APRESENTACAO }]);
        }
      }
      return;
    }

    if (novo) sessionStorage.setItem(UID_KEY, novo);
  }

  window.ojasAuth = aplicarAuth;

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function sessionId() {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
      sessionStorage.setItem(SID_KEY, id);
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

  function ouvirAuth() {
    if (!window.supabaseClient || !window.supabaseClient.auth) return;
    window.supabaseClient.auth.onAuthStateChange(function (event, session) {
      aplicarAuth(event, session);
    });
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

    function bolha(quem, texto, persistir) {
      const limpo = quem === 'bot' ? limparResposta(texto) : texto;
      const b = document.createElement('div');
      b.className = 'ojas-msg ojas-msg-' + quem;
      b.textContent = limpo;
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
      if (persistir !== false) {
        const hist = lerHistorico();
        hist.push({ quem: quem, texto: limpo });
        gravarHistorico(hist);
      }
    }

    lerHistorico().forEach(function (item) {
      if (item && item.quem && item.texto) bolha(item.quem, item.texto, false);
    });

    function abrirPainel() {
      painel.hidden = false;
      if (!lerHistorico().length) bolha('bot', APRESENTACAO);
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

    ouvirAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
