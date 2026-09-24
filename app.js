/* Átma Vidyá Books — aplicação da livraria (demo) */

const STORAGE_CART = "atma.cart";
const STORAGE_AUTH = "atma.auth";

const BOOKS = [
  {
    id: 1,
    cat: "Yôga",
    title: "Yôga Sútras de Pátañjali — Edição Comentada",
    author: "Trad. e comentários: Henrique Zuchello",
    price: 79.9,
    big: "योग",
    featured: true,
    membersHook: true,
    synopsis: [
      "Tradução comentada, sútra a sútra, do texto fundamental do Yôga clássico. Cada verso é apresentado em dêvanágarí, transliteração e tradução literal, seguido de um comentário conciso que busca aproximar o leitor de língua portuguesa do ensinamento original, sem adicionar interpretações estranhas ao texto de Pátañjali.",
      "Indicado tanto para o primeiro contato com os Sútras quanto para o praticante que já estuda o texto e busca uma referência de consulta fiel e acessível."
    ],
    pages: "312 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-001-1"
  },
  {
    id: 2,
    cat: "Sámkhya",
    title: "Sámkhya Káriká — Os Fundamentos da Dualidade",
    author: "Íshwara Krishná — tradução Átma Vidyá",
    price: 64.9,
    big: "सांख्य",
    featured: true,
    membersHook: true,
    synopsis: [
      "O texto clássico que sistematiza a filosofia Sámkhya em setenta versos, apresentando o dualismo entre Púrusha e Prákriti, os três gúnas e a evolução dos vinte e cinco tattwas.",
      "Esta edição traz introdução contextual e notas explicativas, pensada como porta de entrada para quem deseja compreender a base filosófica sobre a qual o Yôga se apoia."
    ],
    pages: "168 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-002-8"
  },
  {
    id: 3,
    cat: "Vêdánta",
    title: "Bhágavad Gítá — O Canto do Senhor",
    author: "Vyása — tradução clássica revisada",
    price: 58.0,
    big: "गीता",
    featured: true,
    membersHook: false,
    synopsis: [
      "O diálogo entre Árjuna e Krishná no campo de batalha de Kurukshêtra, texto central do pensamento védico sobre dever, ação e desapego.",
      "Edição com introdução sobre o contexto do Mahábhárata e glossário dos principais termos sânscritos utilizados ao longo do texto."
    ],
    pages: "224 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-003-5"
  },
  {
    id: 4,
    cat: "Vêdánta",
    title: "Upanishádas Essenciais",
    author: "Diversos ríshis — seleção e tradução",
    price: 69.9,
    big: "उप",
    featured: false,
    membersHook: false,
    synopsis: [
      "Seleção comentada das Upanishádas mais estudadas — Ísha, Kêna, Kátha, Múndaka e Chándôgya — organizadas para leitura progressiva.",
      "Cada texto é precedido por uma breve introdução sobre seu contexto e principais temas, sem paráfrases que substituam a leitura direta."
    ],
    pages: "280 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-004-2"
  },
  {
    id: 5,
    cat: "Vêdánta",
    title: "Vivêka Chúdámani — A joia do discernimento",
    author: "Shánkara — tradução comentada",
    price: 72.0,
    big: "विवेक",
    featured: false,
    membersHook: false,
    synopsis: [
      "Texto atribuído a Shánkara sobre o discernimento (vivêka) entre o real e o transitório, pilar do Vêdánta Adwaita.",
      "Tradução acompanhada de comentário que situa o texto na prática contemplativa contemporânea, preservando o rigor filosófico do original."
    ],
    pages: "196 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-005-9"
  },
  {
    id: 6,
    cat: "Yôga",
    title: "Hatha Yôga Pradípiká",
    author: "Swátmáráma — tradução comentada",
    price: 66.5,
    big: "हठ",
    featured: false,
    membersHook: true,
    synopsis: [
      "Um dos textos clássicos mais importantes do Hatha Yôga, descrevendo ásanas, práticas de purificação, pránáyáma e os estágios da prática.",
      "Edição com notas técnicas sobre os termos sânscritos e sua aplicação na prática contemporânea, mantendo fidelidade ao texto tradicional."
    ],
    pages: "244 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-006-6"
  },
  {
    id: 7,
    cat: "Desenvolvimento Integral",
    title: "Caminhos do Dharma — Ética e vida integral",
    author: "Henrique Zuchello",
    price: 54.9,
    big: "धर्म",
    featured: true,
    membersHook: false,
    synopsis: [
      "Um ensaio sobre a ideia de dharma — o dever ou propósito próprio — como fio condutor para decisões cotidianas, escrito a partir do diálogo entre a filosofia védica e a vida contemporânea.",
      "Sem pretensão de manual de autoajuda, o texto propõe perguntas mais do que respostas prontas, convidando o leitor a examinar seu próprio caminho."
    ],
    pages: "142 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-007-3"
  },
  {
    id: 8,
    cat: "Desenvolvimento Integral",
    title: "Tantra Vivêka — Energia e consciência",
    author: "Henrique Zuchello",
    price: 61.0,
    big: "तंत्र",
    featured: false,
    membersHook: false,
    synopsis: [
      "Uma introdução sóbria ao Tantra como sistema filosófico e prático de integração entre corpo, energia e consciência, distante das simplificações populares do termo.",
      "O texto percorre os fundamentos históricos do Tantra e sua relação com o Yôga e o Sámkhya, propondo uma leitura integrada dessas tradições."
    ],
    pages: "158 páginas",
    format: "14×21cm, capa brochura",
    lang: "Português (Brasil)",
    isbn: "978-65-0000-008-0"
  }
];

