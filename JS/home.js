// -------------------------
// Chat (seu código original)
// -------------
// -------------------------
// Chat
// -------------------------
const chatContainer = document.getElementById('chatContainer');
const messageInput  = document.getElementById('messageInput');
// const sendButton    = document.getElementById('sendButton');

function appendMessage(side, text) {
  const msg = document.createElement('div');
  msg.className = `message ${side}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatContainer.appendChild(msg);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  appendMessage('right', text);
  messageInput.value = '';
  messageInput.focus();
}

// sendButton.addEventListener('click', sendMessage);

// messageInput.addEventListener('keydown', (e) => {
//   if (e.key === 'Enter') {
//     e.preventDefault();
//     sendMessage();
//   }
// });

// -------------------------
// Bloco de Notas (Modal)
// -------------------------
const notesModal = document.getElementById("notesModal");
const openNotesBtn = document.getElementById("openNotesBtn");
const closeModal = document.getElementById("closeModal");
const notesContainer = document.getElementById("notesContainer");
const addNoteBtn = document.getElementById("addNoteBtn");

// Abrir modal
openNotesBtn.addEventListener("click", () => {
  notesModal.style.display = "block";
  loadNotes();
});

// Fechar modal
closeModal.addEventListener("click", () => {
  notesModal.style.display = "none";
});

// Fechar clicando fora
window.addEventListener("click", (event) => {
  if (event.target === notesModal) {
    notesModal.style.display = "none";
  }
});

// Cria uma nota
function createNote(text = "") {
  const note = document.createElement("div");
  note.classList.add("note");

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.addEventListener("input", saveNotes);

  const actions = document.createElement("div");
  actions.classList.add("actions");

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn";
  editBtn.title = "Editar";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", () => {
    textarea.focus();
    const v = textarea.value;
    textarea.value = "";
    textarea.value = v;
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn";
  deleteBtn.title = "Excluir";
  deleteBtn.textContent = "🗑️";
  deleteBtn.addEventListener("click", () => {
    note.remove();
    saveNotes();
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  note.appendChild(textarea);
  note.appendChild(actions);

  notesContainer.appendChild(note);
}

// Adicionar nova nota
addNoteBtn.addEventListener("click", () => {
  createNote("");
  saveNotes();
});

// Salvar notas no localStorage
function saveNotes() {
  const notes = Array.from(document.querySelectorAll(".note textarea")).map(
    note => note.value
  );
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Carregar notas
function loadNotes() {
  notesContainer.innerHTML = "";
  const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
  savedNotes.forEach(text => createNote(text));
}

// -------------------------
// Emojis de Humor
// -------------------------
const emojis = document.querySelectorAll(".emoji")
const moodMessage = document.getElementById("moodMessage");

console.log(emojis)

const mensagens = {
  feliz: "Que bom que você está feliz! Continue espalhando essa energia positiva 🌟",
  amor: "Que lindo! O amor transforma os dias ✨",
  triste: "Tudo bem não estar bem às vezes. Respire fundo, você não está sozinho 💙",
  chorando: "Chorar faz bem, mas você vai ficar bem 😢",
  raiva: "É normal sentir raiva. Experimente relaxar e liberar essa energia 💭"
};

// Função para resetar todos os emojis
function resetEmojis() {
  emojis.forEach(e => e.classList.remove("active"));
}

// Adiciona clique em cada emoji
emojis.forEach(emoji => {
  emoji.addEventListener("click", () => {
    resetEmojis();
    emoji.classList.add("active");
    
    // Pega o atributo data-mood do emoji clicado
    const mood = emoji.getAttribute("data-mood");
    
    // Mostra mensagem correspondente
    moodMessage.textContent = mensagens[mood] || "";
    moodMessage.style.display = "block"; // garante que a mensagem apareça
  });
});