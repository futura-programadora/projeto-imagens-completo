import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Solução para substituir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante que a pasta temp exista
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log("Pasta 'temp' criada.");
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const nomeSeguro = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nomeSeguro);
  }
});
const upload = multer({ storage });

app.post("/upload", upload.single("imagem"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("Nenhum arquivo recebido no upload.");
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    const { nome, legenda } = req.body;
    const imagemPath = req.file.path;

    console.log("Arquivo recebido:", req.file.filename);
    console.log("Caminho do arquivo temporário:", imagemPath);

    const resultado = await cloudinary.v2.uploader.upload(imagemPath);
    console.log("Upload para o Cloudinary feito com sucesso:", resultado.secure_url);

    fs.unlinkSync(imagemPath);
    console.log("Arquivo temporário removido:", imagemPath);

    const novaImagem = await prisma.imagem.create({
      data: {
        nome,
        legenda,
        url: resultado.secure_url
      }
    });

    res.json(novaImagem);
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ erro: "Erro ao enviar imagem", detalhe: err.message });
  }
});

app.get("/imagens", async (req, res) => {
  try {
    const imagens = await prisma.imagem.findMany({
      orderBy: { criadoEm: "desc" }
    });
    res.json(imagens);
  } catch (err) {
    console.error("Erro ao buscar imagens:", err);
    res.status(500).json({ erro: "Erro ao buscar imagens" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