const CATEGORIES = ["Yôga", "Sámkhya", "Filosofia Hindu"];

const VALID_VIEWS = [
  "home",
  "catalogo",
  "sankhya",
  "livro",
  "entrar",
  "criar-conta",
  "membros",
  "privacidade"
];

const COVER_CLASS = {
  Yôga: "c-yoga",
  Sámkhya: "c-sankhya",
  Vêdánta: "c-vedanta",
  "Desenvolvimento Integral": "c-dev",
  "Filosofia Hindu": "c-vedanta"
};

let state = {
  loggedIn: false,
  userName: "",
  userEmail: "",
  cart: {},
  activeFilter: "",
  searchQuery: "",
  currentBookId: null,
  chatOpen: false,
  cartOpen: false
};

function fmtPrice(v) {
  return "R$ " + v.toFixed(2).replace(".", ",");
}
function bookById(id) {
  return BOOKS.find((b) => b.id === Number(id));
}
function coverClass(cat) {
  return COVER_CLASS[cat] || "";
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_CART, JSON.stringify(state.cart));
    localStorage.setItem(
      STORAGE_AUTH,
      JSON.stringify({
        loggedIn: state.loggedIn,
        userName: state.userName,
        userEmail: state.userEmail
      })
    );
  } catch (e) {
    /* private mode */
  }
}

function hydrate() {
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_CART) || "{}");
    if (cart && typeof cart === "object") state.cart = cart;
    const auth = JSON.parse(localStorage.getItem(STORAGE_AUTH) || "null");
    if (auth && auth.loggedIn) {
      state.loggedIn = true;
      state.userName = auth.userName || "";
      state.userEmail = auth.userEmail || "";
    }
  } catch (e) {
    /* ignore */
  }
  applyAuthUI();
  updateCartBadge();
}

/* ================= ROUTER ================= */
function parseHash() {
  const raw = (location.hash || "#home").replace(/^#/, "") || "home";
  const [pathPart, queryPart] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  let view = parts[0] || "home";
  if (view === "book") view = "livro";
  const param = parts[1] ? decodeURIComponent(parts[1]) : null;
  const query = new URLSearchParams(queryPart || "");
  return { view, param, query };
}

function navigate(view, opts) {
  opts = opts || {};
  if (view && view.startsWith("#")) view = view.slice(1);

  if (view === "catalogo" || view.startsWith("catalogo")) {
    const filter = opts.filter || state.activeFilter;
    const q = opts.q !== undefined ? opts.q : state.searchQuery;
    let hash = "#catalogo";
    if (filter) hash += "/" + encodeURIComponent(filter);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    if (qs) hash += "?" + qs;
    location.hash = hash;
    return;
  }

  if (view.startsWith("livro")) {
    const id = opts.id || view.split("/")[1] || view.split("-")[1];
    location.hash = "#livro/" + id;
    return;
  }

  const name = view.split("/")[0];
  if (!VALID_VIEWS.includes(name)) {
    location.hash = "#home";
    return;
  }
  location.hash = "#" + name;
}

function navigateWithFilter(cat) {
  state.activeFilter = cat;
  state.searchQuery = "";
  navigate("catalogo", { filter: cat, q: "" });
}

function openBook(id) {
  navigate("livro/" + id, { id });
}

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const target = document.getElementById("view-" + name) || document.getElementById("view-home");
  target.classList.add("active");

  const navKey = name === "livro" ? "catalogo" : name;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === navKey);
  });

  window.scrollTo({ top: 0, behavior: "auto" });
}

