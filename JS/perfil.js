document.addEventListener('DOMContentLoaded', async () => {
  // -------------------------------
  // ELEMENTOS DO PERFIL
  // -------------------------------
  const nomeInput = document.querySelector('#nome');
  const emailInput = document.querySelector('#email');
  const perfilImg = document.querySelector('#perfil');
  const editarFotoBtn = document.getElementById('editarFoto');
  const removerFotoBtn = document.getElementById('removerFoto');
  const fotoInput = document.getElementById('fotoInput');
  const concluidoBtn = document.querySelector('#Concluido');
  const cancelaBtn = document.querySelector('#cancela');

  const id = localStorage.getItem('id');
  if (!id) {
    alert('Erro: ID do usuário não encontrado. Faça login novamente.');
    return;
  }

  try {
    const response = await fetch(`http://192.168.1.19:3000/Perfil/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar dados do usuário.');

    const data = await response.json();
    nomeInput.value = data.nome || '';
    emailInput.value = data.email || '';
    perfilImg.src = data.foto || 'https://static.vecteezy.com/ti/vetor-gratis/p1/2387693-icone-do-perfil-do-usuario-vetor.jpg';
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    alert('Erro ao carregar dados do perfil.');
  }


  const menuIcon = document.querySelector('.menu svg');
  const menuList = document.querySelector('.menu ul');

  if (menuIcon && menuList) {
    menuIcon.addEventListener('click', () => menuList.classList.toggle('show'));
    document.addEventListener('click', (e) => {
      if (!menuList.contains(e.target) && !menuIcon.contains(e.target)) {
        menuList.classList.remove('show');
      }
    });
  }

  editarFotoBtn?.addEventListener('click', () => fotoInput.click());

  fotoInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resizeImage(file, 500, 500, (base64) => {
      perfilImg.src = base64;
    });
  });

  removerFotoBtn?.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      perfilImg.src = 'https://static.vecteezy.com/ti/vetor-gratis/p1/2387693-icone-do-perfil-do-usuario-vetor.jpg';
      alert('Foto removida!');
    }
  });

  concluidoBtn?.addEventListener('click', async (e) => {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const foto = perfilImg.src;

    if (!nome || !email) {
      alert('Preencha todos os campos antes de salvar!');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.19:3000/Perfil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, foto }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Perfil atualizado com sucesso!');
      } else {
        alert('⚠️ Erro ao atualizar: ' + (data.message || 'Tente novamente.'));
      }
    } catch (error) {
      console.error('Erro ao enviar PUT:', error);
      alert('Erro de conexão com o servidor.');
    }
  });


  cancelaBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Deseja cancelar as alterações?')) window.location.reload();
  });
});


function resizeImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(base64);
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}
