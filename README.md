# Belajar Vibe Coding

Aplikasi ini adalah sebuah backend API yang dibangun untuk mengelola data pengguna (users) dan sesi autentikasi (sessions). Proyek ini dibuat sebagai pembelajaran menggunakan ekosistem modern TypeScript dengan **Bun** sebagai runtime, **ElysiaJS** sebagai web framework yang sangat cepat, dan **Drizzle ORM** untuk berinteraksi dengan database MySQL.

## Arsitektur dan Struktur Folder

Proyek ini menggunakan struktur folder yang terorganisir dengan pemisahan tanggung jawab (separation of concerns):

- `src/` : Direktori utama kode sumber aplikasi.
  - `db/` : Konfigurasi database dan definisi skema Drizzle (`schema.ts`).
  - `routes/` : Definisi endpoint API dan routing (contoh: `users-route.ts`).
  - `services/` : Berisi business logic dan operasi database (contoh: `users-services.ts`).
  - `index.ts` : Titik masuk (entry point) aplikasi di mana server Elysia diinisialisasi dan dijalankan.
- `drizzle/` : Direktori yang dihasilkan oleh Drizzle Kit berisi file-file migrasi SQL.
- `test/` : Direktori untuk file-file pengujian otomatis (automated tests) seperti `users-api.test.ts`.
- `package.json` : Konfigurasi proyek, script npm/bun, dan daftar dependency.
- `.env` : (Harus dibuat) File konfigurasi untuk environment variables.

## API yang Tersedia

Aplikasi menyediakan beberapa endpoint API berikut:

### General API
- `GET /health` : Endpoint untuk mengecek status kesehatan server (health check).
- `GET /` : Endpoint root yang mengembalikan informasi aplikasi.

### Users API (`/api/users`)
- `POST /api/users/` : Mendaftarkan pengguna baru (Register).
  - **Body (JSON):** `name`, `email`, `password`
- `POST /api/users/login` : Login pengguna dan mendapatkan token sesi.
  - **Body (JSON):** `email`, `password`
- `GET /api/users/current` : Mengambil data profil pengguna yang sedang login.
  - **Headers:** `Authorization: Bearer <token>`
- `DELETE /api/users/logout` : Logout pengguna dan menghapus sesi yang aktif.
  - **Headers:** `Authorization: Bearer <token>`

## Schema Database

Aplikasi ini menggunakan database MySQL dengan skema tabel sebagai berikut (didefinisikan di `src/db/schema.ts`):

1. **Tabel `users`**:
   - `id` : `INT` (Primary Key, Auto Increment)
   - `name` : `VARCHAR(255)` (Not Null)
   - `email` : `VARCHAR(255)` (Not Null, Unique)
   - `password` : `VARCHAR(255)` (Not Null)
   - `createdAt` : `TIMESTAMP` (Default CURRENT_TIMESTAMP)

2. **Tabel `sessions`**:
   - `id` : `INT` (Primary Key, Auto Increment)
   - `token` : `VARCHAR(255)` (Not Null)
   - `userId` : `INT` (Not Null, Foreign Key ke `users.id`)
   - `createdAt` : `TIMESTAMP` (Default CURRENT_TIMESTAMP)

## Technology Stack

- **Bahasa Pemrograman:** TypeScript
- **Runtime:** Bun
- **Web Framework:** ElysiaJS
- **ORM (Object-Relational Mapping):** Drizzle ORM
- **Database:** MySQL
- **Testing:** Bun Test (Bawaan dari Bun)

## Library yang Digunakan

- `elysia`: Framework web utama.
- `@elysiajs/cors`: Plugin CORS untuk Elysia.
- `drizzle-orm` & `drizzle-kit`: Untuk manajemen skema database dan query ke MySQL.
- `mysql2`: Driver MySQL untuk berinteraksi dengan database.
- `dotenv`: Untuk memuat variabel dari file `.env`.

## Cara Setup Project

1. **Install Dependencies:**
   Jalankan perintah berikut di terminal untuk menginstal semua library yang dibutuhkan:
   ```bash
   bun install
   ```

2. **Setup Environment Variables:**
   - Salin file `.env.example` dan ubah namanya menjadi `.env`.
   - Buka file `.env` dan sesuaikan koneksi database MySQL pada variabel `DATABASE_URL` serta port server pada variabel `PORT`.

3. **Setup Database:**
   Untuk menyinkronkan skema ke database MySQL yang sudah ada, jalankan:
   ```bash
   bun run db:push
   ```
   *(Atau gunakan `bun run db:generate` untuk membuat file migrasi SQL baru)*

## Cara Menjalankan Aplikasi

Untuk menjalankan aplikasi dalam mode pengembangan (development) dengan fitur hot-reload:
```bash
bun run dev
```

Untuk menjalankan aplikasi tanpa hot-reload (mode produksi/start biasa):
```bash
bun run start
```
*(Server akan berjalan pada port yang ditentukan di file `.env` atau port 3000 secara default)*

## Cara Test Aplikasi

Untuk menjalankan unit test atau API test yang ada di dalam folder `test/`, gunakan test runner bawaan Bun:
```bash
bun test
```
