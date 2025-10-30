document.addEventListener('DOMContentLoaded', () => {
  // Limpa qualquer dado antigo de sessão
  localStorage.removeItem('id');
  localStorage.removeItem('email');
  localStorage.removeItem('nome');

  const form = document.querySelector('form');
  if (!form) {
    console.error('Formulário não encontrado na página.');
    return;
  }

  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#senha');

  if (!emailInput || !passwordInput) {
    console.error('Inputs tipo email/senha não encontrados. Verifique o HTML.');
    return;
  }

  // Cria elemento de mensagem se não existir
  let messageEl = document.getElementById('loginMessage');
  if (!messageEl) {
    messageEl = document.createElement('p');
    messageEl.id = 'loginMessage';
    messageEl.setAttribute('aria-live', 'polite');
    const btn = form.querySelector('button, input[type="submit"]');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(messageEl, btn.nextSibling);
    else form.appendChild(messageEl);
  }

  // Evento de envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === '' || password === '') {
      showMessage(messageEl, 'Preencha todos os campos!', 'red');
      return;
    }

    // Validação da senha mínima de 6 caracteres (qualquer caractere)
    if (password.length < 6) {
      showMessage(messageEl, 'A senha deve ter no mínimo 6 caracteres!', 'red');
      return;
    }

    await handleLogin(email, password, messageEl);
  });
});

// Função de login
async function handleLogin(email, password, messageEl) {
  showMessage(messageEl, 'Verificando login...', 'blue');

  try {
    const response = await fetch('http://192.168.1.19:3000/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, senha: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // tenta ler JSON, senão null
      showMessage(messageEl, errorData?.message || `Erro: ${response.statusText}`, 'red');
      return;
    }

    const data = await response.json();

    // Login bem-sucedido
    localStorage.setItem('id', data.id);
    localStorage.setItem('email', data.email);
    localStorage.setItem('nome', data.nome);
    showMessage(messageEl, 'Login realizado com sucesso! Redirecionando...', 'green');
    setTimeout(() => {
      window.location.href = './home.html';
    }, 1000); // dá tempo de mostrar a mensagem
  } catch (error) {
    console.error('Erro no login:', error);
    showMessage(messageEl, 'Erro de conexão com o servidor.', 'red');
  }
}

// Função de exibir mensagens
function showMessage(el, text, color) {
  el.style.color = color || 'black';
  el.textContent = text;
}

// Função de validar e-mail (opcional)
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Validação do olhinho da senha
document.querySelectorAll('.alternar_senha').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const Password = input.type === 'password';
    input.type = Password ? 'text' : 'password';
    
    btn.querySelector('.eye-closed').style.display = Password ? 'none' : 'inline';
    btn.querySelector('.eye-open').style.display = Password ? 'inline' : 'none';
  });
});
