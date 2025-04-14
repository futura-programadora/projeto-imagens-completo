const form = document.getElementById("uploadForm");
const feed = document.getElementById("feed");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const legenda = document.getElementById("legenda").value;
  const imagem = document.getElementById("imagem").files[0];

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("legenda", legenda);
  formData.append("imagem", imagem);

  await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData
  });

  form.reset();
  carregarImagens();
});

async function carregarImagens() {
  const res = await fetch("http://localhost:3000/imagens");
  const imagens = await res.json();

  feed.innerHTML = "";
  imagens.forEach(img => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${img.nome}</strong></p>
      <img src="${img.url}" alt="Imagem">
      <p>${img.legenda}</p>
    `;
    feed.appendChild(div);
  });
}

carregarImagens();