<template>
  <div class="teachers-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Öğretmenler</h1>
          <p class="page-subtitle">Öğretmenleri yönetin, müsait saatleri belirleyin</p>
        </div>
        <div class="header-actions">
          <button @click="showImportModal = true" class="btn btn-secondary">
            <Upload class="icon" />
            Excel'den Yükle
          </button>
          <button @click="openAddModal" class="btn btn-primary">
            <Plus class="icon" />
            Öğretmen Ekle
          </button>
        </div>
      </div>
    </header>

    <!-- Search -->
    <div class="search-bar">
      <Search class="search-icon" />
      <input
        v-model="teachersStore.searchQuery"
        type="text"
        class="search-input"
        placeholder="Öğretmen ara (ad, soyad, branş, kısaltma)..."
      >
    </div>

    <!-- Teachers List Grouped by Branch -->
    <div class="teachers-content">
      <div v-for="branch in filteredTeachers.sortedBranches" :key="branch" class="branch-section">
        <h3 class="branch-title">{{ branch }}</h3>
        <div class="teachers-grid">
          <div
            v-for="teacher in filteredTeachers.grouped[branch]"
            :key="teacher.id"
            class="teacher-card"
            @click="viewTeacherDetails(teacher)"
          >
            <div class="teacher-header">
              <div class="teacher-avatar">
                {{ getInitials(teacher.firstName, teacher.lastName) }}
              </div>
              <div class="teacher-info">
                <h4 class="teacher-name">{{ teacher.firstName }} {{ teacher.lastName }}</h4>
                <span class="teacher-short">{{ teacher.shortName }}</span>
              </div>
            </div>
            <div class="teacher-body">
              <div class="info-row">
                <Phone class="info-icon" />
                <span>{{ teacher.phone || '-' }}</span>
              </div>
              <div class="info-row">
                <Clock class="info-icon" />
                <span>{{ getAvailableHours(teacher) }} saat müsait</span>
              </div>
              <div class="info-row" v-if="teacher.duties?.length">
                <Briefcase class="info-icon" />
                <span>{{ teacher.duties.length }} görev</span>
              </div>
            </div>
            <div class="teacher-actions">
              <button @click.stop="editTeacher(teacher)" class="btn-icon" title="Düzenle">
                <Edit2 class="icon" />
              </button>
              <button @click.stop="manageAvailability(teacher)" class="btn-icon" title="Müsait Saatler">
                <Calendar class="icon" />
              </button>
              <button @click.stop="manageDuties(teacher)" class="btn-icon" title="Görevler">
                <Briefcase class="icon" />
              </button>
              <button @click.stop="confirmDelete(teacher)" class="btn-icon danger" title="Sil">
                <Trash2 class="icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTeachers.sortedBranches.length === 0" class="empty-state">
        <Users class="empty-icon" />
        <p>Henüz öğretmen eklenmemiş</p>
      </div>
    </div>

    <!-- Add/Edit Teacher Modal -->
    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <h3>{{ editingTeacher ? 'Öğretmen Düzenle' : 'Yeni Öğretmen' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveTeacher" class="teacher-form">
          <div v-if="validationError" class="error-alert">
            {{ validationError }}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Adı *</label>
              <input 
                v-model="form.firstName" 
                @blur="capitalizeOnBlur('firstName')" 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.firstName }" 
                required
              >
              <span v-if="validationErrors.firstName" class="error-message">{{ validationErrors.firstName }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Soyadı *</label>
              <input 
                v-model="form.lastName" 
                @blur="capitalizeOnBlur('lastName')" 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.lastName }" 
                required
              >
              <span v-if="validationErrors.lastName" class="error-message">{{ validationErrors.lastName }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Branş *</label>
            <input 
              v-model="form.branch" 
              @blur="capitalizeOnBlur('branch')" 
              type="text" 
              class="form-input" 
              :class="{ error: validationErrors.branch }" 
              required 
              placeholder="örn: Matematik, Türkçe"
            >
            <span v-if="validationErrors.branch" class="error-message">{{ validationErrors.branch }}</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Telefon</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="form-input" 
                placeholder="0(5XX) XXX XX XX"
              >
            </div>
            <div class="form-group">
              <label class="form-label">Kısaltma *</label>
              <input 
                v-model="form.shortName" 
                @blur="form.shortName = form.shortName.toLocaleUpperCase('tr-TR')" 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.shortName }" 
                required 
                maxlength="5" 
                placeholder="örn: AYK"
              >
              <span v-if="validationErrors.shortName" class="error-message">{{ validationErrors.shortName }}</span>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button type="button" @click="closeModal" class="btn btn-secondary">İptal</button>
        <button type="button" @click="saveTeacher" class="btn btn-primary">Kaydet</button>
      </template>
    </Modal>

    <!-- Availability Modal -->
    <Modal v-if="showAvailabilityModal" @close="closeAvailabilityModal">
      <template #header>
        <h3>Müsait Saatler - {{ selectedTeacher?.firstName }} {{ selectedTeacher?.lastName }}</h3>
      </template>
      <template #body>
        <div class="availability-grid">
          <div class="day-column" v-for="day in settingsStore.days" :key="day">
            <h4 class="day-title">{{ day }}</h4>
            <div class="slots-list">
              <label v-for="slot in settingsStore.lessonSlots" :key="slot.index" class="slot-item">
                <input
                  type="checkbox"
                  v-model="availability[day][slot.index]"
                  :true-value="true"
                  :false-value="false"
                >
                <span class="slot-label">{{ slot.start }} - {{ slot.end }}</span>
              </label>
            </div>
            <div class="daily-constraints">
              <label class="constraint-label">Günlük Limitler</label>
              <div class="constraint-inputs">
                <input
                  type="number"
                  v-model.number="dailyConstraints[day].min"
                  min="0"
                  max="8"
                  placeholder="Min"
                  class="form-input small"
                >
                <span>-</span>
                <input
                  type="number"
                  v-model.number="dailyConstraints[day].max"
                  min="0"
                  max="8"
                  placeholder="Max"
                  class="form-input small"
                >
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="closeAvailabilityModal" class="btn btn-secondary">İptal</button>
        <button @click="saveAvailability" class="btn btn-primary">Kaydet</button>
      </template>
    </Modal>

    <!-- Duties Modal -->
    <Modal v-if="showDutiesModal" @close="closeDutiesModal">
      <template #header>
        <h3>Görevler - {{ selectedTeacher?.firstName }} {{ selectedTeacher?.lastName }}</h3>
      </template>
      <template #body>
        <div class="duties-list">
          <div v-for="duty in selectedTeacher?.duties" :key="duty.id" class="duty-item">
            <div class="duty-info">
              <span class="duty-name">{{ duty.name }}</span>
              <span class="duty-time">{{ duty.day }} - {{ getSlotTime(duty.slot) }}</span>
            </div>
            <button @click="removeDuty(duty.id)" class="btn-icon danger">
              <Trash2 class="icon" />
            </button>
          </div>
          <div v-if="!selectedTeacher?.duties?.length" class="empty-duties">
            Henüz görev eklenmemiş
          </div>
        </div>
        <div class="add-duty-section">
          <h4>Yeni Görev Ekle</h4>
          <div class="form-group">
            <label class="form-label">Görev Adı</label>
            <input v-model="newDuty.name" type="text" class="form-input" placeholder="örn: Koordinatörlük">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Gün</label>
              <select v-model="newDuty.day" class="form-select">
                <option v-for="day in settingsStore.days" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Saat</label>
              <select v-model.number="newDuty.slot" class="form-select">
                <option v-for="slot in settingsStore.lessonSlots" :key="slot.index" :value="slot.index">
                  {{ slot.start }} - {{ slot.end }}
                </option>
              </select>
            </div>
          </div>
          <button @click="addDuty" class="btn btn-secondary" :disabled="!newDuty.name">
            <Plus class="icon" />
            Görev Ekle
          </button>
        </div>
      </template>
      <template #footer>
        <button @click="closeDutiesModal" class="btn btn-primary">Tamam</button>
      </template>
    </Modal>

    <!-- Import Modal -->
    <Modal v-if="showImportModal" @close="showImportModal = false">
      <template #header>
        <h3>Excel'den Öğretmen Yükle</h3>
      </template>
      <template #body>
        <div class="import-section">
          <p class="import-info">Excel dosyanızda şu kolonlar olmalıdır:</p>
          <ul class="import-columns">
            <li><strong>firstName</strong> veya <strong>ad</strong></li>
            <li><strong>lastName</strong> veya <strong>soyad</strong></li>
            <li><strong>branch</strong> veya <strong>branş</strong></li>
            <li><strong>phone</strong> veya <strong>telefon</strong> (isteğe bağlı)</li>
            <li><strong>shortName</strong> veya <strong>kısaltma</strong></li>
          </ul>
          <div class="file-upload">
            <input type="file" ref="fileInput" accept=".xlsx,.xls" @change="handleFileUpload" class="file-input">
            <button @click="$refs.fileInput.click()" class="btn btn-secondary">
              <FileUp class="icon" />
              Dosya Seç
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3>Öğretmen Sil</h3>
      </template>
      <template #body>
        <p><strong>{{ teacherToDelete?.firstName }} {{ teacherToDelete?.lastName }}</strong> öğretmenini silmek istediğinize emin misiniz?</p>
        <p class="warning-text">Bu işlem geri alınamaz.</p>
      </template>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn btn-secondary">İptal</button>
        <button @click="deleteTeacher" class="btn btn-danger">Sil</button>
      </template>
    </Modal>
  </div>

  <div v-if="importMessage" :class="['import-message', importMessage.includes('Veri içe aktarılamadı') || importMessage.includes('hata') ? 'error' : 'success']">
    {{ importMessage }}
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useTeachersStore } from '../stores/teachers'
import { useSettingsStore } from '../stores/settings'
import Modal from '../components/common/Modal.vue'
import * as XLSX from 'xlsx'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Phone,
  Clock,
  Briefcase,
  Calendar,
  Users,
  FileUp
} from 'lucide-vue-next'