function route() {
  const { view, param, query } = parseHash();

  if (view === "livro") {
    const id = parseInt(param, 10);
    showView("livro");
    renderBookDetail(id);
    return;
  }

  if (view === "catalogo") {
    if (param && CATEGORIES.includes(param)) state.activeFilter = param;
    else if (query.get("cat") && CATEGORIES.includes(query.get("cat"))) {
      state.activeFilter = query.get("cat");
    } else if (!param) {
      state.activeFilter = "";
    }
    if (query.get("q") !== null) state.searchQuery = query.get("q") || "";
    showView("catalogo");
    renderChips();
    renderCatalog();
    const search = document.getElementById("catalogSearch");
    if (search) search.value = state.searchQuery;
    return;
  }

  const name = VALID_VIEWS.includes(view) ? view : "home";
  showView(name);
  if (name === "home") renderFeatured();
  if (name === "membros") renderMembers();
}

window.addEventListener("hashchange", route);

/* ================= CATALOG ================= */
function filteredBooks() {
  let items =
    !state.activeFilter
      ? BOOKS.slice()
      : BOOKS.filter((b) =>
          state.activeFilter === "Filosofia Hindu"
            ? b.cat === "Filosofia Hindu" || b.cat === "Vêdánta" || b.cat === "Desenvolvimento Integral"
            : b.cat === state.activeFilter
        );
  const q = (state.searchQuery || "").trim().toLowerCase();
  if (q) {
    items = items.filter((b) =>
      (b.title + " " + b.author + " " + b.cat + " " + b.synopsis.join(" ")).toLowerCase().includes(q)
    );
  }
  return items;
}

function renderChips() {
  const row = document.getElementById("chipRow");
  if (!row) return;
  row.innerHTML = CATEGORIES.map(
    (c) =>
      `<button class="chip ${c === state.activeFilter ? "active" : ""}" type="button" onclick="setFilter('${c}')">${c}</button>`
  ).join("");
}

function setFilter(cat) {
  state.activeFilter = state.activeFilter === cat ? "" : cat;
  navigate("catalogo", { filter: state.activeFilter, q: state.searchQuery });
}

function onSearchInput(ev) {
  state.searchQuery = ev.target.value;
  renderCatalog();
}

function onSearchCommit() {
  navigate("catalogo", { filter: state.activeFilter, q: state.searchQuery });
}

