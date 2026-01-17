# **Product Requirement Document (PRD)**

## **Project Name: BILA (Bilingual Interlinear Learning App)**

**Version:** 1.0

**Role:** Product Owner & Lead Engineer

**Stakeholder:** User (Validator & Content Curator)

## **1\. Ringkasan Proyek (Executive Summary)**

BILA adalah aplikasi pembelajaran bahasa berbasis web yang menggunakan metode **Interlinear Gloss**. Fokus utama aplikasi ini adalah membantu pengguna memperkaya kosa kata melalui bacaan di mana teks bahasa sumber (Source) diletakkan di atas dan teks bahasa target (Target) diletakkan tepat di bawahnya secara berpasangan. Konten dihasilkan oleh AI eksternal, divalidasi oleh pengguna, dan dirender secara dinamis oleh aplikasi.

## **2\. Tujuan & Visi (Objectives & Vision)**

* **Meningkatkan Kosa Kata:** Memudahkan pemetaan makna kata/frasa dalam konteks kalimat.  
* **Kontrol Kualitas Tinggi:** Menggunakan alur *Human-in-the-Loop* di mana pengguna bertindak sebagai editor sebelum konten dipublikasikan.  
* **Fleksibilitas Bahasa:** Sistem harus mampu mendukung pasangan bahasa apa pun (misal: EN-ID, JP-ID, DE-ID) tanpa perubahan kode fundamental.

## **3\. Alur Kerja Pengguna (User Workflow)**

1. **Generasi Konten (Luar Aplikasi):** Pengguna menggunakan LLM eksternal (ChatGPT/Claude/dll) dengan *System Prompt* yang disepakati untuk menghasilkan JSON.  
2. **Input & Validasi (Mode Editor):**  
   * Pengguna menempelkan JSON ke dalam aplikasi.  
   * Aplikasi merender tampilan pratinjau.  
   * Pengguna mengedit, menambah, atau menghapus pasangan kata jika AI melakukan kesalahan pemetaan.  
3. **Publikasi:** Pengguna menyimpan konten yang sudah bersih ke dalam database aplikasi.  
4. **Konsumsi:** Pengguna membaca konten dengan UI yang optimal untuk pembelajaran.

## **4\. Kebutuhan Fungsional (Functional Requirements)**

### **FR1: Ingesti Data Agnostik Bahasa**

* Sistem harus menerima input format JSON berupa Array of Objects.  
* Struktur objek harus menggunakan kunci generik: source (bahasa yang dipelajari) dan target (bahasa pengantar/terjemahan).  
* *Metadata* konten harus mencatat label bahasa (misal: "English to Indonesia").

### **FR2: Editor Validasi Interaktif**

* Fitur untuk mengubah teks pada blok source maupun target.  
* Fitur untuk melakukan *split* (memecah) atau *merge* (menggabungkan) blok kosa kata.  
* Validasi struktur: Memastikan setiap blok source memiliki pasangan target.

### **FR3: Mesin Rendering Interlinear**

* Teks dirender dalam pasangan vertikal (Source di atas, Target di bawah).  
* **Sticky Pairs:** Jika sebuah baris mencapai batas lebar layar, satu pasangan (source & target) harus berpindah baris bersamaan sebagai satu kesatuan. Tidak boleh teks source tertinggal di baris atas sementara target-nya ada di baris bawah.

### **FR4: Manajemen Konten**

* Menyimpan koleksi bacaan berdasarkan kategori atau tanggal.  
* Fitur untuk menghapus atau menyunting kembali konten yang sudah disimpan.

## **5\. Spesifikasi Teknis (Technical Specifications)**

### **5.1 Struktur Data (Data Schema)**

Sistem akan menggunakan format berikut untuk menjamin skalabilitas:

{  
  "metadata": {  
    "title": "Judul Bacaan",  
    "source\_lang": "en",  
    "target\_lang": "id"  
  },  
  "data": \[  
    { "source": "I", "target": "Saya" },  
    { "source": "look forward to", "target": "menantikan" },  
    { "source": "meeting", "target": "bertemu" },  
    { "source": "you", "target": "anda" }  
  \]  
}

### **5.2 Antarmuka (UI/UX)**

* **Layout:** Responsive Web Design (Mobile & Desktop).  
* **Typography:** Menggunakan font yang mendukung karakter khusus (untuk kebutuhan bahasa seperti Jepang/Arab di masa depan).  
* **Styling:** Kontainer pasangan menggunakan display: inline-flex dengan flex-direction: column.

## **6\. Rencana Pengembangan (Roadmap)**

* **Fase 1:** Pembuatan modul rendering dan editor JSON sederhana.  
* **Fase 2:** Implementasi sistem penyimpanan (Database).  
* **Fase 3:** Penambahan fitur pendukung (Audio TTS, Toggle Hide/Show terjemahan).

*Dokumen ini merupakan acuan final untuk pengembangan sistem BILA.*