// Utility function to capitalize first letter of each word
function capitalizeWords(str) {
  if (!str) return str
  return str.split(' ').map(word => {
    if (!word) return word
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  }).join(' ')
}

const teachersStore = useTeachersStore()
const settingsStore = useSettingsStore()

const showModal = ref(false)
const showAvailabilityModal = ref(false)
const showDutiesModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const editingTeacher = ref(null)
const selectedTeacher = ref(null)
const teacherToDelete = ref(null)
const importMessage = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  branch: '',
  phone: '',
  shortName: ''
})

const validationErrors = ref({
  firstName: '',
  lastName: '',
  branch: '',
  shortName: ''
})

const validationError = ref('')

// Capitalize on blur instead of watch to avoid focus issues
async function capitalizeOnBlur(field) {
  if (form.value[field]) {
    form.value[field] = capitalizeWords(form.value[field])
    await nextTick()
  }
}

const availability = ref({})
const dailyConstraints = ref({})
const newDuty = ref({ name: '', day: '', slot: 0 })

const filteredTeachers = computed(() => teachersStore.filteredTeachers)

function getInitials(firstName, lastName) {
  return (firstName?.[0] || '') + (lastName?.[0] || '')
}

function getAvailableHours(teacher) {
  if (!teacher.availability) return 0
  let count = 0
  Object.values(teacher.availability).forEach(day => {
    count += day.filter(Boolean).length
  })
  return count
}

