//proses dependensi
import express from "express";
import cors from "cors";
import multer from "multer";
import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import fs from "fs";

import "dotenv/config";

//inisialisasi express

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//inisialisasi middleware

app.use(cors());
app.use(express.json());

// Inisialisasi multer untuk menangani upload file
// File akan disimpan di folder 'uploads'
const upload = multer({ dest: "uploads/" });

//inisialisasi endpoint

// Pastikan folder 'uploads' ada di root project Anda.

app.post("/chat", async (req, res) => {
  const { body } = req;
  const { prompt } = body;

  //guard clause
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({
      message: "prompt harus diisi dan berupa string!",
      data: null,
      success: false,
    });
    return;
  }
  //main part, part penting
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: aiResponse.text || "Berhasil di tanggapi oleh google gemini",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: e.message || "Ada masalah di server!!",
    });
  }
});

//route end point
//1.generate text
app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    res.json({
      output: result.text,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e.message,
    });
  }
});

//2.generate picture
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const { prompt = "Describe this uploaded image" } = req.body; // Default prompt

  try {
    const image = await ai.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype,
      },
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        createUserContent([
          prompt,
          createPartFromUri(image.uri, image.mimeType),
        ]),
      ],
    });

    res.json({ output: result.text });
  } catch (error) {
    console.error("Error generating content", error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(req.file.path); // Hapus file sementara
  }
});

//3.generate dari dokumen
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    const { prompt = "Describe this uploaded document" } = req.body; // Default prompt

    try {
      const filepath = req.file.path;
      const buffer = fs.readFileSync(filepath);
      const base64Data = buffer.toString("base64");
      const mimeType = req.file.mimetype;

      const documentPart = {
        inlineData: { data: base64Data, mimeType },
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [createUserContent([prompt, documentPart])],
      });

      res.json({ output: result.text });
    } catch (e) {
      console.error("Error generating content", e);
      res.status(500).json({ error: e.message });
    } finally {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Hapus file sementara
      }
    }
  }
);

//4.generate from audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  const { prompt = "Describe this uploaded audio" } = req.body; // Default prompt

  try {
    const audioBuffer = fs.readFileSync(req.file.path);
    const base64Audio = audioBuffer.toString("base64");
    const mimeType = req.file.mimetype;

    const audioPart = {
      inlineData: { data: base64Audio, mimeType },
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [createUserContent([prompt, audioPart])],
    });

    res.json({ output: result.text });
  } catch (error) {
    console.error("Error generating content", error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(req.file.path); // Hapus file sementara
  }
});

//buat entry point

const PORT = 3000;

app.listen(PORT, () => {
  console.log("server jalan di 3000");
});
