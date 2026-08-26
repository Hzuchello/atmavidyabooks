// /api/create-checkout-session.js
// Function que roda no servidor da Vercel (nunca no navegador).
// Recebe os itens do carrinho, confere o preço real no Supabase
// (nunca confia no preço vindo do navegador), cria um pedido
// "pendente" no banco, e gera a sessão de pagamento no Stripe.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    // 1) Confirma quem é o usuário logado, a partir do token enviado pelo site
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'É necessário estar logado para finalizar a compra.' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
    }
    const usuario = userData.user;

    // 2) Valida os itens recebidos
    const { itens } = req.body || {};
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio.' });
    }

    // 3) Busca os livros DIRETO NO BANCO — o preço nunca vem do navegador
    const livroIds = itens.map(i => i.livroId);
    const { data: livrosDoBanco, error: livrosError } = await supabaseAdmin
      .from('livros')
      .select('id, titulo, autor, preco_centavos, tipo_venda, disponivel')
      .in('id', livroIds);

    if (livrosError) throw livrosError;

    const itensValidos = [];
    for (const item of itens) {
      const livro = livrosDoBanco.find(l => l.id === item.livroId);
      const quantidade = Math.max(1, parseInt(item.quantidade, 10) || 1);

      const podeComprar =
        livro &&
        livro.disponivel &&
        livro.tipo_venda === 'proprio' &&
        livro.preco_centavos !== null &&
        livro.preco_centavos !== undefined;

      if (podeComprar) {
        itensValidos.push({ livro, quantidade });
      }
    }

    if (itensValidos.length === 0) {
      return res.status(400).json({ error: 'Nenhum item do carrinho está disponível para compra.' });
    }

    const totalCentavos = itensValidos.reduce(
      (soma, { livro, quantidade }) => soma + livro.preco_centavos * quantidade,
      0
    );

    // 4) Cria o pedido no Supabase como "pendente", antes de ir para o Stripe
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('pedidos')
      .insert({ usuario_id: usuario.id, status: 'pendente', total_centavos: totalCentavos })
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    const itensParaInserir = itensValidos.map(({ livro, quantidade }) => ({
      pedido_id: pedido.id,
      livro_id: livro.id,
      quantidade,
      preco_unitario_centavos: livro.preco_centavos
    }));

    const { error: itensError } = await supabaseAdmin.from('itens_pedido').insert(itensParaInserir);
    if (itensError) throw itensError;

    // 5) Cria a sessão de pagamento no Stripe
    const origem = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: usuario.email,
      line_items: itensValidos.map(({ livro, quantidade }) => ({
        quantity: quantidade,
        price_data: {
          currency: 'brl',
          unit_amount: livro.preco_centavos,
          product_data: {
            name: livro.titulo,
            description: livro.autor
          }
        }
      })),
      metadata: {
        pedido_id: pedido.id
      },
      success_url: `${origem}/?compra=sucesso`,
      cancel_url: `${origem}/?compra=cancelada`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err);
    return res.status(500).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
  }
}

