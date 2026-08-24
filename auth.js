// ── AUTENTICAÇÃO (E-MAIL / SENHA) ──
// Depende de supabaseClient, já criado em supabase-client.js

function abrirModalAuth(modo = 'login') {
  document.getElementById('auth-modal').classList.add('aberto');
  alternarModoAuth(modo);
}

function fecharModalAuth() {
  document.getElementById('auth-modal').classList.remove('aberto');
  document.getElementById('auth-form').reset();
  document.getElementById('auth-erro').textContent = '';
}

function alternarModoAuth(modo) {
  const isLogin = modo === 'login';
  document.getElementById('auth-titulo').textContent = isLogin ? 'Entrar' : 'Criar conta';
  document.getElementById('auth-submit').textContent = isLogin ? 'Entrar' : 'Criar conta';
  document.getElementById('auth-alternar-texto').innerHTML = isLogin
    ? `Ainda não tem conta? <a href="#" onclick="alternarModoAuth('cadastro'); return false;">Criar conta</a>`
    : `Já tem conta? <a href="#" onclick="alternarModoAuth('login'); return false;">Entrar</a>`;
  document.getElementById('auth-form').dataset.modo = modo;
  document.getElementById('auth-erro').textContent = '';
}

// Traduz as mensagens mais comuns do Supabase para português.
// Mensagens não mapeadas aparecem como vieram (em inglês), como reserva.
function traduzirErroAuth(mensagem) {
  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Digite um e-mail válido.',
  };
  return mapa[mensagem] || mensagem;
}

async function enviarFormAuth(event) {
  event.preventDefault();
  const form = document.getElementById('auth-form');
  const modo = form.dataset.modo;
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-senha').value;
  const erroEl = document.getElementById('auth-erro');
  const submitBtn = document.getElementById('auth-submit');

  erroEl.style.color = '#b3261e';
  erroEl.textContent = '';
  submitBtn.disabled = true;
  const textoOriginal = submitBtn.textContent;
  submitBtn.textContent = 'Aguarde...';

  const { data, error } = modo === 'login'
    ? await supabaseClient.auth.signInWithPassword({ email, password })
    : await supabaseClient.auth.signUp({ email, password });

  submitBtn.disabled = false;
  submitBtn.textContent = textoOriginal;

  if (error) {
    erroEl.textContent = traduzirErroAuth(error.message);
    return;
  }

  // Se o Supabase exigir confirmação por e-mail, ainda não há sessão após o cadastro
  if (modo === 'cadastro' && !data.session) {
    erroEl.style.color = 'var(--acafrao)';
    erroEl.textContent = 'Conta criada! Verifique seu e-mail para confirmar antes de entrar.';
    return;
  }

  fecharModalAuth();
}

async function sair() {
  await supabaseClient.auth.signOut();
}

// Atualiza a área da navbar de acordo com o estado de login
function atualizarNavAuth(session) {
  const container = document.getElementById('nav-auth');
  if (session) {
    container.innerHTML = `
      <span class="nav-usuario">${session.user.email}</span>
      <button class="nav-btn-sair" onclick="sair()">Sair</button>
    `;
  } else {
    container.innerHTML = `<button class="nav-btn-entrar" onclick="abrirModalAuth('login')">Entrar</button>`;
  }
}

// Reage a login, logout e restauração automática de sessão (ex: ao recarregar a página)
supabaseClient.auth.onAuthStateChange((_event, session) => {
  atualizarNavAuth(session);
});

// Estado inicial ao carregar a página
supabaseClient.auth.getSession().then(({ data }) => {
  atualizarNavAuth(data.session);
});