function bookCardHTML(b) {
  return `
    <article class="book-card" role="link" tabindex="0" onclick="openBook(${b.id})" onkeydown="if(event.key==='Enter')openBook(${b.id})">
      <div class="book-cover ${coverClass(b.cat)}">
        <div class="glyph"><span class="big">${b.big}</span>${b.cat}</div>
      </div>
      <div class="book-info">
        <div class="title">${escapeHtml(b.title)}</div>
        <div class="author">${escapeHtml(b.author)}</div>
        <div class="row">
          <span class="price">${fmtPrice(b.price)}</span>
          <button class="add-btn" type="button" onclick="event.stopPropagation(); addToCart(${b.id});" aria-label="Adicionar ${escapeHtml(b.title)} ao carrinho">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

function renderCatalog() {
  const grid = document.getElementById("bookGrid");
  const meta = document.getElementById("catalogMeta");
  if (!grid) return;
  const items = filteredBooks();
  if (!items.length) {
    grid.innerHTML = "";
    if (meta) meta.textContent = "Nenhum título encontrado.";
    grid.insertAdjacentHTML(
      "afterend",
      document.getElementById("catalogEmpty")
        ? ""
        : ""
    );
    const empty = document.getElementById("catalogEmpty");
    if (empty) empty.hidden = false;
    return;
  }
  const empty = document.getElementById("catalogEmpty");
  if (empty) empty.hidden = true;
  grid.innerHTML = items.map(bookCardHTML).join("");
  if (meta) {
    const filtro = state.activeFilter === "Todos" ? "no catálogo" : "em " + state.activeFilter;
    const busca = state.searchQuery ? ` para “${state.searchQuery}”` : "";
    meta.textContent = `${items.length} ${items.length === 1 ? "título" : "títulos"} ${filtro}${busca}.`;
  }
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  grid.innerHTML = BOOKS.filter((b) => b.featured)
    .slice(0, 4)
    .map(bookCardHTML)
    .join("");
}

function renderBookDetail(id) {
  const b = bookById(id);
  const mount = document.getElementById("bookDetailGrid");
  if (!b || !mount) {
    navigate("catalogo");
    return;
  }
  state.currentBookId = id;
  window._pendingQty = 1;
  const crumb = document.getElementById("bookCrumb");
  if (crumb) crumb.textContent = b.title;
  const related = BOOKS.filter((x) => x.cat === b.cat && x.id !== b.id).slice(0, 3);

  mount.innerHTML = `
    <div class="detail-cover ${coverClass(b.cat)}">
      <div class="glyph"><span class="big">${b.big}</span>${escapeHtml(b.title.split(" — ")[0])}</div>
    </div>
    <div class="detail-info">
      <span class="category-tag">${escapeHtml(b.cat)}</span>
      <h1>${escapeHtml(b.title)}</h1>
      <div class="author">${escapeHtml(b.author)}</div>
      <div class="price-row">
        <span class="price">${fmtPrice(b.price)}</span>
        <div class="qty-stepper">
          <button type="button" onclick="stepQty(-1)" aria-label="Diminuir">−</button>
          <span id="qtyDisplay">1</span>
          <button type="button" onclick="stepQty(1)" aria-label="Aumentar">+</button>
        </div>
        <button class="btn btn-red" type="button" onclick="addToCart(${b.id}, true)">Adicionar ao carrinho</button>
      </div>
      <div class="synopsis">${b.synopsis.map((p) => `<p>${p}</p>`).join("")}</div>
      <div class="meta-list">
        <div><span>Páginas</span><b>${escapeHtml(b.pages)}</b></div>
        <div><span>Formato</span><b>${escapeHtml(b.format)}</b></div>
        <div><span>Idioma</span><b>${escapeHtml(b.lang)}</b></div>
        <div><span>ISBN</span><b>${escapeHtml(b.isbn)}</b></div>
      </div>
      ${
        b.membersHook
          ? `<div class="members-cta">
              <p><b>Para membros:</b> comentário ampliado e aula gravada sobre este texto na área reservada.</p>
              <button class="btn btn-dark-outline btn-sm" type="button" onclick="navigate('membros')">Área de membros</button>
            </div>`
          : ""
      }
    </div>`;

  const relatedWrap = document.getElementById("bookRelated");
  if (relatedWrap) {
    if (!related.length) {
      relatedWrap.hidden = true;
      relatedWrap.innerHTML = "";
    } else {
      relatedWrap.hidden = false;
      relatedWrap.innerHTML = `
        <h3>Também em ${escapeHtml(b.cat)}</h3>
        <div class="related-grid">${related.map(bookCardHTML).join("")}</div>`;
    }
  }
}

function stepQty(delta) {
  const el = document.getElementById("qtyDisplay");
  if (!el) return;
  const v = Math.max(1, parseInt(el.textContent, 10) + delta);
  el.textContent = v;
  window._pendingQty = v;
}

/* ================= CART ================= */
function addToCart(id, fromDetail) {
  const qty = fromDetail
    ? window._pendingQty || parseInt(document.getElementById("qtyDisplay")?.textContent || "1", 10)
    : 1;
  state.cart[id] = (state.cart[id] || 0) + qty;
  window._pendingQty = null;
  persist();
  updateCartBadge();
  renderCartDrawer();
  const b = bookById(id);
  toast(`“${b.title}” adicionado ao carrinho.`);
}

function setCartQty(id, qty) {
  qty = Math.max(0, qty);
  if (qty === 0) delete state.cart[id];
  else state.cart[id] = qty;
  persist();
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(id) {
  delete state.cart[id];
  persist();
  updateCartBadge();
  renderCartDrawer();
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + b, 0);
}
function cartTotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const b = bookById(id);
    return b ? sum + b.price * qty : sum;
  }, 0);
}
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const n = cartCount();
  badge.textContent = n;
  badge.style.display = n > 0 ? "flex" : "none";
}

function toggleCart(force) {
  state.cartOpen = force === undefined ? !state.cartOpen : !!force;
  document.getElementById("cart-drawer").classList.toggle("open", state.cartOpen);
  document.getElementById("overlay").classList.toggle("show", state.cartOpen || document.getElementById("navLinks").classList.contains("open"));
  document.body.style.overflow = state.cartOpen ? "hidden" : "";
  if (state.cartOpen) {
    renderCartDrawer();
    closeMenu();
  }
}

function renderCartDrawer() {
  const body = document.getElementById("cartBody");
  const foot = document.getElementById("cartFoot");
  if (!body) return;
  const entries = Object.entries(state.cart);
  if (!entries.length) {
    body.innerHTML = `<div class="cart-empty">
      <p>Seu cesto ainda está vazio.</p>
      <button class="btn btn-dark-outline" type="button" onclick="toggleCart(false); navigate('catalogo')">Explorar o catálogo</button>
    </div>`;
    foot.hidden = true;
    return;
  }
  foot.hidden = false;
  body.innerHTML = entries
    .map(([id, qty]) => {
      const b = bookById(id);
      if (!b) return "";
      return `<div class="cart-line-item">
        <div class="cart-thumb">${b.big}</div>
        <div class="info">
          <div class="t">${escapeHtml(b.title)}</div>
          <div class="a">${escapeHtml(b.author)}</div>
          <div class="controls">
            <div class="qty-stepper">
              <button type="button" onclick="setCartQty(${b.id}, ${qty - 1})" aria-label="Diminuir">−</button>
              <span>${qty}</span>
              <button type="button" onclick="setCartQty(${b.id}, ${qty + 1})" aria-label="Aumentar">+</button>
            </div>
            <button class="remove" type="button" onclick="removeFromCart(${b.id})">remover</button>
          </div>
        </div>
        <div class="sub">${fmtPrice(b.price * qty)}</div>
      </div>`;
    })
    .join("");
  document.getElementById("cartTotal").textContent = fmtPrice(cartTotal());
}

function checkoutDemo() {
  if (!cartCount()) {
    toast("Adicione um livro antes de finalizar.");
    return;
  }
  if (!state.loggedIn) {
    toggleCart(false);
    toast("Entre na sua conta para simular o checkout.");
    navigate("entrar");
    return;
  }
  toast("Checkout simulado — a integração com Stripe será ativada em breve.");
}

/* ================= AUTH ================= */
function applyAuthUI() {
  const greet = document.getElementById("greetingText");
  const loginIcon = document.getElementById("loginIcon");
  const logoutIcon = document.getElementById("logoutIcon");
  if (state.loggedIn) {
    greet.style.display = "inline";
    greet.innerHTML = `Olá, <b>${escapeHtml(state.userName)}</b>`;
    loginIcon.style.display = "none";
    logoutIcon.style.display = "flex";
  } else {
    greet.style.display = "none";
    loginIcon.style.display = "flex";
    logoutIcon.style.display = "none";
  }
}

function submitLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const name = email.split("@")[0] || "Leitor";
  doLogin(name, email);
}

function submitSignup(e) {
  e.preventDefault();
  const nome = document.getElementById("suNome").value.trim();
  const email = document.getElementById("suEmail").value.trim();
  const s1 = document.getElementById("suSenha").value;
  const s2 = document.getElementById("suSenha2").value;
  if (s1 !== s2) {
    toast("As senhas não coincidem.");
    return;
  }
  doLogin(nome.split(" ")[0], email);
}

function doLogin(name, email) {
  state.loggedIn = true;
  state.userName = name.charAt(0).toUpperCase() + name.slice(1);
  state.userEmail = email || "";
  persist();
  applyAuthUI();
  toast(`Bem-vindo(a), ${state.userName}. Sessão guardada neste navegador.`);
  navigate("home");
  resetChatForAuthState();
}

function doLogout() {
  state.loggedIn = false;
  state.userName = "";
  state.userEmail = "";
  persist();
  applyAuthUI();
  toast("Você saiu da sua conta.");
  navigate("home");
  resetChatForAuthState();
}

/* ================= MEMBERS ================= */
function renderMembers() {
  const el = document.getElementById("membersContent");
  if (!el) return;
  if (!state.loggedIn) {
    el.innerHTML = `
      <div class="locked-panel">
        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="10" width="16" height="10" rx="1"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>
        <h2>Conteúdo exclusivo para membros</h2>
        <p>Entre ou crie sua conta para acessar comentários exclusivos, aulas gravadas e materiais de aprofundamento reservados a assinantes.</p>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" onclick="navigate('entrar')">Entrar</button>
          <button class="btn btn-outline" type="button" onclick="navigate('criar-conta')">Criar conta</button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="member-welcome">
        <div><h2>Bem-vindo(a), ${escapeHtml(state.userName)}</h2><p>Seu acesso de membro está ativo — ambiente de demonstração.</p></div>
        <button class="btn btn-outline" style="border-color:rgba(244,236,218,.35); color:var(--cream);" type="button" onclick="navigate('catalogo')">Ver catálogo</button>
      </div>
      <div class="member-grid">
        <div class="member-card"><span class="tag">MEMBRO</span><h4>Comentário exclusivo: sútra I.2</h4><p>Leitura aprofundada do segundo sútra dos Yôga Sútras, além do que está publicado na edição comentada.</p></div>
        <div class="member-card"><span class="tag">MEMBRO</span><h4>Aula gravada: introdução ao Sámkhya</h4><p>Aula de 40 minutos sobre Púrusha, Prákriti e os três gúnas, com exemplos práticos.</p></div>
        <div class="member-card"><span class="tag">MEMBRO</span><h4>Roda de estudo mensal</h4><p>Encontro on-line mensal de leitura comentada, aberto a perguntas dos membros.</p></div>
      </div>`;
  }
}

function submitNewsletter(e) {
  e.preventDefault();
  e.target.reset();
  toast("Inscrição confirmada. Em breve você receberá novidades da Átma Vidyá Books.");
}

/* ================= MENU ================= */
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  document.getElementById("overlay").classList.toggle("show", open || state.cartOpen);
}
function closeMenu() {
  document.getElementById("navLinks").classList.remove("open");
  if (!state.cartOpen) document.getElementById("overlay").classList.remove("show");
}
function onOverlayClick() {
  closeMenu();
  toggleCart(false);
  closeContact();
}

function openContact() {
  closeMenu();
  const modal = document.getElementById("contact-modal");
  const form = document.getElementById("contactForm");
  const ok = document.getElementById("contactOk");
  form.hidden = false;
  form.reset();
  ok.hidden = true;
  const hint = document.getElementById("contactHint");
  if (hint) hint.hidden = true;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const first = document.getElementById("ctNome");
  if (first) first.focus();
}

function closeContact() {
  const modal = document.getElementById("contact-modal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

function submitContact(e) {
  e.preventDefault();
  const form = document.getElementById("contactForm");
  const ok = document.getElementById("contactOk");
  const hint = document.getElementById("contactHint");
  const nome = (document.getElementById("ctNome").value || "").trim();
  const whats = (document.getElementById("ctWhats").value || "").trim();
  const email = (document.getElementById("ctEmail").value || "").trim();
  const motivo = (document.getElementById("ctMotivo").value || "").trim();
  if (!nome || !motivo) return;
  if (!whats && !email) {
    if (hint) hint.hidden = false;
    return;
  }
  if (hint) hint.hidden = true;
  form.hidden = true;
  ok.hidden = false;
}

/* ================= ÔJAS BOT ================= */
function toggleChat(forceOpen) {
  const panel = document.getElementById("ojas-panel");
  state.chatOpen = forceOpen === undefined ? !state.chatOpen : forceOpen;
  panel.classList.toggle("open", state.chatOpen);
  document.getElementById("chatDot").style.display = "none";
  if (state.chatOpen && !window._chatInit) {
    initChat();
    window._chatInit = true;
  }
}

function appendMsg(sender, html) {
  const body = document.getElementById("ojasBody");
  const div = document.createElement("div");
  div.className = "msg " + sender;
  div.innerHTML = html;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function setChips(list) {
  document.getElementById("ojasChips").innerHTML = list
    .map((l) => `<button class="qchip" type="button" onclick="handleQuickReply('${l.replace(/'/g, "\\'")}')">${l}</button>`)
    .join("");
}

