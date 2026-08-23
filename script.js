// ── DADOS DOS LIVROS ──
const livros = [
  {
    titulo: "Yôga Sútra de Pátañjali",
    autor: "DeRose",
    categoria: ["yoga", "derose"],
    preco: "R$ 49,65",
    capa: "yoga_sutra.jpg",
    stripeLink: "https://www.amazon.com.br/Y%C3%B4ga-S%C3%BAtra-P%C3%A1ta%C3%B1jali-DeRose/dp/8562617695/ref=sr_1_1?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=13W7702Z24WJ4&dib=eyJ2IjoiMSJ9.djCemAno1nclX81TBJhB24BwFaz7sQBiHI4VZBz7AKzYQeY-JHgTIHchc2t692PhxWGauA_j-DMsqEXmB_Nzdrrq-eKbFyZ3a9i97ohymoHzIxS7yPE84ajuVGQ0qSgnwJNC0-IetUGZAyPv0eNU-GVF5FR6MqvyUGLeIDxAoX6BCKqn-j_hU2h_IcCdPEhw1DfzfnvyyqzTNCvMgoY57aODl2Rb1AS9ryJssmG-NbO6ooel3WzNf4R0ZAfVYkfwy9Iwl3r3KSeVoXJyUqfvcpIKcyChH-yQCBTxddNoU5c.hOZ62M7WeYW1ObwNX2AytyvSZMp4w35QgmOil6zo_TI&dib_tag=se&keywords=derose&qid=1787514776&sprefix=deros%2Caps%2C223&sr=8-1"
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
  {
    titulo: "The Bhagavad Gita",
    autor: "Franklin Edgerton",
    categoria: "sagrado",
    preco: "R$ 531,00",
    capa: "bhagavad_gita.jpg",
    stripeLink: "#"
  },
  {
    titulo: "O Poder do Hábito",
    autor: "Charles Duhigg",
    categoria: "desenvolvimento",
    preco: "R$ 52,90",
    capa: "o_poder_do_habito.jpg",
    stripeLink: "#"
  },
  {
    titulo: "Flow: A Psicologia do alto desempenho e da felicidade",
    autor: "Mihaly Csikszentmihalyi",
    categoria: "desenvolvimento",
    preco: "R$ 51,49",
    capa: "flow.jpg",
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
];

const categoriaLabel = {
  hindu: "Filosofia Hindu",
  yoga: "Yôga e Meditação",
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

function renderLivros(lista) {
  const grid = document.getElementById('livros-grid');
  grid.innerHTML = lista.map(l => `
    <div class="livro-card">
      <div class="livro-capa">${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" />` : (l.emoji || "")}</div>
      <div class="livro-info">
        <span class="livro-cat">${getCategoriaLabel(l.categoria)}</span>
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
  const lista = cat === 'todos'
    ? livros
    : livros.filter(l => {
        const cats = Array.isArray(l.categoria) ? l.categoria : [l.categoria];
        return cats.includes(cat);
      });
  renderLivros(lista);
}

// Renderiza todos ao carregar
renderLivros(livros);
