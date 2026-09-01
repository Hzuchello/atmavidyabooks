// /api/stripe-webhook.js
// O Stripe chama essa function automaticamente quando um pagamento
// é concluído. Ela confirma a autenticidade da chamada (assinatura
// secreta) e marca o pedido correspondente como "pago" no Supabase.
//
// IMPORTANTE: essa function precisa do CORPO BRUTO da requisição
// (sem o Vercel converter para JSON antes), por isso o bodyParser
// é desativado abaixo — é uma exigência do próprio Stripe para
// verificar a assinatura corretamente.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function lerCorpoBruto(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    req.on('data', chunk => partes.push(chunk));
    req.on('end', () => resolve(Buffer.concat(partes)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido.');
  }

  const assinatura = req.headers['stripe-signature'];
  let evento;

  try {
    const corpoBruto = await lerCorpoBruto(req);
    evento = stripe.webhooks.constructEvent(corpoBruto, assinatura, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Falha ao verificar assinatura do webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (evento.type === 'checkout.session.completed') {
    const session = evento.data.object;
    const pedidoId = session.metadata?.pedido_id;

    // O endereço pode vir em dois formatos diferentes, dependendo da
    // versão da API do Stripe — checamos os dois por segurança.
    const dadosEndereco =
      session.collected_information?.shipping_details ||
      session.shipping_details ||
      null;

    const enderecoEntrega = dadosEndereco?.address
      ? {
          nome: dadosEndereco.name || null,
          linha1: dadosEndereco.address.line1 || null,
          linha2: dadosEndereco.address.line2 || null,
          cidade: dadosEndereco.address.city || null,
          estado: dadosEndereco.address.state || null,
          cep: dadosEndereco.address.postal_code || null,
          pais: dadosEndereco.address.country || null
        }
      : null;

    if (pedidoId) {
      const { error } = await supabaseAdmin
        .from('pedidos')
        .update({ status: 'pago', endereco_entrega: enderecoEntrega })
        .eq('id', pedidoId);

      if (error) {
        console.error('Erro ao marcar pedido como pago:', error.message, 'pedido_id:', pedidoId);
      } else {
        console.log('Pedido marcado como pago:', pedidoId);
      }
    } else {
      console.error('Webhook recebido sem pedido_id no metadata da sessão.');
    }
  }

  // Responde rápido — o Stripe espera 200 para não tentar reenviar o evento
  res.status(200).json({ received: true });
}
