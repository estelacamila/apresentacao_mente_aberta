document.addEventListener('DOMContentLoaded', async () => {
  const nomeInput = document.querySelector('#nome');
  const senhaInput = document.querySelector('#senha');
  const confirmaInput = document.querySelector('#novasenha'); // atualizado
  const perfilImg = document.querySelector('#perfilM');
  const editarFotoBtn = document.getElementById('editarFoto');
  const removerFotoBtn = document.getElementById('removerFoto');
  const fotoInput = document.getElementById('fotoInput');
  const concluidoBtn = document.querySelector('.botao-concluido');

  if (!nomeInput || !senhaInput || !confirmaInput || !perfilImg || !editarFotoBtn || !removerFotoBtn || !fotoInput || !concluidoBtn) {
    console.error("Algum elemento do perfil não foi encontrado no DOM.");
    return;
  }

  const id = localStorage.getItem('id');
  if (!id) {
    alert('⚠️ Faça login novamente.');
    return;
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  // Carregar dados do usuário
  try {
    const response = await fetch(`https://back-render-vpda.onrender.com/Perfil/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar dados do usuário.');
    const data = await response.json();
    nomeInput.value = data.nome || '';
    perfilImg.src = data.foto || 'https://static.vecteezy.com/ti/vetor-gratis/p1/2387693-icone-do-perfil-do-usuario-vetor.jpg';
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
  }

  // Editar foto
  editarFotoBtn.addEventListener('click', () => fotoInput.click());

  fotoInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      perfilImg.src = base64;
      await fetch(`https://back-render-vpda.onrender.com/Perfil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto: base64 }),
      });
    } catch (err) {
      console.error('Erro ao atualizar imagem:', err);
      alert('❌ Não foi possível atualizar a imagem.');
    }
  });

  // Remover foto
  removerFotoBtn.addEventListener('click', async () => {
    if (!confirm('Deseja remover sua foto?')) return;
    const padrao = 'https://static.vecteezy.com/ti/vetor-gratis/p1/2387693-icone-do-perfil-do-usuario-vetor.jpg';
    perfilImg.src = padrao;
    try {
      await fetch(`https://back-render-vpda.onrender.com/Perfil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto: padrao }),
      });
    } catch (err) {
      console.error('Erro ao remover foto:', err);
      alert('❌ Não foi possível remover a foto.');
    }
  });

  // Atualizar nome e senha
  concluidoBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const senha = senhaInput.value.trim();
    const confirma = confirmaInput.value.trim();
    const foto = perfilImg.src;

    if (!nome) {
      alert('⚠️ Preencha todos os campos!');
      return;
    }

    if (senha && senha !== confirma) {
      alert('❌ As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch(`https://back-render-vpda.onrender.com/Perfil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha, foto }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('✅ Perfil atualizado com sucesso!');
      } else {
        alert('❌ Erro ao atualizar: ' + (data.message || 'Tente novamente.'));
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro de conexão com o servidor.');
    }
  });

  // Alternar senha
  document.querySelectorAll('.alternar_senha').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const eyeClosed = btn.querySelector('.eye-closed');
      const eyeOpen = btn.querySelector('.eye-open');
      if (eyeClosed && eyeOpen) {
        eyeClosed.style.display = isPassword ? 'none' : 'inline';
        eyeOpen.style.display = isPassword ? 'inline' : 'none';
      }
    });
  });
});
