// ── CARRINHO DE COMPRAS ──
// Fase inicial: guardado no localStorage do navegador, ainda sem
// sincronizar com o Supabase. Cada item guarda uma cópia dos dados
// do livro no momento em que foi adicionado (título, autor, capa,
// preço), para o carrinho continuar correto mesmo que o catálogo
// mude depois.

const CARRINHO_STORAGE_KEY = 'atma_vidya_carrinho';

function carregarCarrinhoSalvo() {
  try {
    const raw = localStorage.getItem(CARRINHO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler carrinho salvo:', e);
    return [];
  }
}

let carrinho = carregarCarrinhoSalvo();

function salvarCarrinho() {
  localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(carrinho));
}

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
function finalizarCompra() {
  alert('A finalização de compra ainda não está disponível — essa é a próxima etapa do projeto (Stripe).');
}

// Estado inicial do ícone ao carregar a página (carrinho pode já ter itens salvos)
atualizarBadgeCarrinho();
