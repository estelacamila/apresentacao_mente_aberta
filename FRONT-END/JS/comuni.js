document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // ELEMENTOS DO CHAT
  // -------------------------
  const chatContainer = document.getElementById("chatContainer");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const usuario_id = localStorage.getItem("usuario_id") || "1";

  let lastMessages = [];

  // Criar mensagem no chat
  function appendMessage(text, userName = "Você") {
    const msg = document.createElement("div");
    msg.className = "message";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const info = document.createElement("div");
    info.className = "message-info";
    info.textContent = userName;

    msg.appendChild(bubble);
    msg.appendChild(info);
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Enviar mensagem
  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = "";
    messageInput.focus();

    try {
      const res = await fetch("http://localhost:3000/Comunidade/Mensagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id, mensagem: text }),
      });

      if (res.ok) 
      {              
        // chatContainer.remove()
        appendMessage(text, "Você");
      }
    
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // Buscar mensagens
  async function loadMessages() {
    try {
  
      const res = await fetch("http://localhost:3000/Comunidade/Mensagem");
      const mensagens = await res.json();
      if(mensagens.length > 0){
            lastMessages = []
            const msg = document.querySelectorAll('.message')
                        console.log(msg




                        )

           msg.forEach(element => {
        element.remove();
    });
      }
      mensagens.forEach((msg) => {
        const exists = lastMessages.find((m) => m.id === msg.id);
        if (!exists) {
          const name =
            msg.usuario_id == usuario_id
              ? "Você"
              : `Usuário ${msg.usuario_id}`;
          appendMessage(msg.mensagem, name);
          lastMessages.push(msg);
        }
      });
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  }

  loadMessages();
  setInterval(loadMessages, 5000);

  // -------------------------
  // BLOCO DE NOTAS
  // -------------------------
  const notesModal = document.getElementById("notesModal");
  const openNotesBtn = document.getElementById("openNotesBtn");
  const closeModal = document.getElementById("closeModal");
  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");

  // Abrir e fechar modal
  openNotesBtn.addEventListener("click", () => {
    notesModal.style.display = "block";
    loadNotes();
  });

  closeModal.addEventListener("click", () => {
    notesModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === notesModal) notesModal.style.display = "none";
  });

  // Função debounce (para salvar com atraso ao digitar)
  function debounce(func, delay = 600) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

  // Criar nota na tela
  function createNote(nota) {
    const note = document.createElement("div");
    note.classList.add("note");

    const textarea = document.createElement("textarea");
    textarea.value = nota.conteudo || "";

    // Atualizar nota (PUT)
    const updateNote = debounce(async () => {
      try {
        await fetch(`http://localhost:3000/Notas/${nota.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conteudo: textarea.value }),
        });
      } catch (err) {
        console.error("Erro ao atualizar nota:", err);
      }
    });

    textarea.addEventListener("input", updateNote);

    // Botões de ação
    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit";
    editBtn.title = "Editar nota";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => textarea.focus());

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete";
    deleteBtn.title = "Excluir nota";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`http://localhost:3000/Notas/${nota.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Erro ao excluir nota");
        note.remove();

        // Atualiza lista após excluir
        const restantes = notesContainer.querySelectorAll(".note");
        if (restantes.length === 0) {
          const msg = document.createElement("p");
          msg.textContent = "Nenhuma nota encontrada.";
          msg.classList.add("empty-msg");
          notesContainer.appendChild(msg);
        }
      } catch (err) {
        console.error("Erro ao excluir nota:", err);
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    note.appendChild(textarea);
    note.appendChild(actions);
    notesContainer.appendChild(note);
  }

  // Adicionar nova nota
  addNoteBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:3000/Notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id, conteudo: "" }),
      });
      const novaNota = await res.json();
      createNote(novaNota);
    } catch (err) {
      console.error("Erro ao criar nota:", err);
    }
  });

  // Carregar notas do usuário
  async function loadNotes() {
    notesContainer.innerHTML = "";
    try {
      const res = await fetch(`http://localhost:3000/Notas/${usuario_id}`);
      const notas = await res.json();

      if (notas.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "Nenhuma nota encontrada.";
        msg.classList.add("empty-msg");
        notesContainer.appendChild(msg);
        return;
      }

      notas.forEach((nota) => createNote(nota));
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    }
  }
});
