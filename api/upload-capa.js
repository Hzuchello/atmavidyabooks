// POST /api/upload-capa
// Recebe imagem em base64 + token do admin. Grava em img/capas/ no GitHub.
// Variáveis na Vercel: GITHUB_TOKEN, GITHUB_REPO (dono/repo), GITHUB_BRANCH (main).

import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['henriquezuchello@gmail.com'];
const MAX_BYTES = 2.5 * 1024 * 1024;

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c290emlzYmx1b3pzc3V0eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTg4MDQsImV4cCI6MjEwMzE3NDgwNH0.JIek0bxCz8SUS_qeANVKq_uWa5JTKL0Ylt7t_OH4zbg'
);

function nomeSeguro(nome) {
  const base = String(nome || 'capa').split(/[/\\]/).pop();
  const limpo = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '-');
  const temExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(limpo);
  return temExt ? limpo : limpo + '.jpg';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Faça login no painel.' });

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
  const email = (userData && userData.user && userData.user.email || '').toLowerCase();
  if (userError || !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Sem permissão para enviar capa.' });
  }

  const repo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!repo || !ghToken) {
    return res.status(500).json({ error: 'GITHUB_REPO ou GITHUB_TOKEN não configurados na Vercel.' });
  }

  const { filename, content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'Arquivo ausente.' });

  const raw = String(content).replace(/^data:[^;]+;base64,/, '');
  const bytes = Buffer.from(raw, 'base64');
  if (bytes.length > MAX_BYTES) {
    return res.status(400).json({ error: 'Imagem maior que 2,5 MB. Reduza e envie de novo.' });
  }

  const arquivo = nomeSeguro(filename);
  const path = 'img/capas/' + arquivo;
  const api = 'https://api.github.com/repos/' + repo + '/contents/' + path;

  const headers = {
    Authorization: 'Bearer ' + ghToken,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'atma-vidya-admin'
  };

  let sha;
  const atual = await fetch(api + '?ref=' + encodeURIComponent(branch), { headers });
  if (atual.status === 200) {
    const json = await atual.json();
    sha = json.sha;
  }

  const corpo = {
    message: 'capa: ' + arquivo,
    content: raw,
    branch: branch
  };
  if (sha) corpo.sha = sha;

  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
  });
  const putJson = await put.json();
  if (!put.ok) {
    return res.status(put.status).json({
      error: putJson.message || 'GitHub recusou o envio.'
    });
  }

  return res.status(200).json({ capa_url: path });
}
