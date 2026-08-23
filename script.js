// ── DADOS DOS LIVROS ──
const livros = [
  {
    titulo: "Yoga Sūtras de Patañjali",
    autor: "Patañjali — trad. DeRose",
    categoria: "yoga",
    preco: "R$ 89,90",
    emoji: "📖",
    stripeLink: "#"
  },
  {
    titulo: "Bhagavad Gītā",
    autor: "Tradução comentada",
    categoria: "sagrado",
    preco: "R$ 69,90",
    emoji: "📿",
    stripeLink: "#"
  },
  {
    titulo: "Hatha Yoga Pradīpikā",
    autor: "Svātmārāma",
    categoria: "yoga",
    preco: "R$ 84,90",
    emoji: "🧘",
    stripeLink: "#"
  },
  {
    titulo: "Upanishads Selecionadas",
    autor: "Org. Swami Nikhilananda",
    categoria: "sagrado",
    preco: "R$ 94,90",
    emoji: "🌅",
    stripeLink: "#"
  },
  {
    titulo: "O Poder do Agora",
    autor: "Eckhart Tolle",
    categoria: "desenvolvimento",
    preco: "R$ 59,90",
    emoji: "🌿",
    stripeLink: "#"
  },
    {
    titulo: "The Divine Live Society",
    autor: "Vários autores",
    categoria: "hindu",
    preco: "FREE",
    capa: "shivananda.jpg",
    stripeLink: "https://www.dlshq.org/"
  },
    {
    titulo: "Ser Forte",
    autor: "DeRose",
    categoria: "derose",
    preco: "-",
    capa: "livro_capa_ser_forte_derose.png",
    stripeLink: "https://www.egregorabooks.com/livros/quando-e-preciso-ser-forte-44a-edicao"
  },
    {
    titulo: "Eu Me Lembro",
    autor: "DeRose",
    categoria: "derose",
    preco: "-",
    capa: "livro_capa_eu_me_lembro_derose.png",
    stripeLink: "https://www.egregorabooks.com/livros/eu-me-lembro"
  },
    {
    titulo: "Chakras, Kundaliní e Poderes paranormais",
    autor: "DeRose",
    categoria: "derose",
    preco: "-",
    capa: "livro_capa_chakras_derose.png",
    stripeLink: "https://www.egregorabooks.com/livros/chakras-kundalini-e-poderes-paranormais-3a-edicao"
  },
    {
    titulo: "Karma e Dharma",
    autor: "DeRose",
    categoria: "derose",
    preco: "-",
    capa: "livro_capa_karma_e_dharma_derose.png",
    stripeLink: "https://www.egregorabooks.com/livros/karma-e-dharma-3a-edicao"
  },




];

const categoriaLabel = {
  hindu: "Filosofia Hindu",
  yoga: "Yôga e Meditação",
  desenvolvimento: "Desenvolvimento Pessoal",
  sagrado: "Textos Sagrados",
  derose: "Método DeRose"
};

function renderLivros(lista) {
  const grid = document.getElementById('livros-grid');
  grid.innerHTML = lista.map(l => `
    <div class="livro-card">
      <div class="livro-capa">${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" />` : l.emoji}</div>
      <div class="livro-info">
        <span class="livro-cat">${categoriaLabel[l.categoria]}</span>
        <div class="livro-titulo">${l.titulo}</div>
        <div class="livro-autor">${l.autor}</div>
        <div class="livro-footer">
          <span class="livro-preco">${l.preco}</span>
          <a href="${l.stripeLink}" class="btn-comprar" target="_blank" rel="noopener">Comprar</a>
        </div>
      </div>
    </div>
  `).join('');
}

function filtrar(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const lista = cat === 'todos' ? livros : livros.filter(l => l.categoria === cat);
  renderLivros(lista);
}

// Renderiza todos ao carregar
renderLivros(livros);
