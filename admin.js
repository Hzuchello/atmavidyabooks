/* Painel admin — Ātma Vidyā. Só a conta da casa. */
(function () {
  const ADMIN_EMAILS = ['henriquezuchello@gmail.com'];

  const gate = document.getElementById('admin-gate');
  const negado = document.getElementById('admin-negado');
  const app = document.getElementById('admin-app');

  function ehAdmin(session) {
    const email = (session && session.user && session.user.email || '').toLowerCase();
    return ADMIN_EMAILS.indexOf(email) !== -1;
  }

  function mostrar(qual) {
    gate.classList.add('admin-escondido');
    negado.classList.add('admin-escondido');
    app.classList.add('admin-escondido');
    qual.classList.remove('admin-escondido');
  }

  function statusEl(id, texto, tipo) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = texto || '';
    el.className = 'admin-status' + (tipo ? ' ' + tipo : '');
  }

  function reaisParaCentavos(valor) {
    if (valor === '' || valor == null) return null;
    const n = Number(String(valor).replace(',', '.'));
    if (Number.isNaN(n)) return null;
    return Math.round(n * 100);
  }

  function centavosParaCampo(c) {
    if (c === null || c === undefined) return '';
    return (c / 100).toFixed(2);
  }

  function irPara(nome) {
    document.querySelectorAll('.admin-view').forEach(function (v) {
      v.classList.toggle('admin-escondido', v.id !== 'view-' + nome);
    });
    document.querySelectorAll('.admin-nav button[data-view]').forEach(function (b) {
      b.classList.toggle('ativo', b.getAttribute('data-view') === nome);
    });
    if (nome === 'resumo') carregarResumo();
    if (nome === 'acervo') carregarAcervo();
    if (nome === 'estoque') carregarEstoque();
    if (nome === 'agenda') carregarAgenda();
    if (nome === 'pedidos') carregarPedidos();
  }

  async function carregarResumo() {
    const box = document.getElementById('resumo-cards');
    const { data: livros } = await supabaseClient.from('livros').select('id, disponivel, estoque');
    const { data: pedidos } = await supabaseClient.from('pedidos').select('id, status');
    const lista = livros || [];
    const peds = pedidos || [];
    const visiveis = lista.filter(function (l) { return l.disponivel; }).length;
    const semEstoque = lista.filter(function (l) { return l.estoque === 0; }).length;
    box.innerHTML =
      cardNum(lista.length, 'Itens no banco') +
      cardNum(visiveis, 'Visíveis no site') +
      cardNum(semEstoque, 'Estoque zero') +
      cardNum(peds.length, 'Pedidos') +
      cardNum(peds.filter(function (p) { return p.status === 'pago'; }).length, 'Pagos');
  }

  function cardNum(n, rotulo) {
    return '<div class="admin-card"><strong>' + n + '</strong><span>' + rotulo + '</span></div>';
  }

  async function carregarAcervo() {
    const { data, error } = await supabaseClient
      .from('livros')
      .select('id, titulo, autor, categorias, preco_centavos, disponivel, estoque')
      .order('titulo');
    const tb = document.getElementById('tabela-acervo');
    if (error) {
      tb.innerHTML = '<tr><td>' + error.message + '</td></tr>';
      return;
    }
    tb.innerHTML = '<thead><tr><th>Título</th><th>Autor</th><th>Preço</th><th>Site</th><th></th></tr></thead><tbody>' +
      (data || []).map(function (l) {
        const preco = l.preco_centavos == null ? 'Em breve' : 'R$ ' + (l.preco_centavos / 100).toFixed(2);
        const vis = l.disponivel ? '<span class="tag-on">visível</span>' : '<span class="tag-off">oculto</span>';
        return '<tr><td>' + esc(l.titulo) + '</td><td>' + esc(l.autor) + '</td><td>' + preco +
          '</td><td>' + vis + '</td><td><button type="button" class="btn-linha" data-editar="' + l.id +
          '">Editar</button><button type="button" class="btn-linha" data-excluir="' + l.id +
          '" data-titulo="' + esc(l.titulo) + '">Excluir</button></td></tr>';
      }).join('') + '</tbody>';
    tb.querySelectorAll('[data-editar]').forEach(function (btn) {
      btn.addEventListener('click', function () { abrirLivro(btn.getAttribute('data-editar')); });
    });
    tb.querySelectorAll('[data-excluir]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pedirExclusao(btn.getAttribute('data-excluir'), btn.getAttribute('data-titulo'));
      });
    });
  }

  function devolverForm() {
    const form = document.getElementById('form-acervo');
    const holder = document.getElementById('acervo-form-holder');
    const slot = document.getElementById('acervo-form-slot');
    if (holder && form.parentElement !== holder) holder.appendChild(form);
    if (slot) slot.remove();
  }

  function encaixarFormNaLinha(id) {
    const form = document.getElementById('form-acervo');
    devolverForm();
    if (!id) {
      document.getElementById('acervo-form-holder').appendChild(form);
      form.classList.remove('admin-escondido');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const btn = document.querySelector('#tabela-acervo [data-editar="' + id + '"]');
    const tr = btn && btn.closest('tr');
    if (!tr) {
      document.getElementById('acervo-form-holder').appendChild(form);
      form.classList.remove('admin-escondido');
      return;
    }
    const slot = document.createElement('tr');
    slot.id = 'acervo-form-slot';
    const td = document.createElement('td');
    td.colSpan = 5;
    td.appendChild(form);
    slot.appendChild(td);
    tr.parentNode.insertBefore(slot, tr.nextSibling);
    form.classList.remove('admin-escondido');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function abrirLivro(id) {
    const form = document.getElementById('form-acervo');
    document.getElementById('form-acervo-titulo').textContent = id ? 'Editar item' : 'Novo item';
    statusEl('acervo-status', '');
    encaixarFormNaLinha(id);
    if (!id) {
      form.reset();
      document.getElementById('livro-id').value = '';
      document.getElementById('livro-disponivel').checked = true;
      document.getElementById('livro-destaque').checked = false;
      return;
    }
    const { data, error } = await supabaseClient.from('livros').select('*').eq('id', id).single();
    if (error) {
      statusEl('acervo-status', error.message, 'erro');
      return;
    }
    document.getElementById('livro-id').value = data.id;
    document.getElementById('livro-titulo').value = data.titulo || '';
    document.getElementById('livro-autor').value = data.autor || '';
    document.getElementById('livro-categorias').value = (data.categorias || []).join(', ');
    document.getElementById('livro-preco').value = centavosParaCampo(data.preco_centavos);
    document.getElementById('livro-capa').value = data.capa_url || '';
    document.getElementById('livro-tipo').value = data.tipo_venda || 'proprio';
    document.getElementById('livro-link').value = data.link_externo || '';
    document.getElementById('livro-estoque').value = data.estoque == null ? '' : data.estoque;
    document.getElementById('livro-sinopse').value = data.sinopse || '';
    document.getElementById('livro-banner').value = data.sinopse_banner || '';
    document.getElementById('livro-disponivel').checked = !!data.disponivel;
    document.getElementById('livro-destaque').checked = !!data.destaque;
  }

  async function salvarLivro(ev) {
    ev.preventDefault();
    const id = document.getElementById('livro-id').value;
    const cats = document.getElementById('livro-categorias').value
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
    const estoqueRaw = document.getElementById('livro-estoque').value;
    const payload = {
      titulo: document.getElementById('livro-titulo').value.trim(),
      autor: document.getElementById('livro-autor').value.trim(),
      categorias: cats,
      preco_centavos: reaisParaCentavos(document.getElementById('livro-preco').value),
      capa_url: document.getElementById('livro-capa').value.trim() || null,
      tipo_venda: document.getElementById('livro-tipo').value,
      link_externo: document.getElementById('livro-link').value.trim() || null,
      estoque: estoqueRaw === '' ? null : Number(estoqueRaw),
      sinopse: document.getElementById('livro-sinopse').value.trim() || null,
      sinopse_banner: document.getElementById('livro-banner').value.trim() || null,
      disponivel: document.getElementById('livro-disponivel').checked,
      destaque: document.getElementById('livro-destaque').checked
    };
    let resp;
    if (id) resp = await supabaseClient.from('livros').update(payload).eq('id', id);
    else resp = await supabaseClient.from('livros').insert(payload);
    if (resp.error) {
      statusEl('acervo-status', resp.error.message + ' — rode sql/07_admin.sql no Supabase.', 'erro');
      return;
    }
    statusEl('acervo-status', 'Salvo.', 'ok');
    document.getElementById('form-acervo').classList.add('admin-escondido');
    devolverForm();
    carregarAcervo();
  }

  let exclusaoId = null;
  const modal = document.getElementById('admin-modal');

  function pedirExclusao(id, titulo) {
    exclusaoId = id;
    document.getElementById('admin-modal-texto').textContent =
      'Apagar «' + (titulo || 'este item') + '» do acervo? Esta ação não desfaz. Se o título já entrou em um pedido, o banco pode recusar.';
    modal.hidden = false;
  }

  function fecharModal() {
    exclusaoId = null;
    modal.hidden = true;
  }

  async function confirmarExclusao() {
    if (!exclusaoId) return;
    const id = exclusaoId;
    const { error } = await supabaseClient.from('livros').delete().eq('id', id);
    fecharModal();
    if (error) {
      statusEl('acervo-status', error.message, 'erro');
      return;
    }
    statusEl('acervo-status', 'Item excluído.', 'ok');
    document.getElementById('form-acervo').classList.add('admin-escondido');
    devolverForm();
    carregarAcervo();
  }

  async function carregarEstoque() {
    const { data, error } = await supabaseClient
      .from('livros')
      .select('id, titulo, estoque, disponivel')
      .order('titulo');
    const tb = document.getElementById('tabela-estoque');
    if (error) {
      tb.innerHTML = '<tr><td>' + error.message + '</td></tr>';
      return;
    }
    tb.innerHTML = '<thead><tr><th>Título</th><th>Qtd</th><th></th></tr></thead><tbody>' +
      (data || []).map(function (l) {
        const q = l.estoque == null ? '' : l.estoque;
        return '<tr><td>' + esc(l.titulo) + '</td><td><input data-est="' + l.id +
          '" type="number" value="' + q + '" style="width:80px;padding:6px" /></td>' +
          '<td><button type="button" class="btn-linha" data-salvar-est="' + l.id + '">Salvar</button></td></tr>';
      }).join('') + '</tbody>';
    tb.querySelectorAll('[data-salvar-est]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const id = btn.getAttribute('data-salvar-est');
        const inp = tb.querySelector('[data-est="' + id + '"]');
        const v = inp.value === '' ? null : Number(inp.value);
        const { error: err } = await supabaseClient.from('livros').update({ estoque: v }).eq('id', id);
        statusEl('estoque-status', err ? err.message : 'Estoque atualizado.', err ? 'erro' : 'ok');
      });
    });
  }

  async function carregarAgenda() {
    const { data, error } = await supabaseClient
      .from('agenda')
      .select('*')
      .order('quando', { ascending: true });
    const tb = document.getElementById('tabela-agenda');
    if (error) {
      tb.innerHTML = '<tr><td>' + error.message + ' — rode sql/07_admin.sql</td></tr>';
      return;
    }
    tb.innerHTML = '<thead><tr><th>Quando</th><th>Título</th><th>Quem</th><th></th></tr></thead><tbody>' +
      (data || []).map(function (a) {
        const dt = a.quando ? new Date(a.quando).toLocaleString('pt-BR') : '';
        return '<tr><td>' + dt + '</td><td>' + esc(a.titulo) + '</td><td>' + esc(a.quem || '') +
          '</td><td><button type="button" class="btn-linha" data-apagar-ag="' + a.id + '">Apagar</button></td></tr>';
      }).join('') + '</tbody>';
    tb.querySelectorAll('[data-apagar-ag]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        await supabaseClient.from('agenda').delete().eq('id', btn.getAttribute('data-apagar-ag'));
        carregarAgenda();
      });
    });
  }

  async function salvarAgenda(ev) {
    ev.preventDefault();
    const quando = document.getElementById('ag-quando').value;
    const { error } = await supabaseClient.from('agenda').insert({
      titulo: document.getElementById('ag-titulo').value.trim(),
      quando: quando ? new Date(quando).toISOString() : null,
      quem: document.getElementById('ag-quem').value.trim() || null,
      nota: document.getElementById('ag-nota').value.trim() || null
    });
    statusEl('agenda-status', error ? error.message : 'Agendado.', error ? 'erro' : 'ok');
    if (!error) {
      ev.target.reset();
      carregarAgenda();
    }
  }

  async function carregarPedidos() {
    const { data, error } = await supabaseClient
      .from('pedidos')
      .select('id, status, total_centavos, criado_em')
      .order('criado_em', { ascending: false });
    const tb = document.getElementById('tabela-pedidos');
    if (error) {
      tb.innerHTML = '<tr><td>' + error.message + '</td></tr>';
      return;
    }
    tb.innerHTML = '<thead><tr><th>Pedido</th><th>Data</th><th>Status</th><th>Total</th></tr></thead><tbody>' +
      (data || []).map(function (p) {
        return '<tr><td>' + p.id.slice(0, 8).toUpperCase() + '</td><td>' +
          new Date(p.criado_em).toLocaleDateString('pt-BR') + '</td><td>' + esc(p.status) +
          '</td><td>R$ ' + (p.total_centavos / 100).toFixed(2) + '</td></tr>';
      }).join('') + '</tbody>';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  document.getElementById('admin-login').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-senha').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email: email, password: senha });
    document.getElementById('admin-login-erro').textContent = error ? error.message : '';
  });

  document.getElementById('admin-sair').addEventListener('click', function () {
    supabaseClient.auth.signOut();
  });
  document.getElementById('admin-sair-negado').addEventListener('click', function () {
    supabaseClient.auth.signOut();
  });

  document.querySelectorAll('.admin-nav button[data-view]').forEach(function (b) {
    b.addEventListener('click', function () { irPara(b.getAttribute('data-view')); });
  });

  document.getElementById('acervo-novo').addEventListener('click', function () { abrirLivro(''); });
  document.getElementById('acervo-cancelar').addEventListener('click', function () {
    document.getElementById('form-acervo').classList.add('admin-escondido');
    devolverForm();
  });
  document.getElementById('form-acervo').addEventListener('submit', salvarLivro);
  document.getElementById('form-agenda').addEventListener('submit', salvarAgenda);

  async function enviarCapaRepo() {
    const arquivoEl = document.getElementById('livro-capa-arquivo');
    const arquivo = arquivoEl && arquivoEl.files && arquivoEl.files[0];
    if (!arquivo) {
      statusEl('capa-status', 'Escolha um arquivo primeiro.', 'erro');
      return;
    }
    statusEl('capa-status', 'Enviando ' + arquivo.name + '…', '');
    const { data: sess } = await supabaseClient.auth.getSession();
    const token = sess && sess.session && sess.session.access_token;
    if (!token) {
      statusEl('capa-status', 'Sessão expirada. Entre de novo.', 'erro');
      return;
    }
    const dataUrl = await new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
    try {
      const res = await fetch('/api/upload-capa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          filename: arquivo.name,
          content: dataUrl
        })
      });
      const bruto = await res.text();
      let json = {};
      try { json = bruto ? JSON.parse(bruto) : {}; } catch (e) { json = { error: bruto.slice(0, 180) }; }
      if (!res.ok) {
        statusEl('capa-status', 'Erro ' + res.status + ': ' + (json.error || 'envio recusado. Confira GITHUB_TOKEN e GITHUB_REPO na Vercel.'), 'erro');
        return;
      }
      document.getElementById('livro-capa').value = json.capa_url;
      statusEl('capa-status', 'Capa gravada em ' + json.capa_url + '. Agora clique em Salvar. A foto no site aparece depois do deploy.', 'ok');
    } catch (err) {
      statusEl('capa-status', 'Falha de rede: ' + (err && err.message ? err.message : 'tente de novo'), 'erro');
    }
  }

  document.addEventListener('click', function (ev) {
    const btn = ev.target.closest('#livro-capa-enviar');
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    enviarCapaRepo();
  });
  document.getElementById('admin-modal-nao').addEventListener('click', fecharModal);
  document.getElementById('admin-modal-sim').addEventListener('click', confirmarExclusao);
  document.getElementById('admin-modal').addEventListener('click', function (ev) {
    if (ev.target === modal) fecharModal();
  });

  supabaseClient.auth.onAuthStateChange(function (_ev, session) {
    if (!session) {
      mostrar(gate);
      return;
    }
    if (!ehAdmin(session)) {
      mostrar(negado);
      return;
    }
    mostrar(app);
    irPara('resumo');
  });
})();
