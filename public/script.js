// Ambil elemen DOM berdasarkan ID yang sudah kita set di HTML
const chatInput = document.getElementById("chatInput");
const sendMessageButton = document.getElementById("sendMessageButton");
const chatHistory = document.getElementById("chatHistory");
const body = document.body; // Mengambil elemen <body> untuk mengganti class

// Fungsi untuk menambahkan pesan ke riwayat chat
function appendMessage(text, senderClass, ...additionalClasses) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chat-message", senderClass, ...additionalClasses);
  messageDiv.textContent = text;
  chatHistory.appendChild(messageDiv);
  // Auto-scroll ke bawah setiap kali ada pesan baru
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return messageDiv;
}

// FUNGSI BARU: Untuk efek mengetik (typewriter effect)
function typeMessage(messageElement, text, speed = 20) {
  // speed dalam milidetik per karakter
  let i = 0;
  messageElement.textContent = ""; // Kosongkan dulu teksnya
  const typingInterval = setInterval(() => {
    if (i < text.length) {
      messageElement.textContent += text.charAt(i);
      chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll saat mengetik
      i++;
    } else {
      clearInterval(typingInterval);
    }
  }, speed);
}

// Fungsi untuk menghapus pesan (berguna untuk loading message)
function removeMessage(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

// Fungsi utama untuk mengirim pesan dan berinteraksi dengan backend AI
async function sendMessage() {
  const userMessage = chatInput.value.trim();
  if (userMessage === "") return; // Jangan kirim pesan kosong

  // 1. Tampilkan pesan user di chat history
  appendMessage(userMessage, "user-message");
  chatInput.value = ""; // Kosongkan input

  // Pastikan chat-active selalu ditambahkan
  body.classList.add("chat-active");

  // 3. Tampilkan indikator loading atau "AI sedang berpikir..."
  const loadingMessage = appendMessage(
    "AI sedang berpikir...",
    "ai-message",
    "loading"
  );

  try {
    // 4. Kirim pesan ke backend Node.js (API kamu)
    // >>>>>> INI SUDAH DIUBAH UNTUK DEPLOY VERCEL <<<<<<
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });
    // >>>>>> AKHIR PERUBAHAN UNTUK VERCEL <<<<<<

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! Status: ${response.status}. Details: ${
          errorData.details || errorData.error
        }`
      );
    }

    const data = await response.json(); // Ambil balasan dari backend
    removeMessage(loadingMessage); // Hapus indikator loading

    const aiMessageElement = appendMessage("", "ai-message"); // Buat elemen kosong dulu
    typeMessage(aiMessageElement, data.reply, 20); // Panggil fungsi typeMessage
  } catch (error) {
    console.error("Error communicating with AI backend:", error);
    removeMessage(loadingMessage); // Hapus indikator loading
    appendMessage(
      "Maaf, ada masalah teknis dengan AI. Coba lagi nanti.",
      "ai-message",
      "error"
    );
  }

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Event Listeners: Menghubungkan fungsi sendMessage ke tombol dan tombol Enter
sendMessageButton.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    // Menekan Enter (tanpa Shift)
    e.preventDefault(); // Mencegah baris baru di textarea
    sendMessage();
  }
});

// --- BAGIAN UNTUK PRODUK GRID (TANPA AUTO-SCROLL ATAU EXPAND) ---
// (Semua kode JS terkait auto-scroll dan expandable card sudah dihapus dari sini)
// Jika kamu ingin menambahkan fungsionalitas lain untuk produk di masa depan, tambahkan di sini.
// Contoh: kamu bisa tambahkan console.log("Halaman dimuat, JS berjalan!"); di sini
// Untuk memastikan script.js kamu termuat dan berjalan.
