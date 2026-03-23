<template>
  <div class="lessons-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Dersler</h1>
          <p class="page-subtitle">Dersleri yönetin, dağıtım planlarını belirleyin</p>
        </div>
        <button @click="openAddModal" class="btn btn-primary">
          <Plus class="icon" />
          Ders Ekle
        </button>
      </div>
    </header>

    <!-- Lessons grouped by Type, Level, and Field -->
    <div class="lessons-content">
      <!-- Zorunlu Dersler -->
      <div class="type-section" v-if="lessonsStore.lessonsByType.zorunlu.length > 0">
        <h3 class="type-title zorunlu">
          <Shield class="type-icon" />
          Zorunlu Dersler
        </h3>
        <div v-for="group in lessonsStore.lessonsByType.zorunlu" :key="group.key" class="group-section">
          <h4 class="group-title">{{ group.level }}. Sınıf {{ group.field !== 'default' ? '- ' + group.field : '' }}</h4>
          <div class="lessons-grid">
            <div
              v-for="lesson in group.lessons"
              :key="lesson.id"
              class="lesson-card"
              :class="{ staj: lesson.isStaj }"
            >
              <div class="lesson-header">
                <div class="lesson-code-badge">{{ lesson.code }}</div>
                <div v-if="lesson.isStaj" class="staj-badge">Staj</div>
              </div>
              <h4 class="lesson-name">{{ lesson.name }}</h4>
              <div class="lesson-details">
                <span class="detail-item">
                  <BookOpen class="detail-icon" />
                  {{ lesson.branch }}
                </span>
                <span class="detail-item">
                  <Layers class="detail-icon" />
                  {{ lesson.distributionPlan }}
                </span>
                <span class="detail-item" v-if="lesson.field && lesson.field !== 'default'">
                  <Tag class="detail-icon" />
                  {{ lesson.field }}
                </span>
              </div>
              <div class="lesson-actions">
                <button @click="editLesson(lesson)" class="btn-icon" title="Düzenle">
                  <Edit2 class="icon" />
                </button>
                <button @click="confirmDelete(lesson)" class="btn-icon danger" title="Sil">
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seçmeli Dersler -->
      <div class="type-section" v-if="lessonsStore.lessonsByType.secmeli.length > 0">
        <h3 class="type-title secmeli">
          <CheckSquare class="type-icon" />
          Seçmeli Dersler
        </h3>
        <div v-for="group in lessonsStore.lessonsByType.secmeli" :key="group.key" class="group-section">
          <h4 class="group-title">{{ group.level }}. Sınıf {{ group.field !== 'default' ? '- ' + group.field : '' }}</h4>
          <div class="lessons-grid">
            <div
              v-for="lesson in group.lessons"
              :key="lesson.id"
              class="lesson-card secmeli"
            >
              <div class="lesson-header">
                <div class="lesson-code-badge secmeli">{{ lesson.code }}</div>
              </div>
              <h4 class="lesson-name">{{ lesson.name }}</h4>
              <div class="lesson-details">
                <span class="detail-item">
                  <BookOpen class="detail-icon" />
                  {{ lesson.branch }}
                </span>
                <span class="detail-item">
                  <Layers class="detail-icon" />
                  {{ lesson.distributionPlan }}
                </span>
              </div>
              <div class="lesson-actions">
                <button @click="editLesson(lesson)" class="btn-icon" title="Düzenle">
                  <Edit2 class="icon" />
                </button>
                <button @click="confirmDelete(lesson)" class="btn-icon danger" title="Sil">
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rehberlik Dersleri -->
      <div class="type-section" v-if="lessonsStore.lessonsByType.rehberlik.length > 0">
        <h3 class="type-title rehberlik">
          <HeartHandshake class="type-icon" />
          Rehberlik Dersleri
        </h3>
        <div v-for="group in lessonsStore.lessonsByType.rehberlik" :key="group.key" class="group-section">
          <h4 class="group-title">{{ group.level }}. Sınıf {{ group.field !== 'default' ? '- ' + group.field : '' }}</h4>
          <div class="lessons-grid">
            <div
              v-for="lesson in group.lessons"
              :key="lesson.id"
              class="lesson-card rehberlik"
            >
              <div class="lesson-header">
                <div class="lesson-code-badge rehberlik">{{ lesson.code }}</div>
              </div>
              <h4 class="lesson-name">{{ lesson.name }}</h4>
              <div class="lesson-details">
                <span class="detail-item">
                  <BookOpen class="detail-icon" />
                  {{ lesson.branch }}
                </span>
                <span class="detail-item">
                  <Layers class="detail-icon" />
                  {{ lesson.distributionPlan }}
                </span>
              </div>
              <div class="lesson-actions">
                <button @click="editLesson(lesson)" class="btn-icon" title="Düzenle">
                  <Edit2 class="icon" />
                </button>
                <button @click="confirmDelete(lesson)" class="btn-icon danger" title="Sil">
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="lessonsStore.lessons.length === 0" class="empty-state">
        <BookOpen class="empty-icon" />
        <p>Henüz ders eklenmemiş</p>
      </div>
    </div>

    <!-- Add/Edit Lesson Modal -->
    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <h3>{{ editingLesson ? 'Ders Düzenle' : 'Yeni Ders' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveLesson" class="lesson-form">
          <div v-if="validationError" class="error-alert">
            {{ validationError }}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ders Adı *</label>
              <input 
                v-model="form.name" 
                @blur="capitalizeOnBlur('name')" 
                @click.stop 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.name }" 
                required 
                placeholder="örn: Matematik"
              >
              <span v-if="validationErrors.name" class="error-message">{{ validationErrors.name }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Kısaltma *</label>
              <input 
                v-model="form.code" 
                @blur="form.code = form.code.toLocaleUpperCase('tr-TR')" 
                @click.stop 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.code }" 
                required 
                maxlength="5" 
                placeholder="örn: MAT"
              >
              <span v-if="validationErrors.code" class="error-message">{{ validationErrors.code }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Branş *</label>
              <input 
                v-model="form.branch" 
                @blur="capitalizeOnBlur('branch')" 
                @click.stop 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.branch }" 
                required 
                placeholder="örn: Matematik"
              >
              <span v-if="validationErrors.branch" class="error-message">{{ validationErrors.branch }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Sınıf Düzeyi *</label>
              <select 
                v-model="form.level" 
                class="form-select" 
                @click.stop 
                :class="{ error: validationErrors.level }" 
                required 
                :disabled="settingsStore.classLevels.length === 0"
              >
                <option v-if="settingsStore.classLevels.length === 0" value="">Önce okul tipi ayarlayın</option>
                <option v-for="level in settingsStore.classLevels" :key="level" :value="level">
                  {{ level === 'Hazırlık' ? 'Hazırlık Sınıfı' : level + '. Sınıf' }}
                </option>
              </select>
              <span v-if="validationErrors.level" class="error-message">{{ validationErrors.level }}</span>
              <small v-if="settingsStore.classLevels.length === 0" class="help-text error">Ayarlardan okul tipi seçmelisiniz</small>
            </div>
          </div>

          <div class="form-row" v-if="settingsStore.schoolType === 'lise'">
            <div class="form-group">
              <label class="form-label">Alan</label>
              <select v-model="form.field" class="form-select" @click.stop>
                <option v-for="fld in settingsStore.fields" :key="fld.id" :value="fld.id">
                  {{ fld.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ders Türü *</label>
              <select v-model="form.type" class="form-select" @click.stop required>
                <option value="zorunlu">Zorunlu</option>
                <option value="secmeli">Seçmeli</option>
                <option value="rehberlik">Rehberlik</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Dağıtım Planı *</label>
              <input v-model="form.distributionPlan" @click.stop type="text" class="form-input" required 
                     placeholder="örn: 2+2+2 veya 3+3" pattern="[0-9+]+">>
              <small class="help-text">Haftalık ders saatlerini + işaretiyle ayırın</small>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.isStaj" type="checkbox" class="checkbox-input">
              <span class="checkbox-text">Staj Uygulaması (Öğretmensiz)</span>
            </label>
          </div>
        </form>
      </template>
      <template #footer>
        <button type="button" @click="closeModal" class="btn btn-secondary">İptal</button>
        <button type="button" @click="saveLesson" class="btn btn-primary">Kaydet</button>
      </template>
    </Modal>

    <!-- Delete Confirmation -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3>Ders Sil</h3>
      </template>
      <template #body>
        <p><strong>{{ lessonToDelete?.name }}</strong> dersini silmek istediğinize emin misiniz?</p>
        <p class="warning-text">Bu işlem geri alınamaz.</p>
      </template>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn btn-secondary">İptal</button>
        <button @click="deleteLesson" class="btn btn-danger">Sil</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useLessonsStore } from '../stores/lessons'
import { useSettingsStore } from '../stores/settings'
import Modal from '../components/common/Modal.vue'
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Shield,
  CheckSquare,
  HeartHandshake,
  Layers,
  Tag
} from 'lucide-vue-next'

const lessonsStore = useLessonsStore()
const settingsStore = useSettingsStore()

// Utility function to capitalize first letter of each word
function capitalizeWords(str) {
  if (!str) return str
  return str.split(' ').map(word => {
    if (!word) return word
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  }).join(' ')
}

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingLesson = ref(null)
const lessonToDelete = ref(null)

const form = ref({
  name: '',
  code: '',
  branch: '',
  level: '',
  field: 'default',
  type: 'zorunlu',
  distributionPlan: '',
  isStaj: false
})

const validationError = ref('')

const validationErrors = ref({
  name: '',
  code: '',
  branch: '',
  level: ''
})

// Capitalize on blur instead of watch to avoid focus issues
async function capitalizeOnBlur(field) {
  if (form.value[field]) {
    form.value[field] = capitalizeWords(form.value[field])
    await nextTick()
  }
}

function openAddModal() {
  editingLesson.value = null
  form.value = {
    name: '',
    code: '',
    branch: '',
    level: settingsStore.classLevels[0] || '',
    field: 'default',
    type: 'zorunlu',
    distributionPlan: '',
    isStaj: false
  }
  showModal.value = true
}

function editLesson(lesson) {
  editingLesson.value = lesson
  form.value = { ...lesson }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingLesson.value = null
  validationError.value = ''
}

function saveLesson() {
  // Clear previous errors
  validationErrors.value = {
    name: '',
    code: '',
    branch: '',
    level: ''
  }
  
  // Validate all required fields
  let hasErrors = false
  
  if (!form.value.name.trim()) {
    validationErrors.value.name = 'Lütfen ders adı girin.'
    hasErrors = true
  }
  if (!form.value.code.trim()) {
    validationErrors.value.code = 'Lütfen ders kısaltması (kodu) girin.'
    hasErrors = true
  }
  if (!form.value.branch.trim()) {
    validationErrors.value.branch = 'Lütfen branş girin.'
    hasErrors = true
  }
  if (!form.value.level) {
    validationErrors.value.level = 'Lütfen sınıf düzeyi seçin. Ayarlardan okul tipi ayarlanmamış olabilir.'
    hasErrors = true
  }
  
  if (hasErrors) return
  
  if (editingLesson.value) {
    lessonsStore.updateLesson(editingLesson.value.id, form.value)
  } else {
    lessonsStore.addLesson(form.value)
  }
  closeModal()
}

function confirmDelete(lesson) {
  lessonToDelete.value = lesson
  showDeleteModal.value = true
}

function deleteLesson() {
  if (lessonToDelete.value) {
    lessonsStore.deleteLesson(lessonToDelete.value.id)
  }
  showDeleteModal.value = false
  lessonToDelete.value = null
}
</script>

<style scoped>
.error-alert {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  color: #c33;
  font-size: 14px;
  white-space: pre-line;
}

.lessons-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.type-section {
  margin-bottom: 32px;
}

.type-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.type-title.zorunlu {
  background: #dbeafe;
  color: #1d4ed8;
}

.type-title.secmeli {
  background: #fef3c7;
  color: #b45309;
}

.type-title.rehberlik {
  background: #d1fae5;
  color: #059669;
}

.type-icon {
  width: 20px;
  height: 20px;
}

.group-section {
  margin-bottom: 24px;
  padding-left: 16px;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.lesson-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.lesson-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.lesson-card.staj {
  background: #f3e8ff;
  border-color: #c4b5fd;
}

.lesson-card.secmeli {
  background: #fffbeb;
  border-color: #fcd34d;
}

.lesson-card.rehberlik {
  background: #ecfdf5;
  border-color: #6ee7b7;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.lesson-code-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
}

.lesson-code-badge.secmeli {
  background: #fef3c7;
  color: #b45309;
}

.lesson-code-badge.rehberlik {
  background: #d1fae5;
  color: #059669;
}

.staj-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #8b5cf6;
  color: white;
  border-radius: 4px;
}

.lesson-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.lesson-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.detail-icon {
  width: 14px;
  height: 14px;
}

.lesson-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.btn-icon.danger:hover {
  background: var(--danger-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Form styles */
.lesson-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-group {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-primary);
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.help-text.error {
  color: var(--danger-color);
  font-weight: 500;
}

.form-input.error,
.form-select.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-input.error:focus,
.form-select.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

.error-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
  font-weight: 500;
}

.warning-text {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .lessons-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
