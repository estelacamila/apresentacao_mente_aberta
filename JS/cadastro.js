document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm') || document.querySelector('form');
  if (!form) {
    console.error('Formulário não encontrado.');
    return;
  }

  // Cria elemento de mensagem se não existir
  let messageEl = document.getElementById('registerMessage');
  if (!messageEl) {
    messageEl = document.createElement('p');
    messageEl.id = 'registerMessage';
    const btn = form.querySelector('button, input[type="submit"]');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(messageEl, btn.nextSibling);
    else form.appendChild(messageEl);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await register(messageEl);
  });

  // Toggle do "olhinho" da senha
  document.querySelectorAll('.alternar_senha').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('.eye-closed').style.display = isPassword ? 'none' : 'inline';
      btn.querySelector('.eye-open').style.display = isPassword ? 'inline' : 'none';
    });
  });
});

async function register(messageEl) {
  const nomeEl = document.getElementById('nome');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('senha');
  const confirmEl = document.getElementById('novasenha');

  const nome = nomeEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  const confirmPassword = confirmEl.value.trim();

  // Validações
  if (!nome || !email || !password || !confirmPassword) {
    showMessage(messageEl, 'Preencha todos os campos!', 'red');
    return;
  }

  if (!validateEmail(email)) {
    showMessage(messageEl, 'Email inválido!', 'red');
    return;
  }

  if (!validatePassword(password)) {
    showMessage(messageEl, 'Senha deve ter letras maiúsculas, minúsculas, número e caractere especial!', 'red');
    return;
  }

  if (password !== confirmPassword) {
    showMessage(messageEl, 'As senhas não coincidem!', 'red');
    return;
  }

  showMessage(messageEl, 'Processando...', 'black');

  try {
    const response = await fetch('http://192.168.1.19:3000/Cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    const data = await response.json();

    showMessage(messageEl, 'Cadastro realizado com sucesso! Redirecionando...', 'green');
    nomeEl.value = '';
    emailEl.value = '';
    passwordEl.value = '';
    confirmEl.value = '';

    setTimeout(() => window.location.replace('./login.html'), 700);
  } catch (err) {
    console.error('Erro no fetch:', err);
    showMessage(messageEl, 'Erro ao cadastrar: ' + err.message, 'orange');
  }
}

// Função para mostrar mensagens
function showMessage(el, text, color) {
  el.style.color = color || 'black';
  el.textContent = text;
}

// Validação de e-mail
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Validação de senha forte
function validatePassword(password) {
  // Pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial, mínimo 6 caracteres
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return re.test(password);
}
