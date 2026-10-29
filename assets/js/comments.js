(() => {
  const config = window.KINEM_COMMENTS;
  const boards = document.querySelectorAll("[data-comments]");
  if (!config || !config.url || !config.key || !boards.length) return;

  const endpoint = `${config.url.replace(/\/$/, "")}/rest/v1/comments`;
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
  };

  const createNote = (text, index) => {
    const note = document.createElement("article");
    note.className = `sticker sticker--quote sticker--tape comment-note comment-note--${index % 4}`;
    const message = document.createElement("p");
    message.textContent = text;
    const label = document.createElement("span");
    label.className = "who";
    label.textContent = "anonym";
    note.append(message, label);
    return note;
  };

  boards.forEach((board) => {
    const question = board.dataset.comments;
    const form = board.querySelector(".comment-form");
    const input = board.querySelector("textarea");
    const notes = board.querySelector(".comment-notes");
    if (!question || !form || !input || !notes) return;

    const render = (comments) => {
      notes.replaceChildren();
      if (!comments.length) {
        const empty = document.createElement("p");
        empty.className = "comment-notes__empty";
        empty.textContent = "Noch leer hier. Sei die erste Stimme.";
        notes.append(empty);
        return;
      }
      comments.forEach((comment, index) => notes.append(createNote(comment.body, index)));
    };

    const load = async () => {
      try {
        const response = await fetch(`${endpoint}?question=eq.${encodeURIComponent(question)}&select=body&order=created_at.asc`, { headers });
        if (!response.ok) throw new Error(`Loading comments failed (${response.status})`);
        render(await response.json());
      } catch (error) {
        console.error(error);
        notes.replaceChildren();
        const message = document.createElement("p");
        message.className = "comment-notes__empty";
        message.textContent = "Die Stimmen konnten gerade nicht geladen werden.";
        notes.append(message);
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = input.value.trim();
      if (!body) return;
      const button = form.querySelector("button");
      button.disabled = true;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({ question, body }),
        });
        if (!response.ok) throw new Error(`Saving comment failed (${response.status})`);
        input.value = "";
        await load();
      } catch (error) {
        console.error(error);
        input.setCustomValidity("Der Kommentar konnte gerade nicht gespeichert werden.");
        input.reportValidity();
        input.setCustomValidity("");
      } finally {
        button.disabled = false;
      }
    });
    load();
  });
})();
