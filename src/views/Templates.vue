<template>
  <div class="templates-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Şablonlar</h1>
          <p class="page-subtitle">Excel şablonlarını indirin ve verilerinizi kolayca yükleyin</p>
        </div>
      </div>
    </header>

    <div class="templates-content">
      <div class="templates-grid">
        <!-- Öğretmenler Şablonu -->
        <div class="template-card">
          <div class="template-header">
            <div class="template-icon">
              <Users class="icon" />
            </div>
            <h3 class="template-title">Öğretmenler Şablonu</h3>
          </div>
          <p class="template-description">
            Öğretmen bilgilerini toplu olarak yüklemek için kullanabileceğiniz Excel şablonu.
          </p>
          <div class="template-details">
            <div class="detail-item">
              <FileText class="detail-icon" />
              <span>Gerekli Kolonlar:</span>
            </div>
            <ul class="columns-list">
              <li><strong>name</strong> veya <strong>ad</strong> - Öğretmen adı</li>
              <li><strong>code</strong> veya <strong>kısaltma</strong> - Öğretmen kodu</li>
              <li><strong>branch</strong> veya <strong>branş</strong> - Branş bilgisi</li>
              <li><strong>maxHours</strong> - Maksimum ders saati (isteğe bağlı)</li>
            </ul>
          </div>
          <a href="/templates/ogretmenler_sablonu.xlsx" download class="btn btn-primary">
            <Download class="icon" />
            Şablonu İndir
          </a>
        </div>

        <!-- Dersler Şablonu -->
        <div class="template-card">
          <div class="template-header">
            <div class="template-icon">
              <BookOpen class="icon" />
            </div>
            <h3 class="template-title">Dersler Şablonu</h3>
          </div>
          <p class="template-description">
            Ders bilgilerini toplu olarak yüklemek için kullanabileceğiniz Excel şablonu.
          </p>
          <div class="template-details">
            <div class="detail-item">
              <FileText class="detail-icon" />
              <span>Gerekli Kolonlar:</span>
            </div>
            <ul class="columns-list">
              <li><strong>name</strong> veya <strong>ad</strong> - Ders adı</li>
              <li><strong>code</strong> veya <strong>kısaltma</strong> - Ders kodu</li>
              <li><strong>level</strong> veya <strong>sınıf</strong> - Sınıf düzeyi</li>
              <li><strong>type</strong> veya <strong>tür</strong> - Ders türü (zorunlu/secmeli/rehberlik)</li>
              <li><strong>distributionPlan</strong> - Dağıtım planı (örn: 2+2+2)</li>
              <li><strong>field</strong> - Alan (lise için isteğe bağlı)</li>
              <li><strong>isStaj</strong> - Staj dersi mi? (true/false, isteğe bağlı)</li>
            </ul>
          </div>
          <a href="/templates/dersler_sablonu.xlsx" download class="btn btn-primary">
            <Download class="icon" />
            Şablonu İndir
          </a>
        </div>

        <!-- Sınıflar Şablonu -->
        <div class="template-card">
          <div class="template-header">
            <div class="template-icon">
              <School class="icon" />
            </div>
            <h3 class="template-title">Sınıflar Şablonu</h3>
          </div>
          <p class="template-description">
            Sınıf bilgilerini toplu olarak yüklemek için kullanabileceğiniz Excel şablonu.
          </p>
          <div class="template-details">
            <div class="detail-item">
              <FileText class="detail-icon" />
              <span>Gerekli Kolonlar:</span>
            </div>
            <ul class="columns-list">
              <li><strong>name</strong> - Sınıf adı</li>
              <li><strong>level</strong> - Sınıf düzeyi</li>
              <li><strong>field</strong> - Alan (lise için)</li>
              <li><strong>capacity</strong> - Kapasite (isteğe bağlı)</li>
            </ul>
          </div>
          <a href="/templates/siniflar_sablonu.xlsx" download class="btn btn-primary">
            <Download class="icon" />
            Şablonu İndir
          </a>
        </div>
      </div>

      <!-- Kullanım Kılavuzu -->
      <div class="usage-guide">
        <h3 class="guide-title">
          <HelpCircle class="guide-icon" />
          Kullanım Kılavuzu
        </h3>
        <div class="guide-content">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Şablonu İndirin</h4>
              <p>İlgili sayfadan uygun şablonu indirin.</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Verilerinizi Doldurun</h4>
              <p>Excel dosyasında belirtilen kolonlara verilerinizi girin. Zorunlu alanları boş bırakmayın.</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Dosyayı Yükleyin</h4>
              <p>İlgili sayfaya gidin ve "Excel'den Yükle" butonunu kullanarak dosyayı yükleyin.</p>
            </div>
          </div>
          <div class="guide-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Kontrol Edin</h4>
              <p>Yükleme işlemi tamamlandıktan sonra verilerin doğru eklendiğini kontrol edin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Users,
  BookOpen,
  School,
  Download,
  FileText,
  HelpCircle
} from 'lucide-vue-next'
</script>

<style scoped>
.templates-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.templates-content {
  max-width: 1200px;
  margin: 0 auto;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.template-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.template-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.template-icon .icon {
  width: 24px;
  height: 24px;
}

.template-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.template-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.template-details {
  margin-bottom: 24px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.columns-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.columns-list li {
  padding: 4px 0;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.columns-list li:last-child {
  border-bottom: none;
}

.btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.usage-guide {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--border-color);
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.guide-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.guide-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.guide-step {
  display: flex;
  gap: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.step-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .guide-content {
    grid-template-columns: 1fr;
  }

  .guide-step {
    flex-direction: column;
    text-align: center;
  }
}
</style>