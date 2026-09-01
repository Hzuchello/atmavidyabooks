// ── MOBILE: CATÁLOGO COMO PÁGINA PRINCIPAL ──
// Em telas de até 860px, tanto abrir o site quanto clicar em
// "Início" (logo ou menu) levam direto ao catálogo — o Hero/carrossel
// deixa de ser um destino de navegação no mobile. No desktop, nada muda.
(function configurarInicioMobile() {
  const ehMobile = window.innerWidth <= 860;
  if (!ehMobile) return;

  // Carga inicial: se não veio nenhum destino específico na URL, já entra no catálogo
  const temHashExplicito = window.location.hash && window.location.hash !== '#catalogo';
  if (!temHashExplicito) {
    window.location.hash = 'catalogo';
  }

  // Qualquer link que apontaria para o Hero ("#home" ou "index.html#home")
  // passa a apontar para o catálogo também
  document.querySelectorAll('a[href$="#home"]').forEach(link => {
    link.setAttribute('href', link.getAttribute('href').replace(/#home$/, '#catalogo'));
  });
})();

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
    sinopseBanner: l.sinopse_banner,
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

// Monta os slides 2-5 do carrossel (um por livro em destaque), e os
// pontos de navegação correspondentes. O slide 1 (capa institucional)
// já existe fixo no HTML.
function montarSlidesDestaque(lista) {
  const container = document.getElementById('carrossel-slides');
  const dotsContainer = document.getElementById('carrossel-dots');
  if (!container || !dotsContainer) return; // só existe na página inicial

  const destaques = lista.filter(l => l.destaque).slice(0, 4);

  destaques.forEach((l, indice) => {
    const lado = indice % 2 === 0 ? 'esquerda' : 'direita'; // 1º destaque: capa à esquerda; 2º: à direita; e assim por diante
    const sinopseTexto = l.sinopseBanner ? l.sinopseBanner : 'Sinopse em breve.';

    const slide = document.createElement('div');
    slide.className = `slide slide-livro slide-livro-${lado}`;
    slide.innerHTML = `
      <div class="slide-livro-capa-col">
        ${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" />` : ""}
      </div>
      <div class="slide-livro-texto-col">
        <span class="slide-livro-eyebrow">Destaque</span>
        <h2 class="slide-livro-titulo">${l.titulo}</h2>
        <p class="slide-livro-autor">${l.autor}</p>
        <p class="slide-livro-sinopse">${sinopseTexto}</p>
        <a href="livro.html?id=${l.id}" class="slide-livro-btn">Conferir</a>
      </div>
    `;
    container.appendChild(slide);
  });

  // Recria os pontos de navegação, um por slide (institucional + destaques)
  const totalSlides = container.querySelectorAll('.slide').length;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (i === 0 ? ' ativo' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.onclick = () => irParaSlide(i);
    dotsContainer.appendChild(dot);
  }

  reiniciarAutoplayCarrossel();
}

// ── CONTROLE DO CARROSSEL ──
let carrosselIndiceAtual = 0;
let carrosselTimer = null;

function irParaSlide(indice) {
  const slides = document.querySelectorAll('#carrossel-slides .slide');
  const dots = document.querySelectorAll('#carrossel-dots .dot');
  if (!slides.length) return;

  carrosselIndiceAtual = (indice + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('ativo', i === carrosselIndiceAtual));
  dots.forEach((d, i) => d.classList.toggle('ativo', i === carrosselIndiceAtual));

  reiniciarAutoplayCarrossel();
}

function proximoSlideCarrossel() {
  irParaSlide(carrosselIndiceAtual + 1);
}

// Reinicia a contagem de 8s sempre que o slide muda (automático ou manual),
// para não trocar de novo logo em seguida de um clique nas bolinhas.
function reiniciarAutoplayCarrossel() {
  if (carrosselTimer) clearInterval(carrosselTimer);
  carrosselTimer = setInterval(proximoSlideCarrossel, 8000);
}

// ── BUSCA (navbar) ──
function normalizarBusca(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buscarLivro() {
  const input = document.getElementById('busca-input');
  const termo = normalizarBusca((input?.value || '').trim());

  const resultado = termo
    ? livros.filter(l =>
        normalizarBusca(l.titulo).includes(termo) || normalizarBusca(l.autor).includes(termo)
      )
    : livros;

  renderLivros(resultado);
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
}

// ── MENU MOBILE (hambúrguer) ──
function alternarMenuMobile() {
  const links = document.getElementById('nav-links');
  const btn = document.getElementById('nav-menu-btn');
  if (!links || !btn) return;

  const abrir = !links.classList.contains('aberto');
  links.classList.toggle('aberto', abrir);
  btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
}

// Fecha o menu mobile automaticamente ao clicar em qualquer link dele
document.addEventListener('click', event => {
  if (event.target.closest('#nav-links a')) {
    const links = document.getElementById('nav-links');
    const btn = document.getElementById('nav-menu-btn');
    links?.classList.remove('aberto');
    btn?.setAttribute('aria-expanded', 'false');
  }
});

// ── FILTROS (dropdown mobile) ──
function alternarFiltrosMobile() {
  const cascade = document.getElementById('filtros-cascade');
  const toggle = document.getElementById('filtros-toggle');
  if (!cascade || !toggle) return;

  const abrir = !cascade.classList.contains('aberto');
  cascade.classList.toggle('aberto', abrir);
  toggle.setAttribute('aria-expanded', abrir ? 'true' : 'false');
}

function filtrar(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');

  // Atualiza o rótulo do dropdown mobile e fecha o menu, se estiver aberto
  const atual = document.getElementById('filtros-atual');
  if (atual) atual.textContent = btn.textContent;
  const cascade = document.getElementById('filtros-cascade');
  if (cascade) {
    cascade.classList.remove('aberto');
    document.getElementById('filtros-toggle')?.setAttribute('aria-expanded', 'false');
  }

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
  montarSlidesDestaque(livros);
}

carregarLivros();

function alternarNewsletter() {
  const form = document.getElementById('form-newsletter');
  if (!form) return;
  form.hidden = !form.hidden;
}

function enviarNewsletter(event) {
  event.preventDefault();
  const nome = document.getElementById('news-nome')?.value.trim();
  const email = document.getElementById('news-email')?.value.trim();
  const telefone = document.getElementById('news-telefone')?.value.trim();
  const status = document.getElementById('news-status');
  if (!nome || !email || !telefone) return;

  const lista = JSON.parse(localStorage.getItem('atma-newsletter') || '[]');
  lista.push({ nome, email, telefone, em: new Date().toISOString() });
  localStorage.setItem('atma-newsletter', JSON.stringify(lista));

  if (status) status.textContent = 'Recebemos seus dados. Em breve a lista entra no servidor.';
  event.target.reset();
}
