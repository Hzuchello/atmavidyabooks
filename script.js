// ── DADOS DOS LIVROS ──
// O catálogo vem do Supabase (tabela "livros"). A variável abaixo é
// preenchida depois que a busca no banco terminar, e fica disponível
// globalmente (usada também por cart.js e livro.js).
let livros = [];

const categoriaLabel = {
  hindu: "Filosofia Hindu",
  yoga: "Yôga",
  desenvolvimento: "Desenvolvimento Pessoal",
  sagrado: "Textos Sagrados",
  derose: "Método DeRose"
};

function getCategoriaLabel(categoria) {
  const cats = Array.isArray(categoria) ? categoria : [categoria];
  return cats
    .map(c => categoriaLabel[c] || c)
    .join(" · ");
}

// Converte o registro que vem do banco (em português, snake_case)
// para o formato que o restante do código já usa.
function mapLivroDoBanco(l) {
  return {
    id: l.id,
    titulo: l.titulo,
    autor: l.autor,
    categoria: l.categorias,
    capa: l.capa_url,
    precoCentavos: l.preco_centavos, // null = "Em breve" | 0 = grátis | >0 = preço normal
    tipoVenda: l.tipo_venda,         // "proprio" ou "externo"
    linkExterno: l.link_externo,
    sinopse: l.sinopse,
    destaque: l.destaque
  };
}

function formatarPreco(precoCentavos) {
  if (precoCentavos === null || precoCentavos === undefined) return null; // sem preço ainda
  if (precoCentavos === 0) return "Grátis";
  return (precoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Monta o HTML de um único card de livro. Usado tanto no catálogo
// quanto na seção de destaques e em "outros livros" (na página de detalhe).
// Só a capa/título/autor são clicáveis (levam à página do livro);
// o botão de ação fica fora do link, para não conflitar com o clique.
function livroCardHtml(l) {
  const precoFormatado = formatarPreco(l.precoCentavos);

  let acaoHtml;
  if (l.tipoVenda === 'externo') {
    // Exceção: link de recurso externo (ex: Divine Life Society), não é venda própria
    acaoHtml = `<a href="${l.linkExterno}" class="btn-comprar" target="_blank" rel="noopener">Acessar</a>`;
  } else if (precoFormatado === null) {
    // Ainda sem preço definido: nenhuma ação disponível
    acaoHtml = `<span class="btn-comprar btn-em-breve">Em breve</span>`;
  } else {
    acaoHtml = `<button class="btn-comprar" onclick="adicionarAoCarrinho('${l.id}')">Adicionar ao carrinho</button>`;
  }

  return `
    <div class="livro-card">
      <a href="livro.html?id=${l.id}" class="livro-link">
        <div class="livro-capa">${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" />` : ""}</div>
        <div class="livro-info-topo">
          <span class="livro-cat">${getCategoriaLabel(l.categoria)}</span>
          <div class="livro-titulo">${l.titulo}</div>
          <div class="livro-autor">${l.autor}</div>
        </div>
      </a>
      <div class="livro-footer-wrap">
        <div class="livro-footer">
          <span class="livro-preco">${precoFormatado ?? ""}</span>
          ${acaoHtml}
        </div>
      </div>
    </div>
  `;
}

function renderLivros(lista) {
  const grid = document.getElementById('livros-grid');
  if (!grid) return; // esta página pode não ter o catálogo completo (ex: livro.html)
  grid.innerHTML = lista.map(livroCardHtml).join('');
}

function renderDestaques(lista) {
  const grid = document.getElementById('destaques-grid');
  if (!grid) return; // só existe na página inicial

  const destaques = lista.filter(l => l.destaque).slice(0, 4);
  grid.innerHTML = destaques.length
    ? destaques.map(livroCardHtml).join('')
    : `<p class="livros-status">Nenhum livro em destaque no momento.</p>`;
}

function filtrar(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const lista = cat === 'todos'
    ? livros
    : livros.filter(l => {
        const cats = Array.isArray(l.categoria) ? l.categoria : [l.categoria];
        return cats.includes(cat);
      });
  renderLivros(lista);
}

// Busca o catálogo no Supabase e renderiza assim que os dados chegarem.
// Preenche a variável global `livros`, usada também em outras páginas
// (ex: cart.js precisa dela para saber o preço ao adicionar ao carrinho).
async function carregarLivros() {
  const grid = document.getElementById('livros-grid');
  if (grid) grid.innerHTML = `<p class="livros-status">Carregando catálogo...</p>`;

  const { data, error } = await supabaseClient
    .from('livros')
    .select('*')
    .eq('disponivel', true)
    .order('criado_em', { ascending: true });

  if (error) {
    console.error("Erro ao buscar livros no Supabase:", error);
    if (grid) grid.innerHTML = `<p class="livros-status">Não foi possível carregar o catálogo no momento.</p>`;
    return;
  }

  livros = data.map(mapLivroDoBanco);
  renderLivros(livros);
  renderDestaques(livros);
}

carregarLivros();
