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

  async function enviarNewsletterChat(nome, email) {
    if (!window.supabaseClient) return;
    try {
      await window.supabaseClient.from('newsletter_inscricoes').insert({
        nome,
        email,
        telefone: 'chat-ojas'
      });
    } catch (err) {
      console.warn('newsletter (Ôjas):', err);
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

  async function falarComOjas(texto, nome) {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: sessionId(),
        chatInput: texto,
        metadata: { nome: nome || '' }
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
          <div id="ojas-gate">
            <p>Antes do atendimento, seu nome e e-mail. Usamos também na newsletter da casa.</p>
            <label>Nome</label>
            <input type="text" id="ojas-nome" autocomplete="name" required />
            <label>E-mail</label>
            <input type="email" id="ojas-email" autocomplete="email" required />
            <p id="ojas-gate-status"></p>
            <button type="button" class="btn-primary" id="ojas-entrar">Continuar</button>
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
    const gate = root.querySelector('#ojas-gate');
    const offline = root.querySelector('#ojas-offline');
    const chat = root.querySelector('#ojas-chat');
    const msgs = root.querySelector('#ojas-msgs');
    const status = root.querySelector('#ojas-gate-status');
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

    root.querySelector('#ojas-fab').addEventListener('click', () => {
      painel.hidden = !painel.hidden;
    });
    root.querySelector('#ojas-fechar').addEventListener('click', () => {
      painel.hidden = true;
    });

    root.querySelector('#ojas-entrar').addEventListener('click', async () => {
      const nome = root.querySelector('#ojas-nome').value.trim();
      const email = root.querySelector('#ojas-email').value.trim();
      if (!nome || !email) {
        status.textContent = 'Preencha nome e e-mail.';
        return;
      }
      status.textContent = 'Verificando o livreiro…';
      const online = await pingBot();
      await enviarNewsletterChat(nome, email);
      sessionStorage.setItem('ojas_nome', nome);
      sessionStorage.setItem('ojas_email', email);
      gate.hidden = true;
      if (!online) {
        offline.hidden = false;
        return;
      }
      chat.hidden = false;
      bolha('bot', 'Um instante…');
      try {
        const resp = await falarComOjas(
          'O visitante se chama ' + nome + '. Cumprimente em uma frase curta, sem Markdown, e pergunte como pode ajudar no acervo.',
          nome
        );
        const ultima = msgs.lastElementChild;
        if (ultima) {
          ultima.textContent = limparResposta(resp || 'Ôjas no ar. Escreva sua pergunta.');
        }
      } catch (err) {
        bolha('bot', 'Ôjas no ar, mas a resposta não chegou. Veja Executions no n8n.');
      }
    });

    root.querySelector('#ojas-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const input = root.querySelector('#ojas-input');
      const texto = input.value.trim();
      if (!texto) return;
      input.value = '';
      bolha('eu', texto);
      try {
        const nome = sessionStorage.getItem('ojas_nome') || '';
        const resp = await falarComOjas(texto, nome);
        bolha('bot', resp || 'Não obtive resposta. Tente o WhatsApp.');
      } catch (err) {
        bolha('bot', 'Ôjas saiu do ar. Use o WhatsApp.');
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
