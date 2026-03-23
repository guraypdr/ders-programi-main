<template>
  <div class="constraints-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Kısıtlamalar</h1>
          <p class="page-subtitle">Ders programı kısıtlamalarını yönetin</p>
        </div>
      </div>
    </header>

    <!-- Constraint Type 1: Same Time -->
    <div class="constraint-section">
      <div class="section-header">
        <div class="section-title">
          <Clock class="section-icon" />
          <div>
            <h3>Aynı Saate Gelecek Dersler</h3>
            <p class="section-desc">Aynı anda başlaması gereken dersleri belirleyin</p>
          </div>
        </div>
        <button @click="openSameTimeModal" class="btn btn-primary">
          <Plus class="icon" />
          Ekle
        </button>
      </div>

      <div class="constraints-list">
        <div v-for="constraint in constraintsStore.sameTimeConstraints" :key="constraint.id" class="constraint-card">
          <div class="constraint-info">
            <span class="constraint-class">{{ getClassName(constraint.classId) }}</span>
            <div class="constraint-lessons">
              <span v-for="lessonId in constraint.lessons" :key="lessonId" class="lesson-tag">
                {{ getLessonName(lessonId) }}
              </span>
            </div>
          </div>
          <button @click="removeSameTimeConstraint(constraint.id)" class="btn-icon danger">
            <Trash2 class="icon" />
          </button>
        </div>
        <div v-if="constraintsStore.sameTimeConstraints.length === 0" class="empty-constraint">
          Henüz kısıtlama eklenmemiş
        </div>
      </div>
    </div>

    <!-- Constraint Type 2: Different Day -->
    <div class="constraint-section">
      <div class="section-header">
        <div class="section-title">
          <CalendarX class="section-icon" />
          <div>
            <h3>Aynı Güne Gelmeyecek Dersler</h3>
            <p class="section-desc">Aynı güne denk gelmemesi gereken ders çiftlerini belirleyin</p>
          </div>
        </div>
        <button @click="openDifferentDayModal" class="btn btn-primary">
          <Plus class="icon" />
          Ekle
        </button>
      </div>

      <div class="constraints-list">
        <div v-for="constraint in constraintsStore.differentDayConstraints" :key="constraint.id" class="constraint-card">
          <div class="constraint-info">
            <span class="constraint-class">{{ getClassName(constraint.classId) }}</span>
            <div class="constraint-lessons">
              <span class="lesson-tag">{{ getLessonName(constraint.lesson1) }}</span>
              <span class="separator">≠</span>
              <span class="lesson-tag">{{ getLessonName(constraint.lesson2) }}</span>
            </div>
          </div>
          <button @click="removeDifferentDayConstraint(constraint.id)" class="btn-icon danger">
            <Trash2 class="icon" />
          </button>
        </div>
        <div v-if="constraintsStore.differentDayConstraints.length === 0" class="empty-constraint">
          Henüz kısıtlama eklenmemiş
        </div>
      </div>
    </div>

    <!-- Constraint Type 3: Specific Days -->
    <div class="constraint-section">
      <div class="section-header">
        <div class="section-title">
          <CalendarCheck class="section-icon" />
          <div>
            <h3>Sadece Belirli Günlere Gelecek Dersler</h3>
            <p class="section-desc">Hangi dersin hangi günlere yerleşebileceğini belirleyin</p>
          </div>
        </div>
        <button @click="openSpecificDayModal" class="btn btn-primary">
          <Plus class="icon" />
          Ekle
        </button>
      </div>

      <div class="constraints-list">
        <div v-for="constraint in constraintsStore.specificDayConstraints" :key="constraint.id" class="constraint-card">
          <div class="constraint-info">
            <span class="constraint-class">{{ getClassName(constraint.classId) }}</span>
            <span class="lesson-tag">{{ getLessonName(constraint.lessonId) }}</span>
            <div class="allowed-days">
              <span v-for="day in constraint.allowedDays" :key="day" class="day-badge">
                {{ day.substring(0, 3) }}
              </span>
            </div>
          </div>
          <div class="constraint-actions">
            <button @click="editSpecificDays(constraint)" class="btn-icon">
              <Edit2 class="icon" />
            </button>
            <button @click="removeSpecificDayConstraint(constraint.id)" class="btn-icon danger">
              <Trash2 class="icon" />
            </button>
          </div>
        </div>
        <div v-if="constraintsStore.specificDayConstraints.length === 0" class="empty-constraint">
          Henüz kısıtlama eklenmemiş
        </div>
      </div>
    </div>

    <!-- Same Time Modal -->
    <Modal v-if="showSameTimeModal" @close="closeSameTimeModal">
      <template #header>
        <h3>Aynı Saate Gelecek Dersler Ekle</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveSameTimeConstraint" class="constraint-form">
          <div class="form-group">
            <label class="form-label">Sınıf</label>
            <select v-model="sameTimeForm.classId" class="form-select" required>
              <option value="">Seçiniz</option>
              <option v-for="cls in classesStore.classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="sameTimeForm.classId">
            <label class="form-label">Dersler (En az 2 ders seçin)</label>
            <div class="lessons-checkbox-list">
              <label v-for="lesson in availableLessons(sameTimeForm.classId)" :key="lesson.id" class="lesson-checkbox">
                <input 
                  type="checkbox" 
                  :value="lesson.id" 
                  v-model="sameTimeForm.lessons"
                  class="checkbox-input"
                >
                <span>{{ lesson.name }} ({{ lesson.code }})</span>
              </label>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="closeSameTimeModal" class="btn btn-secondary">İptal</button>
        <button 
          @click="saveSameTimeConstraint" 
          class="btn btn-primary"
          :disabled="sameTimeForm.lessons.length < 2"
        >
          Kaydet
        </button>
      </template>
    </Modal>

    <!-- Different Day Modal -->
    <Modal v-if="showDifferentDayModal" @close="closeDifferentDayModal">
      <template #header>
        <h3>Aynı Güne Gelmeyecek Dersler Ekle</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveDifferentDayConstraint" class="constraint-form">
          <div class="form-group">
            <label class="form-label">Sınıf</label>
            <select v-model="differentDayForm.classId" class="form-select" required>
              <option value="">Seçiniz</option>
              <option v-for="cls in classesStore.classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="form-row" v-if="differentDayForm.classId">
            <div class="form-group">
              <label class="form-label">1. Ders</label>
              <select v-model="differentDayForm.lesson1" class="form-select" required>
                <option value="">Seçiniz</option>
                <option v-for="lesson in availableLessons(differentDayForm.classId)" :key="lesson.id" :value="lesson.id">
                  {{ lesson.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">2. Ders</label>
              <select v-model="differentDayForm.lesson2" class="form-select" required>
                <option value="">Seçiniz</option>
                <option v-for="lesson in availableLessons(differentDayForm.classId)" :key="lesson.id" :value="lesson.id">
                  {{ lesson.name }}
                </option>
              </select>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="closeDifferentDayModal" class="btn btn-secondary">İptal</button>
        <button 
          @click="saveDifferentDayConstraint" 
          class="btn btn-primary"
          :disabled="!differentDayForm.lesson1 || !differentDayForm.lesson2 || differentDayForm.lesson1 === differentDayForm.lesson2"
        >
          Kaydet
        </button>
      </template>
    </Modal>

    <!-- Specific Day Modal -->
    <Modal v-if="showSpecificDayModal" @close="closeSpecificDayModal">
      <template #header>
        <h3>Belirli Günlere Gelecek Ders Ekle</h3>
      </template>
      <template #body>
        <form @submit.prevent="saveSpecificDayConstraint" class="constraint-form">
          <div class="form-group">
            <label class="form-label">Sınıf</label>
            <select v-model="specificDayForm.classId" class="form-select" required>
              <option value="">Seçiniz</option>
              <option v-for="cls in classesStore.classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="specificDayForm.classId">
            <label class="form-label">Ders</label>
            <select v-model="specificDayForm.lessonId" class="form-select" required>
              <option value="">Seçiniz</option>
              <option v-for="lesson in availableLessons(specificDayForm.classId)" :key="lesson.id" :value="lesson.id">
                {{ lesson.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="specificDayForm.lessonId">
            <label class="form-label">İzin Verilen Günler</label>
            <div class="days-checkbox-list">
              <label v-for="day in settingsStore.days" :key="day" class="day-checkbox">
                <input 
                  type="checkbox" 
                  :value="day" 
                  v-model="specificDayForm.allowedDays"
                  class="checkbox-input"
                >
                <span>{{ day }}</span>
              </label>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="closeSpecificDayModal" class="btn btn-secondary">İptal</button>
        <button 
          @click="saveSpecificDayConstraint" 
          class="btn btn-primary"
          :disabled="specificDayForm.allowedDays.length === 0"
        >
          Kaydet
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConstraintsStore } from '../stores/constraints'
import { useClassesStore } from '../stores/classes'
import { useLessonsStore } from '../stores/lessons'
import { useSettingsStore } from '../stores/settings'
import Modal from '../components/common/Modal.vue'
import {
  Plus,
  Trash2,
  Edit2,
  Clock,
  CalendarX,
  CalendarCheck
} from 'lucide-vue-next'

const constraintsStore = useConstraintsStore()
const classesStore = useClassesStore()
const lessonsStore = useLessonsStore()
const settingsStore = useSettingsStore()

const showSameTimeModal = ref(false)
const showDifferentDayModal = ref(false)
const showSpecificDayModal = ref(false)
const editingSpecificConstraint = ref(null)

const sameTimeForm = ref({
  classId: '',
  lessons: []
})

const differentDayForm = ref({
  classId: '',
  lesson1: '',
  lesson2: ''
})

const specificDayForm = ref({
  classId: '',
  lessonId: '',
  allowedDays: []
})

const availableLessons = computed(() => (classId) => {
  const cls = classesStore.getClassById(classId)
  if (!cls) return []
  return lessonsStore.lessonsByLevel(cls.level)
    .filter(l => l.field === 'default' || l.field === cls.field)
})

function getClassName(classId) {
  const cls = classesStore.getClassById(classId)
  return cls?.name || 'Bilinmiyor'
}

function getLessonName(lessonId) {
  const lesson = lessonsStore.getLessonById(lessonId)
  return lesson?.name || 'Bilinmiyor'
}

// Same Time Constraint
function openSameTimeModal() {
  sameTimeForm.value = { classId: '', lessons: [] }
  showSameTimeModal.value = true
}

function closeSameTimeModal() {
  showSameTimeModal.value = false
}

function saveSameTimeConstraint() {
  if (sameTimeForm.value.lessons.length >= 2) {
    constraintsStore.addSameTimeConstraint(
      sameTimeForm.value.classId,
      sameTimeForm.value.lessons
    )
    closeSameTimeModal()
  }
}

function removeSameTimeConstraint(constraintId) {
  constraintsStore.removeSameTimeConstraint(constraintId)
}

// Different Day Constraint
function openDifferentDayModal() {
  differentDayForm.value = { classId: '', lesson1: '', lesson2: '' }
  showDifferentDayModal.value = true
}

function closeDifferentDayModal() {
  showDifferentDayModal.value = false
}

function saveDifferentDayConstraint() {
  if (differentDayForm.value.lesson1 && differentDayForm.value.lesson2 && 
      differentDayForm.value.lesson1 !== differentDayForm.value.lesson2) {
    constraintsStore.addDifferentDayConstraint(
      differentDayForm.value.classId,
      differentDayForm.value.lesson1,
      differentDayForm.value.lesson2
    )
    closeDifferentDayModal()
  }
}

function removeDifferentDayConstraint(constraintId) {
  constraintsStore.removeDifferentDayConstraint(constraintId)
}

// Specific Day Constraint
function openSpecificDayModal() {
  editingSpecificConstraint.value = null
  specificDayForm.value = { classId: '', lessonId: '', allowedDays: [] }
  showSpecificDayModal.value = true
}

function closeSpecificDayModal() {
  showSpecificDayModal.value = false
  editingSpecificConstraint.value = null
}

function editSpecificDays(constraint) {
  editingSpecificConstraint.value = constraint
  specificDayForm.value = {
    classId: constraint.classId,
    lessonId: constraint.lessonId,
    allowedDays: [...constraint.allowedDays]
  }
  showSpecificDayModal.value = true
}

function saveSpecificDayConstraint() {
  if (editingSpecificConstraint.value) {
    constraintsStore.updateSpecificDays(
      editingSpecificConstraint.value.id,
      specificDayForm.value.allowedDays
    )
  } else {
    constraintsStore.addSpecificDayConstraint(
      specificDayForm.value.classId,
      specificDayForm.value.lessonId,
      specificDayForm.value.allowedDays
    )
  }
  closeSpecificDayModal()
}

function removeSpecificDayConstraint(constraintId) {
  constraintsStore.removeSpecificDayConstraint(constraintId)
}
</script>

<style scoped>
.constraints-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
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

.constraint-section {
  background: white;
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.section-icon {
  width: 40px;
  height: 40px;
  padding: 8px;
  background: white;
  border-radius: var(--radius-md);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.constraints-list {
  padding: 16px;
}

.constraint-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
}

.constraint-card:last-child {
  margin-bottom: 0;
}

.constraint-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.constraint-class {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.constraint-lessons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lesson-tag {
  padding: 4px 12px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.separator {
  color: var(--text-secondary);
  font-weight: 600;
}

.allowed-days {
  display: flex;
  gap: 6px;
}

.day-badge {
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.constraint-actions {
  display: flex;
  gap: 8px;
}

.empty-constraint {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Form styles */
.constraint-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.lessons-checkbox-list,
.days-checkbox-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.lesson-checkbox,
.day-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
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

.icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .constraint-card {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
