# Ders Programı Yönetim Sistemi

Okul ders programlarını otomatik oluşturmak için kapsamlı bir masaüstü uygulaması.

## Özellikler

### 🏫 Okul Yönetimi
- Okul türüne göre (İlkokul/Ortaokul/Lise) sınıf düzeyleri otomatik ayarlama
- Lise için alan (Fen, Sosyal vb.) tanımlama
- Okul bilgileri ve ders saati ayarları

### 👨‍🏫 Öğretmen Yönetimi
- Öğretmen ekleme/düzenleme/silme
- Excel'den toplu öğretmen yükleme
- Müsait saat ve günlük limit belirleme
- Görev (Koordinatörlük, Alan Şefliği vb.) atama

### 🏫 Sınıf Yönetimi
- Sınıf ekleme/düzenleme/silme
- Rehber öğretmen atama
- Zorunlu/Seçmeli/Rehberlik ders saati tanımlama
- Günlük maksimum ders saati limiti

### 📚 Ders Yönetimi
- Zorunlu, Seçmeli ve Rehberlik dersleri
- Ders dağıtım planı (örn: 2+2+2)
- Staj uygulaması dersleri (öğretmensiz)
- Otomatik sınıf eşleştirme

### 🔒 Kısıtlamalar
- **Aynı Saat**: Belirli derslerin aynı anda başlaması
- **Farklı Gün**: İki dersin aynı güne denk gelmemesi
- **Belirli Günler**: Dersin sadece seçili günlere yerleştirilmesi

### 📅 Program Oluşturma
- Kapsamlı validasyon kontrolleri
- Otomatik ders yerleştirme algoritması
- Gerçek zamanlı ilerleme takibi
- Sınıf ve öğretmen program görünümü

## Teknolojiler

- **Frontend**: Vue 3 + Vite
- **Backend**: Electron
- **Database**: SQLite (better-sqlite3)
- **UI**: Modern CSS3 + Lucide Icons
- **State Management**: Pinia
- **Routing**: Vue Router

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. Projeyi klonlayın:
```bash
cd ders-programi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme modunda çalıştırın:
```bash
npm run electron-dev
```

4. Üretim sürümü oluşturun:
```bash
npm run build-electron
```

## Proje Yapısı

```
ders-programi/
├── electron/              # Electron ana süreç dosyaları
│   ├── main.js           # Ana süreç giriş noktası
│   ├── preload.js        # Preload script
│   └── database.js       # SQLite veritabanı yönetimi
├── src/
│   ├── components/       # Vue komponentleri
│   │   ├── layout/       # Layout komponentleri
│   │   └── common/       # Ortak kullanım komponentleri
│   ├── stores/           # Pinia store dosyaları
│   ├── views/            # Sayfa görünümleri
│   ├── router/           # Vue Router yapılandırması
│   ├── App.vue           # Ana uygulama komponenti
│   ├── main.js           # Uygulama giriş noktası
│   └── style.css         # Global stiller
├── index.html            # HTML şablonu
├── vite.config.js        # Vite yapılandırması
├── package.json          # Proje bağımlılıkları
└── README.md             # Bu dosya
```

## Kullanım

1. **İlk Ayarlar**: Ayarlar sayfasından okul türünü ve ders saatlerini belirleyin
2. **Öğretmen Ekleme**: Öğretmenler sayfasından öğretmenleri ekleyin ve müsait saatlerini belirleyin
3. **Sınıf Ekleme**: Sınıflar sayfasından sınıfları oluşturun
4. **Ders Ekleme**: Dersleri ve dağıtım planlarını tanımlayın
5. **Atamalar**: Sınıflara dersleri ve öğretmenleri atayın
6. **Kısıtlamalar**: Gerekli ders programı kısıtlamalarını ekleyin
7. **Program Oluştur**: Otomatik program oluşturma işlemini başlatın

## Veritabanı

SQLite veritabanı kullanıcı veri dizininde otomatik oluşturulur:
- **Windows**: `%APPDATA%/ders-programi/ders-programi.db`
- **macOS**: `~/Library/Application Support/ders-programi/ders-programi.db`
- **Linux**: `~/.config/ders-programi/ders-programi.db`

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız ve önerileriniz için lütfen issue açın.
