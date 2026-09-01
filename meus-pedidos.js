// ── PÁGINA "MEUS PEDIDOS" ──
// Depende de: supabaseClient (supabase-client.js), abrirModalAuth (auth.js)

const statusPedidoInfo = {
  pendente: { texto: 'Aguardando pagamento', classe: 'pedido-status-pendente' },
  pago: { texto: 'Pagamento confirmado', classe: 'pedido-status-pago' },
  cancelado: { texto: 'Cancelado', classe: 'pedido-status-cancelado' }
};

function formatarDataPedido(isoString) {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatarPrecoPedido(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function linhasEndereco(pedido) {
  let e = pedido.endereco_entrega || pedido.endereco || pedido.entrega || pedido.shipping || null;
  if (!e) return [];
  if (typeof e === 'string') {
    try { e = JSON.parse(e); } catch { return [e]; }
  }

  const nome = e.destinatario || e.nome || e.name || e.shipping_name || '';
  const rua = e.rua || e.logradouro || '';
  const numero = e.numero || e.number || '';
  const complemento = e.complemento || e.complement || '';
  const bairro = e.bairro || e.neighborhood || '';
  const linha1 = e.linha1 || e.endereco || e.address_line1 || e.line1
    || [rua, numero].filter(Boolean).join(', ');
  const linha2 = e.linha2 || e.address_line2 || e.line2
    || [complemento, bairro].filter(Boolean).join(' — ');
  const cidade = e.cidade || e.city || '';
  const uf = e.uf || e.estado || e.state || '';
  const cep = e.cep || e.postal_code || e.postalCode || '';
  const cidadeUf = [cidade, uf].filter(Boolean).join(' - ');
  const cepFmt = cep ? (cidadeUf ? `${cidadeUf}, ${cep}` : cep) : cidadeUf;
  return [nome, linha1, linha2, cepFmt].map(x => String(x || '').trim()).filter(Boolean);
}

function pedidoCardHtml(pedido, itensDoPedido) {
  const statusInfo = statusPedidoInfo[pedido.status] || { texto: pedido.status, classe: '' };
  const codigo = pedido.id.slice(0, 8).toUpperCase();
  const data = formatarDataPedido(pedido.criado_em);
  const destino = linhasEndereco(pedido);

  const enderecoHtml = destino.length
    ? destino.map(l => `<div>${l}</div>`).join('')
    : `<div class="pedido-endereco-vazio">Endereço de entrega ainda não registrado neste pedido.</div>`;

  const itensHtml = itensDoPedido.length
    ? itensDoPedido.map(item => `
        <div class="pedido-item">
          <div class="pedido-item-capa">${item.livros?.capa_url ? `<img src="${item.livros.capa_url}" alt="${item.livros.titulo}" />` : ''}</div>
          <div class="pedido-item-info">
            <div class="pedido-item-titulo">${item.livros?.titulo || 'Livro'}</div>
            <div class="pedido-item-autor">${item.livros?.autor || ''}</div>
            <div class="pedido-item-qtd">Quantidade: ${item.quantidade}</div>
          </div>
          <div class="pedido-item-preco">${formatarPrecoPedido(item.preco_unitario_centavos * item.quantidade)}</div>
        </div>
      `).join('')
    : `<p class="livros-status">Itens não encontrados.</p>`;

  return `
    <div class="pedido-card">
      <div class="pedido-cabecalho">
        <div class="pedido-numero">Pedido #${codigo} — ${data}</div>
        <span class="pedido-status ${statusInfo.classe}">${statusInfo.texto}</span>
      </div>
      <div class="pedido-bloco pedido-entrega">
        <div class="pedido-entrega-rotulo">Entregar para</div>
        <div class="pedido-entrega-texto">${enderecoHtml}</div>
      </div>
      <div class="pedido-itens">${itensHtml}</div>
      <div class="pedido-rodape">
        <span>Total</span>
        <span>${formatarPrecoPedido(pedido.total_centavos)}</span>
      </div>
    </div>
  `;
}

async function carregarPedidos() {
  const container = document.getElementById('pedidos-lista');
  if (!container) return;

  container.innerHTML = `<p class="livros-status">Carregando seus pedidos...</p>`;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) {
    container.innerHTML = `<p class="livros-status">Entre para ver seus pedidos.</p>`;
    abrirModalAuth('login', 'pedidos');
    return;
  }

  // RLS garante que só voltam os pedidos do próprio usuário logado
  const { data: pedidos, error: erroPedidos } = await supabaseClient
    .from('pedidos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (erroPedidos) {
    console.error('Erro ao buscar pedidos:', erroPedidos);
    container.innerHTML = `<p class="livros-status">Não foi possível carregar seus pedidos no momento.</p>`;
    return;
  }

  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `<p class="livros-status">Você ainda não fez nenhum pedido.</p>`;
    return;
  }

  const pedidoIds = pedidos.map(p => p.id);
  const { data: itens, error: erroItens } = await supabaseClient
    .from('itens_pedido')
    .select('*, livros(titulo, capa_url, autor)')
    .in('pedido_id', pedidoIds);

  if (erroItens) {
    console.error('Erro ao buscar itens dos pedidos:', erroItens);
  }

  const itensPorPedido = {};
  (itens || []).forEach(item => {
    if (!itensPorPedido[item.pedido_id]) itensPorPedido[item.pedido_id] = [];
    itensPorPedido[item.pedido_id].push(item);
  });

  container.innerHTML = pedidos
    .map(pedido => pedidoCardHtml(pedido, itensPorPedido[pedido.id] || []))
    .join('');
}

carregarPedidos();
