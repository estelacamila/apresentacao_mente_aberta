document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // IDENTIFICAÇÃO DO USUÁRIO
  // -------------------------
  const usuario_id = localStorage.getItem("id");
  const usuario_nome = localStorage.getItem("nome");

  if (!usuario_id || !usuario_nome) {
    alert("Você precisa fazer login primeiro!");
    window.location.replace("./login.html");
    return;
  }

  // -------------------------
  // ELEMENTOS DO CHAT
  // -------------------------
  const chatContainer = document.getElementById("chatContainer");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");

  if (!chatContainer || !messageInput || !sendButton) {
    console.error("Alguns elementos do chat não foram encontrados no DOM.");
    return;
  }

  function appendMessage(text, userName = "Usuário", id) {
    const usuario = localStorage.getItem("id");
    if (usuario) {
      const msg = document.createElement("div");
      msg.className = "message-dir";

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
    else {
      const msg = document.createElement("div");
      msg.className = "message-esq";

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
  }

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = "";
    messageInput.focus();

    try {
      const res = await fetch("http://localhost:3000/Comunidade/Mensagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id, usuario_nome, mensagem: text }),
      });

      if (res.ok) {
        appendMessage(text, usuario_nome);
      } else {
        console.error("Erro ao enviar mensagem:", await res.text());
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

  async function loadMessages() {
    try {
      const res = await fetch("http://localhost:3000/Comunidade/Mensagem");
      const mensagens = await res.json();

      if (!Array.isArray(mensagens)) return;

      chatContainer.innerHTML = ""; // limpa o chat
      mensagens.forEach((msg) => {
        const name =
          msg.usuario_id == usuario_id
            ? usuario_nome
            : msg.usuario_nome || `Usuário ${msg.usuario_id}`;
        appendMessage(msg.mensagem, name, msg.usuario_id);
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

  if (!notesModal || !openNotesBtn || !closeModal || !notesContainer || !addNoteBtn) {
    console.warn("Alguns elementos do bloco de notas não foram encontrados.");
    return;
  }

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

  function debounce(func, delay = 600) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

function createNote(nota) {
  const emptyMsg = notesContainer.querySelector(".empty-msg");
  if (emptyMsg) emptyMsg.remove();

  const note = document.createElement("div");
  note.classList.add("note");

  const textarea = document.createElement("textarea");
  textarea.value = nota.conteudo || "";

  const updateNote = debounce(async () => {
    try {
      // Se ainda não tem id, cria a nota no backend
      if (!nota.id && textarea.value.trim() !== "") {
        const res = await fetch("http://localhost:3000/Notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: localStorage.getItem("id"), conteudo: textarea.value }),
        });
        const novaNota = await res.json();
        nota.id = novaNota.id; // atualiza o id da nota criada
      } 
      // Se já tem id, atualiza
      else if (nota.id) {
        await fetch(`http://localhost:3000/Notas/${nota.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conteudo: textarea.value }),
        });
      }
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
    }
  }, 800);

  textarea.addEventListener("input", updateNote);

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
      if (!nota.id) return;
      const res = await fetch(`http://localhost:3000/Notas/${nota.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir nota");
      note.remove();

      if (!notesContainer.querySelector(".note")) {
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




addNoteBtn.addEventListener("click", () => {
  createNote({}); // cria no frontend sem id
});

async function loadNotes() {
  try {
    const res = await fetch(`http://localhost:3000/Notas/${usuario_id}`);
    const notas = await res.json();

    notesContainer.innerHTML = "";

    if (!notas || notas.length === 0) {
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