function openAddModal() {
  editingTeacher.value = null
  // Create a completely new form object
  const newForm = { firstName: '', lastName: '', branch: '', phone: '', shortName: '' }
  form.value = newForm
  showModal.value = true
}

function editTeacher(teacher) {
  editingTeacher.value = teacher
  // Create fresh copy to avoid reference issues
  form.value = { 
    firstName: teacher.firstName || '', 
    lastName: teacher.lastName || '', 
    branch: teacher.branch || '', 
    phone: teacher.phone || '', 
    shortName: teacher.shortName || '' 
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTeacher.value = null
  validationError.value = ''
}

function saveTeacher() {
  // Clear previous errors
  validationErrors.value = {
    firstName: '',
    lastName: '',
    branch: '',
    shortName: ''
  }
  
  // Validate all required fields
  let hasErrors = false
  
  if (!form.value.firstName.trim()) {
    validationErrors.value.firstName = 'Lütfen ad girin.'
    hasErrors = true
  }
  if (!form.value.lastName.trim()) {
    validationErrors.value.lastName = 'Lütfen soyad girin.'
    hasErrors = true
  }
  if (!form.value.branch.trim()) {
    validationErrors.value.branch = 'Lütfen branş girin.'
    hasErrors = true
  }
  if (!form.value.shortName.trim()) {
    validationErrors.value.shortName = 'Lütfen kısaltma girin.'
    hasErrors = true
  }
  
  if (hasErrors) return
  
  if (editingTeacher.value) {
    teachersStore.updateTeacher(editingTeacher.value.id, form.value)
  } else {
    teachersStore.addTeacher(form.value)
  }
  closeModal()
}

function manageAvailability(teacher) {
  selectedTeacher.value = teacher
  // Initialize availability
  availability.value = {}
  dailyConstraints.value = {}
  
  settingsStore.days.forEach(day => {
    availability.value[day] = [...(teacher.availability?.[day] || Array(8).fill(true))]
    dailyConstraints.value[day] = { 
      min: teacher.dailyConstraints?.[day]?.min || 0,
      max: teacher.dailyConstraints?.[day]?.max || settingsStore.dailyLessonHours
    }
  })
  
  showAvailabilityModal.value = true
}

function closeAvailabilityModal() {
  showAvailabilityModal.value = false
  selectedTeacher.value = null
}

function saveAvailability() {
  if (selectedTeacher.value) {
    settingsStore.days.forEach(day => {
      teachersStore.setAvailability(selectedTeacher.value.id, day, availability.value[day])
      teachersStore.setDailyConstraints(selectedTeacher.value.id, day, dailyConstraints.value[day])
    })
  }
  closeAvailabilityModal()
}

function manageDuties(teacher) {
  selectedTeacher.value = teacher
  newDuty.value = { name: '', day: settingsStore.days[0], slot: 0 }
  showDutiesModal.value = true
}

function closeDutiesModal() {
  showDutiesModal.value = false
  selectedTeacher.value = null
}

function addDuty() {
  if (selectedTeacher.value && newDuty.value.name) {
    teachersStore.addDuty(selectedTeacher.value.id, newDuty.value)
    newDuty.value = { name: '', day: settingsStore.days[0], slot: 0 }
  }
}

function removeDuty(dutyId) {
  if (selectedTeacher.value) {
    teachersStore.removeDuty(selectedTeacher.value.id, dutyId)
  }
}

function getSlotTime(slotIndex) {
  const slot = settingsStore.lessonSlots[slotIndex]
  return slot ? `${slot.start} - ${slot.end}` : ''
}

function confirmDelete(teacher) {
  teacherToDelete.value = teacher
  showDeleteModal.value = true
}

function deleteTeacher() {
  if (teacherToDelete.value) {
    teachersStore.deleteTeacher(teacherToDelete.value.id)
  }
  showDeleteModal.value = false
  teacherToDelete.value = null
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      // Veri doğrulama
      const validationErrors = validateExcelData(jsonData)
      if (validationErrors.length > 0) {
        showImportModal.value = false
        importMessage.value = `Veri içe aktarılamadı:\n${validationErrors.join('\n')}`
        // Clear message after 5 seconds for errors
        setTimeout(() => importMessage.value = '', 5000)
        // Reset file input
        event.target.value = ''
        return
      }

      const count = teachersStore.importFromExcel(jsonData)
      showImportModal.value = false
      importMessage.value = `${count} öğretmen başarıyla yüklendi!`
      // Clear message after 3 seconds
      setTimeout(() => importMessage.value = '', 3000)
      // Reset file input
      event.target.value = ''
    } catch (error) {
      showImportModal.value = false
      importMessage.value = `Dosya okunurken hata oluştu: ${error.message}`
      // Clear message after 5 seconds for errors
      setTimeout(() => importMessage.value = '', 5000)
      // Reset file input
      event.target.value = ''
    }
  }
  reader.readAsArrayBuffer(file)
}

