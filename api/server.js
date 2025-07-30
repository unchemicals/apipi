// server.js

// api/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import CORS
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
// >>>>>> PERUBAHAN CORS DI SINI <<<<<<
// Untuk produksi di Vercel, batasi originnya
const allowedOrigins = [
  "http://localhost:5500", // Untuk development lokal dengan Live Server
  "http://localhost:3000", // Kalau kamu develop lokal pakai port lain
  "https://projectapipi.vercel.app", // Ganti ini dengan domain Vercel-mu nanti!
];

app.use(
  cors({
    origin: function (origin, callback) {
      // izinkan request tanpa origin (misal mobile apps, postman, atau sama domain)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
// >>>>>> AKHIR PERUBAHAN CORS <<<<<<
app.use(express.json());

// ... (sisa kode server.js tetap sama) ...
// Inisialisasi Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- PROMPT ENGINEERING / CONTEXT ENGINEERING ---
// GANTI BAGIAN INI DENGAN DESKRIPSI NYATA PROYEK APIPI KAMU!
const chatContext = `Anda adalah chatbot asisten untuk final project ospek kami yang bernama "APIPI".
Proyek APIPI adalah sebuah sistem edukasi interaktif berbasis website yang bertujuan untuk memberi edukasi mengenai project kami yaitu penyerap polusi berbasis mikroalgae yang aka menyerap polusi dan menghasilkan oksigen serta menggunakan panel surya untuk menagliri listrik ke dalam sistem optimasi mikroalgae dan menyediakan colokan untuk publik.
Fokus utama Anda adalah memberikan informasi yang relevan dan akurat hanya seputar proyek APIPI ini.

Jika pertanyaan user TIDAK terkait dengan proyek APIPI sama sekali, atau jika Anda tidak yakin apakah pertanyaan itu relevan, mohon jawab dengan sopan:
"Maaf, saya hanya bisa menjawab pertanyaan seputar proyek APIPI. Bisakah Anda bertanya lebih lanjut tentang sistem edukasi daur ulang sampah kami?"

Gunakan bahasa yang ramah dan membantu.
`;
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const fullPrompt = `${chatContext}\n\nPertanyaan user: "${userMessage}"`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: "Failed to get response from AI.",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(
    `Open your frontend at http://localhost:PORT_FRONTEND (misal 5500 jika pakai Live Server)`
  );
});
