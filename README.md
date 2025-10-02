# Steps

1. Inisialisasi git
   --> git init
2. Inisialisasi npm
   --> npm init -y
3. Install package yang dibutuhkan: express, multer, cors, @google/genai, dotenv
   --> npm install express multer cors @google/genai dotenv
4. Tambahkan .gitignore untuk node_modules dan .env
5. Buat file .env untuk menyimpan GEMINI_API_KEY
6. Buat file .env.example untuk contoh env variable
7. Buat file index.js untuk menulis kode server
8. Jalankan `node index.js` untuk test hasilnya
9. tambahkan entry point dengan port '3000'
10. tambahkan endpoint untuk generate text,dokumen,gambar dan audio