function validateExcelData(data) {
  const errors = []

  if (!data || data.length === 0) {
    errors.push('Excel dosyası boş veya veri bulunamadı.')
    return errors
  }

  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel'de satırlar 1'den başlar, başlık satırı 1, veri satırları 2'den başlar

    // Gerekli kolonları kontrol et
    const firstName = row.firstName || row.ad || row.FirstName || row.Ad
    const lastName = row.lastName || row.soyad || row.LastName || row.Soyad
    const branch = row.branch || row.branş || row.Branch || row.Branş
    const shortName = row.shortName || row.kısaltma || row.ShortName || row.Kısaltma

    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      errors.push(`Satır ${rowNumber}: Ad alanı eksik veya boş (firstName/ad)`)
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      errors.push(`Satır ${rowNumber}: Soyad alanı eksik veya boş (lastName/soyad)`)
    }

    if (!branch || typeof branch !== 'string' || branch.trim() === '') {
      errors.push(`Satır ${rowNumber}: Branş alanı eksik veya boş (branch/branş)`)
    }

    if (!shortName || typeof shortName !== 'string' || shortName.trim() === '') {
      errors.push(`Satır ${rowNumber}: Kısaltma alanı eksik veya boş (shortName/kısaltma)`)
    }

    // Kısaltma uzunluğu kontrolü
    if (shortName && typeof shortName === 'string' && shortName.length > 5) {
      errors.push(`Satır ${rowNumber}: Kısaltma en fazla 5 karakter olabilir`)
    }
  })

  return errors
}

