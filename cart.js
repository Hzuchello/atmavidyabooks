// ── CARRINHO DE COMPRAS ──
// Guardado no localStorage do navegador, mas separado por identidade:
// visitante não-logado usa uma chave "anônima", e cada conta logada
// tem sua própria chave — assim contas diferentes no mesmo navegador
// nunca compartilham o mesmo carrinho.

let carrinho = [];
let carrinhoIdentidadeAtual = 'anon'; // 'anon' ou o id do usuário logado

function chaveStorageCarrinho() {
  return `atma_vidya_carrinho_${carrinhoIdentidadeAtual}`;
}

function carregarCarrinhoDoStorage() {
  try {
    const raw = localStorage.getItem(chaveStorageCarrinho());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler carrinho salvo:', e);
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(chaveStorageCarrinho(), JSON.stringify(carrinho));
}

// Chamado sempre que o estado de login muda (login, logout, ou ao
// carregar a página com uma sessão já existente).
function sincronizarCarrinhoComSessao(session) {
  const novaIdentidade = session ? `user_${session.user.id}` : 'anon';
  if (novaIdentidade === carrinhoIdentidadeAtual) return; // nada mudou

  // Se a pessoa tinha itens no carrinho ANTES de logar (carrinho anônimo),
  // e a conta em que ela está entrando ainda não tem carrinho próprio salvo,
  // esses itens passam a ser o carrinho dessa conta.
  if (session && carrinhoIdentidadeAtual === 'anon' && carrinho.length > 0) {
    const chaveDoUsuario = `atma_vidya_carrinho_user_${session.user.id}`;
    const contaJaTinhaCarrinho = localStorage.getItem(chaveDoUsuario);
    if (!contaJaTinhaCarrinho) {
      localStorage.setItem(chaveDoUsuario, JSON.stringify(carrinho));
      localStorage.removeItem(chaveStorageCarrinho());
    }
  }

  carrinhoIdentidadeAtual = novaIdentidade;
  carrinho = carregarCarrinhoDoStorage();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
  sincronizarCarrinhoComSessao(session);
});

// Chamado pelo botão "Adicionar ao carrinho" nos cards do catálogo (script.js).
// Busca os dados do livro no array `livros`, já carregado do Supabase.
function adicionarAoCarrinho(livroId) {
  const livro = livros.find(l => l.id === livroId);
  if (!livro) return;

  const itemExistente = carrinho.find(i => i.id === livroId);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor,
      capa: livro.capa,
      precoCentavos: livro.precoCentavos,
      quantidade: 1
    });
  }

  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
  abrirCarrinho();
}

function removerDoCarrinho(livroId) {
  carrinho = carrinho.filter(i => i.id !== livroId);
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

function alterarQuantidade(livroId, delta) {
  const item = carrinho.find(i => i.id === livroId);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    removerDoCarrinho(livroId);
    return;
  }
  salvarCarrinho();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
}

function totalItensCarrinho() {
  return carrinho.reduce((soma, i) => soma + i.quantidade, 0);
}

function totalCentavosCarrinho() {
  return carrinho.reduce((soma, i) => soma + (i.precoCentavos * i.quantidade), 0);
}

function formatarPrecoCentavos(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('carrinho-badge');
  const total = totalItensCarrinho();
  if (total > 0) {
    badge.textContent = total;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderizarCarrinho() {
  const container = document.getElementById('carrinho-itens');
  const totalEl = document.getElementById('carrinho-total');
  const rodapeEl = document.getElementById('carrinho-rodape');

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
    rodapeEl.style.display = 'none';
    return;
  }

  rodapeEl.style.display = 'block';
  container.innerHTML = carrinho.map(item => `
    <div class="carrinho-item">
      <div class="carrinho-item-capa">${item.capa ? `<img src="${item.capa}" alt="${item.titulo}" />` : ''}</div>
      <div class="carrinho-item-info">
        <div class="carrinho-item-titulo">${item.titulo}</div>
        <div class="carrinho-item-autor">${item.autor}</div>
        <div class="carrinho-item-controles">
          <button type="button" onclick="alterarQuantidade('${item.id}', -1)" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantidade}</span>
          <button type="button" onclick="alterarQuantidade('${item.id}', 1)" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <div class="carrinho-item-direita">
        <span class="carrinho-item-preco">${formatarPrecoCentavos(item.precoCentavos * item.quantidade)}</span>
        <button type="button" class="carrinho-item-remover" onclick="removerDoCarrinho('${item.id}')">Remover</button>
      </div>
    </div>
  `).join('');

  totalEl.textContent = formatarPrecoCentavos(totalCentavosCarrinho());
}

function abrirCarrinho() {
  document.getElementById('carrinho-drawer').classList.add('aberto');
  document.getElementById('carrinho-overlay').classList.add('aberto');
  renderizarCarrinho();
}

function fecharCarrinho() {
  document.getElementById('carrinho-drawer').classList.remove('aberto');
  document.getElementById('carrinho-overlay').classList.remove('aberto');
}

// A finalização real (pagamento) entra na etapa do Stripe.
// Antes disso, garante que a pessoa está logada — o carrinho em si
// continua livre para qualquer visitante, sem exigir login.
async function finalizarCompra() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    fecharCarrinho();
    abrirModalAuth('login', 'checkout');
    return;
  }

  const botao = document.querySelector('.carrinho-finalizar');
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = 'Preparando pagamento...';

  try {
    const resposta = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`
      },
      body: JSON.stringify({
        itens: carrinho.map(item => ({ livroId: item.id, quantidade: item.quantidade }))
      })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.error || 'Não foi possível iniciar o pagamento.');
    }

    window.location.href = resultado.url; // leva para a página segura de pagamento do Stripe
  } catch (err) {
    console.error(err);
    botao.disabled = false;
    botao.textContent = textoOriginal;
    alert(err.message);
  }
}

// Estado inicial: descobre se já existe uma sessão (pessoa continuou logada
// de uma visita anterior) antes de carregar o carrinho certo.
supabaseClient.auth.getSession().then(({ data }) => {
  carrinhoIdentidadeAtual = data.session ? `user_${data.session.user.id}` : 'anon';
  carrinho = carregarCarrinhoDoStorage();

  // Se a pessoa acabou de voltar do pagamento no Stripe, trata o resultado
  const params = new URLSearchParams(window.location.search);
  if (params.get('compra') === 'sucesso') {
    carrinho = [];
    salvarCarrinho();
    alert('Compra realizada com sucesso! Obrigado por comprar na Ātma Vidyā.');
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (params.get('compra') === 'cancelada') {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  atualizarBadgeCarrinho();
});