function initChat() {
  document.getElementById("ojasBody").innerHTML = "";
  if (!state.loggedIn) {
    document.getElementById("ojasStatus").textContent = "Atendimento — visitante";
    appendMsg(
      "bot",
      "Olá. Eu sou o Ôjas Bot. Posso esclarecer o Sámkhya, prazos, pagamentos ou o catálogo. Como posso ajudar?"
    );
    setChips(["O que é Sámkhya?", "Formas de pagamento", "Prazo de entrega", "Sobre a área de membros"]);
  } else {
    document.getElementById("ojasStatus").textContent = "Atendimento — " + state.userName;
    appendMsg("bot", `Olá, ${escapeHtml(state.userName)}. Posso ajudar com o pedido ou com o estudo. O que você precisa?`);
    setChips(["Ver meu carrinho", "Formas de pagamento", "Preciso de ajuda com um pedido"]);
  }
}

function resetChatForAuthState() {
  window._chatInit = false;
  if (state.chatOpen) initChat();
}

const FAQ = {
  "o que é sámkhya?":
    "O Sámkhya é uma das seis escolas clássicas da filosofia indiana. Propõe a dualidade entre Púrusha (a consciência) e Prákriti (a natureza), e é a base filosófica sobre a qual o Yôga de Pátañjali se apoia. Temos uma página inteira sobre o tema — quer que eu te leve até lá?",
  "formas de pagamento":
    "Aceitamos cartão de crédito, débito e Pix, processados com segurança via Stripe. A finalização de compra estará disponível assim que a integração de pagamentos for concluída.",
  "prazo de entrega":
    "Livros físicos são enviados em até 2 dias úteis após a confirmação do pagamento, com prazo de entrega dependendo da sua região — normalmente entre 5 e 12 dias úteis.",
  "sobre a área de membros":
    "A área de membros reúne comentários exclusivos, aulas gravadas e uma roda de estudo mensal. É preciso ter uma conta para acessar o conteúdo — posso te levar até a página de criação de conta.",
  "preciso de ajuda com um pedido":
    "Claro. Se o pedido já foi realizado, me diga o número ou o e-mail usado na compra e, assim que a integração com o sistema de pedidos estiver ativa, poderei consultar o status por aqui."
};

