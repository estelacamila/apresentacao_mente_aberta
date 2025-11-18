/* ======= home.js (corrigido e funcional com edição e exclusão) ======= */

document.addEventListener("DOMContentLoaded", () => {
  /* ======= MODO ESCURO ======= */
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      darkToggle.textContent = document.body.classList.contains("dark")
        ? "☀️ Modo Claro"
        : "🌙 Modo Escuro";
    });
  }

  /* ======= CARROSSEL ======= */
  const carouselEl = document.querySelector(".carousel");
  const track = document.querySelector(".carousel-container");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  if (carouselEl && track) {
    let slideIndex = 0;
    const slides = Array.from(track.children);

    function updateCarousel() {
      const w = carouselEl.clientWidth;
      track.style.transform = `translateX(${-slideIndex * w}px)`;
    }

    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        slideIndex = (slideIndex + 1) % slides.length;
        updateCarousel();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      });

    let auto = setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      updateCarousel();
    }, 5000);

    carouselEl.addEventListener("mouseenter", () => clearInterval(auto));
    carouselEl.addEventListener("mouseleave", () => {
      clearInterval(auto);
      auto = setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        updateCarousel();
      }, 5000);
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  }

  /* ======= EMOJIS DE HUMOR ======= */
  const emojis = document.querySelectorAll(".emoji");
  const humorMessage = document.getElementById("humorMessage");
  if (emojis && humorMessage) {
    emojis.forEach((emoji) => {
      emoji.addEventListener("click", () => {
        const msg = emoji.getAttribute("data-msg") || "";
        humorMessage.textContent = msg;
        humorMessage.classList.add("show");
        setTimeout(() => humorMessage.classList.remove("show"), 3000);
      });
    });
  }

  /* ======= MODAL DE DICAS ======= */
  const infoModal = document.getElementById("infoModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const closeInfoModal = document.getElementById("closeInfoModal");

  const dicas = {
    ansiedade: {
      titulo: "Ansiedade",
      texto: `A ansiedade pode vir de repente, mas ela não define você. 🌿
👉 Inspire por 4s, segure por 7s e expire por 8s. Repita 3x.`,
    },
    depressao: {
      titulo: "Depressão",
      texto: `A depressão é uma batalha silenciosa. 💙
👉 Cada pequeno passo importa — abrir uma janela, caminhar, conversar.`,
    },
    luto: {
      titulo: "Luto",
      texto: `O luto é o amor em reorganização. 🕊️
👉 Permita-se sentir e compartilhar lembranças.`,
    },
     raiva: {
      titulo: "Raiva intensa",
      texto: `A raiva intensa nem sempre é falta de controle — às vezes é um coração sobrecarregado. 💭
👉 Mantenha a calma, fale com leveza e dê tempo para a pessoa se recompor.
A tranquilidade de quem apoia pode ser o primeiro passo para o equilíbrio. 🌿`
    },
    conflitos: {
      titulo: "Conflitos familiares",
      texto: `Conflitos são oportunidades de crescimento. ❤️`,
    },
  };

  document.querySelectorAll(".card[data-topic]").forEach((card) => {
    card.addEventListener("click", () => {
      const topic = card.dataset.topic;
      if (dicas[topic]) {
        modalTitle.textContent = dicas[topic].titulo;
        modalText.textContent = dicas[topic].texto;
        if (infoModal) infoModal.style.display = "block";
      }
    });
  });

  if (closeInfoModal)
    closeInfoModal.addEventListener("click", () => {
      if (infoModal) infoModal.style.display = "none";
    });

  /* ======= BLOCO DE NOTAS FUNCIONAL ======= */
  const notesModal = document.getElementById("notesModal");
  const openNotesBtn = document.getElementById("addNoteBtn");
  const closeNotesBtn = document.getElementById("closeModal");
  const notesContainer = document.getElementById("notesContainer");
  const newNoteBtn = document.getElementById("newNoteBtn");

  const usuario_id = localStorage.getItem("id");

  if (openNotesBtn)
    openNotesBtn.addEventListener("click", () => {
      notesModal.style.display = "block";
      loadNotes();
    });

  if (closeNotesBtn)
    closeNotesBtn.addEventListener("click", () => {
      notesModal.style.display = "none";
    });

  window.addEventListener("click", (e) => {
    if (e.target === notesModal) notesModal.style.display = "none";
  });

  function debounce(func, delay = 600) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

  function createNote(nota) {
    const note = document.createElement("div");
    note.classList.add("note");

    const textarea = document.createElement("textarea");
    textarea.value = nota.conteudo || "";

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit";
    editBtn.innerHTML = "✏️";
    editBtn.title = "Editar nota";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete";
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.title = "Excluir nota";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    note.appendChild(textarea);
    note.appendChild(actions);
    notesContainer.appendChild(note);

    const updateNote = debounce(async () => {
      try {
        if (!nota.id && textarea.value.trim() !== "") {
          const res = await fetch("https://back-render-vpda.onrender.com/Notas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuario_id,
              conteudo: textarea.value,
            }),
          });
          const nova = await res.json();
          nota.id = nova.id;
        } else if (nota.id) {
          await fetch(`https://back-render-vpda.onrender.com/Notas/${nota.id}`, {
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

    editBtn.addEventListener("click", () => textarea.focus());

    deleteBtn.addEventListener("click", async () => {
      if (!nota.id) {
        note.remove();
        return;
      }
      try {
        const res = await fetch(`https://back-render-vpda.onrender.com/Notas/${nota.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Erro ao excluir nota");
        note.remove();
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    });
  }

  async function loadNotes() {
    if (!usuario_id) return;
    try {
      const res = await fetch(`https://back-render-vpda.onrender.com/Notas/${usuario_id}`);
      const notas = await res.json();

      notesContainer.innerHTML = "";

      if (!notas || notas.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "Nenhuma nota encontrada.";
        msg.classList.add("empty-msg");
        notesContainer.appendChild(msg);
        return;
      }

      notas.forEach((n) => createNote(n));
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    }
  }

  if (newNoteBtn)
    newNoteBtn.addEventListener("click", () => {
      createNote({});
    });
});
