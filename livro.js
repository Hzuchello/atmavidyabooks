// ── PÁGINA DE DETALHE DO LIVRO ──
// Depende de: supabaseClient (supabase-client.js), mapLivroDoBanco,
// formatarPreco, getCategoriaLabel, livroCardHtml (script.js).

function getLivroIdDaUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function acaoHtmlDetalhe(l) {
  const precoFormatado = formatarPreco(l.precoCentavos);
  if (l.tipoVenda === 'externo') {
    return `<a href="${l.linkExterno}" class="btn-comprar" target="_blank" rel="noopener">Acessar</a>`;
  }
  if (precoFormatado === null) {
    return `<span class="btn-comprar btn-em-breve">Em breve</span>`;
  }
  return `<button class="btn-comprar" onclick="adicionarAoCarrinho('${l.id}')">Adicionar ao carrinho</button>`;
}

async function carregarDetalheLivro() {
  const container = document.getElementById('livro-detalhe');
  const id = getLivroIdDaUrl();

  if (!id) {
    container.innerHTML = `<p class="livros-status">Livro não encontrado.</p>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from('livros')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar o livro:", error);
    container.innerHTML = `<p class="livros-status">Livro não encontrado.</p>`;
    return;
  }

  const l = mapLivroDoBanco(data);
  document.title = `${l.titulo} — Ātma Vidyā`;

  const precoFormatado = formatarPreco(l.precoCentavos);

  container.innerHTML = `
    <div class="livro-detalhe-capa">
      ${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" />` : ""}
    </div>
    <div class="livro-detalhe-info">
      <span class="livro-cat">${getCategoriaLabel(l.categoria)}</span>
      <h1 class="livro-detalhe-titulo">${l.titulo}</h1>
      <p class="livro-detalhe-autor">${l.autor}</p>
      <p class="livro-detalhe-sinopse">${l.sinopse ? l.sinopse : "Sinopse em breve."}</p>
      <div class="livro-detalhe-acao">
        <span class="livro-preco">${precoFormatado ?? ""}</span>
        ${acaoHtmlDetalhe(l)}
      </div>
    </div>
  `;

  renderOutrosLivros(id);
}

async function renderOutrosLivros(idAtual) {
  const grid = document.getElementById('outros-livros-grid');
  if (!grid) return;

  const { data, error } = await supabaseClient
    .from('livros')
    .select('*')
    .neq('id', idAtual)
    .eq('disponivel', true)
    .limit(4);

  if (error || !data) return;

  grid.innerHTML = data.map(mapLivroDoBanco).map(livroCardHtml).join('');
}

carregarDetalheLivro();