function viewTeacherDetails(teacher) {
  // Navigate to teacher details or show modal
  console.log('View teacher details:', teacher)
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

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-input.error:focus {
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

.teachers-page {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.branch-section {
  margin-bottom: 32px;
}

.branch-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.teacher-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.teacher-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.teacher-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.teacher-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.teacher-short {
  font-size: 12px;
  color: var(--text-secondary);
}

.teacher-body {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.info-icon {
  width: 14px;
  height: 14px;
}

.teacher-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
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

/* Modal styles */
.teacher-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.availability-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.day-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.slot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.slot-item:hover {
  background: var(--bg-secondary);
}

.slot-label {
  color: var(--text-secondary);
}

.daily-constraints {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.constraint-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.constraint-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.constraint-inputs .form-input.small {
  width: 60px;
  text-align: center;
  padding: 6px;
}

.duties-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.duty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.duty-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.duty-name {
  font-weight: 500;
  font-size: 14px;
}

.duty-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-duties {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
  font-style: italic;
}

.add-duty-section {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.add-duty-section h4 {
  font-size: 14px;
  margin-bottom: 12px;
}

.import-section {
  padding: 16px 0;
}

.import-info {
  margin-bottom: 12px;
}

.import-columns {
  margin-bottom: 20px;
  padding-left: 20px;
}

.import-columns li {
  margin-bottom: 4px;
  font-size: 14px;
}

.file-input {
  display: none;
}

.warning-text {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .availability-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .teachers-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .availability-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.import-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  max-width: 400px;
  white-space: pre-line;
}

.import-message.success {
  background: #d1fae5;
  color: #065f46;
}

.import-message.error {
  background: #fee2e2;
  color: #dc2626;
}
</style>