function handleQuickReply(text) {
  appendMsg("user", text);
  const key = text.toLowerCase();

  if (key === "ver meu carrinho") {
    toggleChat(false);
    toggleCart(true);
    return;
  }
  if (key === "o que é sámkhya?") {
    setTimeout(() => {
      appendMsg("bot", FAQ["o que é sámkhya?"]);
      setChips(["Ir para a página do Sámkhya", "Formas de pagamento", "Prazo de entrega"]);
    }, 300);
    return;
  }
  if (key === "ir para a página do sámkhya") {
    toggleChat(false);
    navigate("sankhya");
    return;
  }
  if (FAQ[key]) {
    setTimeout(() => {
      appendMsg("bot", FAQ[key]);
      setChips(
        state.loggedIn
          ? ["Ver meu carrinho", "Formas de pagamento"]
          : ["O que é Sámkhya?", "Formas de pagamento", "Prazo de entrega"]
      );
    }, 300);
    return;
  }
  setTimeout(() => {
    appendMsg(
      "bot",
      "Ainda estou aprendendo a responder isso automaticamente — em breve, com a integração via n8n, poderei ajudar de forma mais completa. Por ora, use as sugestões abaixo."
    );
    setChips(
      state.loggedIn
        ? ["Ver meu carrinho", "Formas de pagamento"]
        : ["O que é Sámkhya?", "Formas de pagamento", "Prazo de entrega"]
    );
  }, 300);
}

function sendFreeText(e) {
  e.preventDefault();
  const input = document.getElementById("ojasInput");
  const val = input.value.trim();
  if (!val) return false;
  appendMsg("user", val);
  input.value = "";
  const key = val.toLowerCase();
  if (FAQ[key]) {
    setTimeout(() => appendMsg("bot", FAQ[key]), 300);
  } else {
    setTimeout(() => {
      appendMsg(
        "bot",
        "Obrigado pela mensagem. Esta é uma versão de demonstração do Ôjas Bot — em breve, com a integração via n8n, poderei responder perguntas livres com mais precisão. Por enquanto, use os botões de sugestão."
      );
      setChips(
        state.loggedIn
          ? ["Ver meu carrinho", "Formas de pagamento"]
          : ["O que é Sámkhya?", "Formas de pagamento", "Prazo de entrega"]
      );
    }, 300);
  }
  return false;
}

/* ================= INIT ================= */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    toggleCart(false);
    toggleChat(false);
    closeMenu();
    closeContact();
  }
});

hydrate();
renderChips();
renderCatalog();
renderFeatured();
route();
setTimeout(() => {
  const dot = document.getElementById("chatDot");
  if (dot) dot.style.display = "block";
}, 2500);
