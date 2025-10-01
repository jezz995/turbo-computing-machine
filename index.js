//proses dependensi
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

import "dotenv/config";

//inisialisasi express

const app = express();
const ai = new GoogleGenAI({});

//inisialisasi middleware

app.use(cors());
//app.use(multer());
app.use(express.json());

//inisialisasi endpoint

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
  //main part part penting
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
      message: aiResponse.text,
      message: "Berhasil di tanggapi oleh google gemini",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: e.message || "Ada masalah di server!!",
    });
  }
});

//buat entry point
app.listen(3000, () => {
  console.log("server jalan di 3000");
});
