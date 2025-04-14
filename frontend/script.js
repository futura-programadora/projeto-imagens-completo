// Pega o formulário e o container do feed de imagens do HTML
const form = document.getElementById("uploadForm");
const feed = document.getElementById("feed");

// Adiciona um evento ao formulário para interceptar o envio padrão
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Impede que a página recarregue ao enviar o formulário

  // Pega os valores inseridos nos campos do formulário
  const nome = document.getElementById("nome").value;
  const legenda = document.getElementById("legenda").value;
  const imagem = document.getElementById("imagem").files[0]; // Pega o primeiro arquivo enviado

  // Cria um objeto FormData para enviar dados em formato de formulário
  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("legenda", legenda);
  formData.append("imagem", imagem); // Adiciona o arquivo ao formulário

  // Envia a requisição para o backend usando fetch
  await fetch("http://localhost:3000/upload", {
    method: "POST",      // Método POST para envio de dados
    body: formData       // Corpo da requisição é o FormData com os dados
  });

  // Limpa o formulário após o envio
  form.reset();

  // Atualiza o feed de imagens chamando a função
  carregarImagens();
});

// Função que busca as imagens do backend e exibe no feed
async function carregarImagens() {
  // Faz uma requisição GET para buscar todas as imagens salvas
  const res = await fetch("http://localhost:3000/imagens");
  const imagens = await res.json(); // Converte a resposta para JSON

  // Limpa o conteúdo atual do feed
  feed.innerHTML = "";

  // Para cada imagem recebida, cria um bloco com nome, imagem e legenda
  imagens.forEach(img => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${img.nome}</strong></p>
      <img src="${img.url}" alt="Imagem">
      <p>${img.legenda}</p>
    `;
    feed.appendChild(div); // Adiciona o bloco ao feed
  });
}

// Ao carregar a página, busca as imagens existentes no servidor
carregarImagens();
