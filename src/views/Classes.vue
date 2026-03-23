<template>
  <div class="classes-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Sınıflar</h1>
          <p class="page-subtitle">Sınıfları yönetin, ders atamaları yapın</p>
        </div>
        <button @click="openAddModal" class="btn btn-primary">
          <Plus class="icon" />
          Sınıf Ekle
        </button>
      </div>
    </header>

    <!-- Classes by Level -->
    <div class="classes-content">
      <div v-for="level in settingsStore.classLevels" :key="level" class="level-section">
        <h3 class="level-title">{{ level === 'Hazırlık' ? 'Hazırlık Sınıfı' : level + '. Sınıf' }}</h3>
        <div class="classes-grid">
          <div
            v-for="cls in classesByLevel[level]"
            :key="cls.id"
            class="class-card"
            @click="viewClassDetails(cls)"
          >
            <div class="class-header">
              <div class="class-icon">
                <School />
              </div>
              <div class="class-info">
                <h4 class="class-name">{{ cls.name }}</h4>
                <span v-if="cls.field && cls.field !== 'default'" class="class-field">{{ cls.field }}</span>
              </div>
            </div>
            <div class="class-body">
              <div class="hours-info">
                <div class="hours-row">
                  <span class="hours-label">Zorunlu:</span>
                  <span class="hours-value">{{ cls.mandatoryHours || 0 }} saat</span>
                </div>
                <div class="hours-row">
                  <span class="hours-label">Seçmeli:</span>
                  <span class="hours-value">{{ cls.electiveHours || 0 }} saat</span>
                </div>
                <div class="hours-row">
                  <span class="hours-label">Rehberlik:</span>
                  <span class="hours-value">{{ cls.guidanceHours || 0 }} saat</span>
                </div>
                <div class="hours-row total">
                  <span class="hours-label">Toplam:</span>
                  <span class="hours-value">{{ totalHours(cls) }} saat</span>
                </div>
              </div>
              <div v-if="cls.advisorTeacherId" class="advisor-info">
                <User class="advisor-icon" />
                <span>{{ getTeacherName(cls.advisorTeacherId) }}</span>
              </div>
            </div>
            <div class="class-actions">
              <button @click.stop="editClass(cls)" class="btn-icon" title="Düzenle">
                <Edit2 class="icon" />
              </button>
              <button @click.stop="manageLessons(cls)" class="btn-icon" title="Dersler">
                <BookOpen class="icon" />
              </button>
              <button @click.stop="confirmDelete(cls)" class="btn-icon danger" title="Sil">
                <Trash2 class="icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="classesStore.classes.length === 0" class="empty-state">
        <School class="empty-icon" />
        <p>Henüz sınıf eklenmemiş</p>
      </div>
    </div>

    <!-- Add/Edit Class Modal -->
    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <h3>{{ editingClass ? 'Sınıf Düzenle' : 'Yeni Sınıf' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveClass" class="class-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sınıf Adı *</label>
              <input 
                v-model="form.name" 
                @blur="capitalizeOnBlur('name')" 
                @click.stop 
                type="text" 
                class="form-input" 
                :class="{ error: validationErrors.name }" 
                required 
                placeholder="örn: 9-A, 10-B"
              >
              <span v-if="validationErrors.name" class="error-message">{{ validationErrors.name }}</span>
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

          <div class="form-group" v-if="settingsStore.schoolType === 'lise'">
            <label class="form-label">Alan</label>
            <select v-model="form.field" class="form-select" @click.stop>
              <option v-for="field in settingsStore.fields" :key="field.id" :value="field.id">
                {{ field.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Zorunlu Ders Saati</label>
              <input v-model.number="form.mandatoryHours" @click.stop type="number" min="0" max="40" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Seçmeli Ders Saati</label>
              <input v-model.number="form.electiveHours" @click.stop type="number" min="0" max="20" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Rehberlik Saati</label>
              <input v-model.number="form.guidanceHours" @click.stop type="number" min="0" max="10" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Günlük Maksimum Ders Saati</label>
              <input v-model.number="form.maxDailyHours" @click.stop type="number" min="1" :max="settingsStore.dailyLessonHours" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Rehber Öğretmen</label>
              <select v-model="form.advisorTeacherId" class="form-select" @click.stop>
                <option value="">Seçiniz</option>
                <option v-for="teacher in teachersStore.teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.firstName }} {{ teacher.lastName }}
                </option>
              </select>
            </div>
          </div>

          <div class="preview-section">
            <label class="form-label">Toplam Ders Saati</label>
            <span class="preview-value">{{ totalFormHours }} saat</span>
          </div>
        </form>
      </template>
      <template #footer>
        <button type="button" @click="closeModal" class="btn btn-secondary">İptal</button>
        <button type="button" @click="saveClass" class="btn btn-primary">Kaydet</button>
      </template>
    </Modal>

    <!-- Class Lessons Modal -->
    <Modal v-if="showLessonsModal" @close="closeLessonsModal" class="large-modal">
      <template #header>
        <h3>{{ selectedClass?.name }} - Ders Atamaları</h3>
      </template>
      <template #body>
        <div class="lessons-assignment">
          <div class="available-lessons">
            <h4>Atanabilir Dersler</h4>
            <div class="lessons-list">
              <div
                v-for="lesson in availableLessons"
                :key="lesson.id"
                class="lesson-item"
                :class="{ assigned: isLessonAssigned(lesson.id) }"
                @click="toggleLesson(lesson.id)"
              >
                <div class="lesson-info">
                  <span class="lesson-name">{{ lesson.name }}</span>
                  <span class="lesson-code">{{ lesson.code }}</span>
                </div>
                <div class="lesson-type-badge" :class="lesson.type">
                  {{ getTypeLabel(lesson.type) }}
                </div>
              </div>
            </div>
          </div>

          <div class="assigned-lessons">
            <h4>Atanmış Dersler</h4>
            <div class="assigned-list">
              <div
                v-for="assignment in classLessons"
                :key="assignment.lessonId"
                class="assigned-item"
              >
                <div class="assigned-info">
                  <span class="assigned-name">{{ getLessonName(assignment.lessonId) }}</span>
                  <span v-if="lessonsStore.isStajLesson(assignment.lessonId)" class="staj-badge">Staj</span>
                </div>
                <div v-if="!lessonsStore.isStajLesson(assignment.lessonId)" class="teacher-select">
                  <select v-model="assignment.teacherId" @change="updateTeacher(assignment.lessonId, $event.target.value)" @click.stop class="form-select">
                    <option value="">Öğretmen Seçin</option>
                    <option v-for="teacher in compatibleTeachers(assignment.lessonId)" :key="teacher.id" :value="teacher.id">
                      {{ teacher.firstName }} {{ teacher.lastName }} ({{ teacher.branch }})
                    </option>
                  </select>
                </div>
                <button @click="removeLesson(assignment.lessonId)" class="btn-icon danger">
                  <Trash2 class="icon" />
                </button>
              </div>
              <div v-if="classLessons.length === 0" class="empty-assigned">
                Henüz ders atanmamış
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="closeLessonsModal" class="btn btn-primary">Tamam</button>
      </template>
    </Modal>

    <!-- Delete Confirmation -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3>Sınıf Sil</h3>
      </template>
      <template #body>
        <p><strong>{{ classToDelete?.name }}</strong> sınıfını silmek istediğinize emin misiniz?</p>
        <p class="warning-text">Bu işlem geri alınamaz.</p>
      </template>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn btn-secondary">İptal</button>
        <button @click="deleteClass" class="btn btn-danger">Sil</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useClassesStore } from '../stores/classes'
import { useTeachersStore } from '../stores/teachers'
import { useLessonsStore } from '../stores/lessons'
import { useSettingsStore } from '../stores/settings'
import Modal from '../components/common/Modal.vue'
import {
  Plus,
  Edit2,
  Trash2,
  School,
  User,
  BookOpen
} from 'lucide-vue-next'

const classesStore = useClassesStore()
const teachersStore = useTeachersStore()
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
const showLessonsModal = ref(false)
const showDeleteModal = ref(false)
const editingClass = ref(null)
const selectedClass = ref(null)
const classToDelete = ref(null)

const form = ref({
  name: '',
  level: '',
  field: 'default',
  mandatoryHours: 0,
  electiveHours: 0,
  guidanceHours: 0,
  maxDailyHours: settingsStore.dailyLessonHours,
  advisorTeacherId: ''
})

const validationError = ref('')

const validationErrors = ref({
  name: '',
  level: ''
})

// Capitalize on blur instead of watch to avoid focus issues
async function capitalizeOnBlur(field) {
  if (form.value[field]) {
    form.value[field] = capitalizeWords(form.value[field])
    await nextTick()
  }
}

const classesByLevel = computed(() => classesStore.classesByLevel)

const availableLessons = computed(() => {
  if (!selectedClass.value) return []
  return lessonsStore.lessonsByLevel(selectedClass.value.level)
    .filter(l => (l.field === 'default' || l.field === selectedClass.value.field))
})

const classLessons = computed(() => {
  if (!selectedClass.value) return []
  return classesStore.getClassLessons(selectedClass.value.id)
})

const totalFormHours = computed(() => {
  return (form.value.mandatoryHours || 0) + 
         (form.value.electiveHours || 0) + 
         (form.value.guidanceHours || 0)
})

function totalHours(cls) {
  return (cls.mandatoryHours || 0) + (cls.electiveHours || 0) + (cls.guidanceHours || 0)
}

function getTeacherName(teacherId) {
  const teacher = teachersStore.getTeacherById(teacherId)
  return teacher ? `${teacher.firstName} ${teacher.lastName}` : '-'
}

function getLessonName(lessonId) {
  const lesson = lessonsStore.getLessonById(lessonId)
  return lesson?.name || 'Bilinmiyor'
}

function getTypeLabel(type) {
  const labels = { zorunlu: 'Zorunlu', secmeli: 'Seçmeli', rehberlik: 'Rehberlik' }
  return labels[type] || type
}

function compatibleTeachers(lessonId) {
  const lesson = lessonsStore.getLessonById(lessonId)
  if (!lesson) return []
  return teachersStore.teachers.filter(t => t.branch === lesson.branch)
}

function openAddModal() {
  editingClass.value = null
  form.value = {
    name: '',
    level: settingsStore.classLevels[0] || '',
    field: 'default',
    mandatoryHours: 0,
    electiveHours: 0,
    guidanceHours: 0,
    maxDailyHours: settingsStore.dailyLessonHours,
    advisorTeacherId: ''
  }
  showModal.value = true
}

function editClass(cls) {
  editingClass.value = cls
  form.value = { ...cls }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingClass.value = null
}

function saveClass() {
  // Clear previous errors
  validationErrors.value = {
    name: '',
    level: ''
  }
  
  // Capitalize fields before validation
  form.value.name = capitalizeWords(form.value.name || '')
  
  // Validate all required fields
  let hasErrors = false
  
  if (!form.value.name.trim()) {
    validationErrors.value.name = 'Lütfen sınıf adı girin.'
    hasErrors = true
  }
  if (!form.value.level) {
    validationErrors.value.level = 'Lütfen sınıf düzeyi seçin. Ayarlardan okul tipi ayarlanmamış olabilir.'
    hasErrors = true
  }
  
  if (hasErrors) return
  
  if (editingClass.value) {
    classesStore.updateClass(editingClass.value.id, form.value)
  } else {
    classesStore.addClass(form.value)
  }
  closeModal()
}

function viewClassDetails(cls) {
  manageLessons(cls)
}

function manageLessons(cls) {
  selectedClass.value = cls
  showLessonsModal.value = true
}

function closeLessonsModal() {
  showLessonsModal.value = false
  selectedClass.value = null
}

function isLessonAssigned(lessonId) {
  return classLessons.value.some(a => a.lessonId === lessonId)
}

function toggleLesson(lessonId) {
  if (!selectedClass.value) return
  
  if (isLessonAssigned(lessonId)) {
    classesStore.removeLesson(selectedClass.value.id, lessonId)
  } else {
    classesStore.assignLesson(selectedClass.value.id, lessonId)
  }
}

function updateTeacher(lessonId, teacherId) {
  if (selectedClass.value) {
    classesStore.updateTeacherAssignment(selectedClass.value.id, lessonId, teacherId)
  }
}

function removeLesson(lessonId) {
  if (selectedClass.value) {
    classesStore.removeLesson(selectedClass.value.id, lessonId)
  }
}

function confirmDelete(cls) {
  classToDelete.value = cls
  showDeleteModal.value = true
}

function deleteClass() {
  if (classToDelete.value) {
    classesStore.deleteClass(classToDelete.value.id)
  }
  showDeleteModal.value = false
  classToDelete.value = null
}
</script>

<style scoped>
.classes-page {
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

.level-section {
  margin-bottom: 32px;
}

.level-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.class-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.class-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.class-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.class-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-info {
  flex: 1;
}

.class-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.class-field {
  font-size: 12px;
  color: var(--text-secondary);
}

.class-body {
  margin-bottom: 16px;
}

.hours-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.hours-row.total {
  padding-top: 6px;
  border-top: 1px solid var(--border-color);
  font-weight: 600;
}

.hours-label {
  color: var(--text-secondary);
}

.hours-value {
  color: var(--text-primary);
  font-weight: 500;
}

.advisor-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.advisor-icon {
  width: 14px;
  height: 14px;
}

.class-actions {
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

/* Form styles */
.class-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preview-section {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.preview-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
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

/* Lessons assignment */
.lessons-assignment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.available-lessons,
.assigned-lessons {
  display: flex;
  flex-direction: column;
}

.available-lessons h4,
.assigned-lessons h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.lessons-list,
.assigned-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.lesson-item:hover {
  border-color: var(--primary-color);
}

.lesson-item.assigned {
  background: #d1fae5;
  border-color: #10b981;
}

.lesson-info {
  display: flex;
  flex-direction: column;
}

.lesson-name {
  font-weight: 500;
  font-size: 14px;
}

.lesson-code {
  font-size: 12px;
  color: var(--text-secondary);
}

.lesson-type-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.lesson-type-badge.zorunlu {
  background: #dbeafe;
  color: #1d4ed8;
}

.lesson-type-badge.secmeli {
  background: #fef3c7;
  color: #b45309;
}

.lesson-type-badge.rehberlik {
  background: #d1fae5;
  color: #059669;
}

.assigned-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.assigned-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.assigned-name {
  font-weight: 500;
  font-size: 14px;
}

.staj-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 4px;
}

.teacher-select {
  flex: 1;
}

.empty-assigned {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
  font-style: italic;
}

.warning-text {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .classes-grid {
    grid-template-columns: 1fr;
  }
  
  .lessons-assignment {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
