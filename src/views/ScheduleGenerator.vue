<template>
  <div class="schedule-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Program Oluştur</h1>
          <p class="page-subtitle">Otomatik ders programı oluşturma ve validasyon</p>
        </div>
        <div class="header-actions">
          <button 
            @click="validateAndGenerate" 
            class="btn btn-primary btn-lg"
            :disabled="scheduleStore.isGenerating"
          >
            <Play v-if="!scheduleStore.isGenerating" class="icon" />
            <Loader2 v-else class="icon spinning" />
            {{ scheduleStore.isGenerating ? 'Oluşturuluyor...' : 'Program Oluştur' }}
          </button>
          <button 
            v-if="scheduleStore.isGenerating"
            @click="scheduleStore.pauseGeneration" 
            class="btn btn-secondary"
          >
            <Pause class="icon" />
            Durdur
          </button>
          <button 
            v-if="scheduleStore.isPaused"
            @click="scheduleStore.resumeGeneration" 
            class="btn btn-secondary"
          >
            <Play class="icon" />
            Devam Et
          </button>
          <button 
            v-if="scheduleStore.hasErrors"
            @click="showValidationErrors" 
            class="btn btn-warning"
          >
            <AlertTriangle class="icon" />
            Hataları Gör
          </button>
          <button @click="exportSchedule" class="btn btn-secondary">
            <Download class="icon" />
            Dışa Aktar
          </button>
          <button @click="importSchedule" class="btn btn-secondary">
            <Upload class="icon" />
            İçe Aktar
          </button>
        </div>
      </div>
      <div v-if="saveMessage" class="save-message">
        {{ saveMessage }}
      </div>
      <div v-if="importMessage" class="import-message">
        {{ importMessage }}
      </div>
      <div v-if="importError" class="import-error">
        {{ importError }}
      </div>
    </header>

    <!-- Progress Bar -->
    <div v-if="scheduleStore.generationStatus !== 'idle'" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">İlerleme</span>
        <span class="progress-value">%{{ scheduleStore.generationProgress }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: scheduleStore.generationProgress + '%' }"></div>
      </div>
      <span class="progress-status">{{ generationStatusText }}</span>
    </div>

    <!-- Validation Errors -->
    <div v-if="showErrors && scheduleStore.validationErrors.length > 0" class="errors-section">
      <div class="errors-header">
        <h3>Validasyon Hataları</h3>
        <button @click="showErrors = false" class="btn-icon">
          <X class="icon" />
        </button>
      </div>
      <div class="errors-list">
        <div v-for="error in scheduleStore.validationErrors" :key="error.id" class="error-item" :class="error.severity">
          <AlertTriangle v-if="error.severity === 'error'" class="error-icon" />
          <AlertCircle v-else class="error-icon" />
          <div class="error-content">
            <span class="error-title">{{ error.title }}</span>
            <p class="error-message">{{ error.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule View -->
    <div v-if="hasSchedule" class="schedule-view">
      <!-- Class Schedules -->
      <div class="schedule-section">
        <h3 class="section-title">
          <School class="section-icon" />
          Sınıf Programları
        </h3>
        <div class="schedules-tabs">
          <button 
            v-for="cls in classesStore.classes" 
            :key="cls.id"
            @click="activeClass = cls.id"
            :class="['tab-btn', { active: activeClass === cls.id }]"
          >
            {{ cls.name }}
          </button>
        </div>
        <div v-if="activeClass" class="schedule-table-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Saat</th>
                <th v-for="day in settingsStore.days" :key="day">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in settingsStore.lessonSlots" :key="slot.index">
                <td class="time-cell">
                  <span class="slot-number">{{ slot.index + 1 }}</span>
                  <span class="slot-time">{{ slot.start }} - {{ slot.end }}</span>
                </td>
                <td v-for="day in settingsStore.days" :key="day" class="schedule-cell">
                  <div v-if="getScheduleItem(activeClass, day, slot.index)" class="lesson-block">
                    <span class="lesson-code">{{ getLessonCode(getScheduleItem(activeClass, day, slot.index).lessonId) }}</span>
                    <span class="teacher-short">{{ getTeacherShort(getScheduleItem(activeClass, day, slot.index).teacherId) }}</span>
                  </div>
                  <div v-else-if="isDutySlot(activeClass, day, slot.index)" class="duty-block">
                    <span class="duty-name">{{ getDutyName(activeClass, day, slot.index) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Teacher Schedules -->
      <div class="schedule-section">
        <h3 class="section-title">
          <Users class="section-icon" />
          Öğretmen Programları
        </h3>
        <div class="schedules-tabs">
          <button 
            v-for="teacher in teachersStore.teachers" 
            :key="teacher.id"
            @click="activeTeacher = teacher.id"
            :class="['tab-btn', { active: activeTeacher === teacher.id }]"
          >
            {{ teacher.shortName }}
          </button>
        </div>
        <div v-if="activeTeacher" class="schedule-table-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Saat</th>
                <th v-for="day in settingsStore.days" :key="day">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in settingsStore.lessonSlots" :key="slot.index">
                <td class="time-cell">
                  <span class="slot-number">{{ slot.index + 1 }}</span>
                  <span class="slot-time">{{ slot.start }} - {{ slot.end }}</span>
                </td>
                <td v-for="day in settingsStore.days" :key="day" class="schedule-cell">
                  <div v-if="getTeacherScheduleItem(activeTeacher, day, slot.index)" class="lesson-block teacher-view">
                    <span class="lesson-code">{{ getLessonCode(getTeacherScheduleItem(activeTeacher, day, slot.index).lessonId) }}</span>
                    <span class="class-name">{{ getClassName(getTeacherScheduleItem(activeTeacher, day, slot.index).classId) }}</span>
                  </div>
                  <div v-else-if="isTeacherDutySlot(activeTeacher, day, slot.index)" class="duty-block">
                    <span class="duty-name">{{ getTeacherDutyName(activeTeacher, day, slot.index) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Calendar class="empty-icon" />
      <h3>Program Henüz Oluşturulmadı</h3>
      <p>Ders programı oluşturmak için yukarıdaki butona tıklayın.</p>
      
      <div class="prerequisites">
        <h4>Ön Koşullar:</h4>
        <ul>
          <li :class="{ met: settingsStore.schoolType }">Okul türü ve ayarlar tanımlanmış</li>
          <li :class="{ met: teachersStore.teachers.length > 0 }">En az bir öğretmen eklenmiş</li>
          <li :class="{ met: classesStore.classes.length > 0 }">En az bir sınıf eklenmiş</li>
          <li :class="{ met: lessonsStore.lessons.length > 0 }">En az bir ders eklenmiş</li>
          <li :class="{ met: hasAssignedTeachers }">Tüm derslere öğretmen atanmış</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import { useTeachersStore } from '../stores/teachers'
import { useClassesStore } from '../stores/classes'
import { useLessonsStore } from '../stores/lessons'
import { useSettingsStore } from '../stores/settings'
import { useConstraintsStore } from '../stores/constraints'
import * as XLSX from 'xlsx'
import {
  Play,
  Pause,
  Loader2,
  AlertTriangle,
  AlertCircle,
  X,
  School,
  Users,
  Calendar,
  Download,
  Upload
} from 'lucide-vue-next'

const scheduleStore = useScheduleStore()
const teachersStore = useTeachersStore()
const classesStore = useClassesStore()
const lessonsStore = useLessonsStore()
const settingsStore = useSettingsStore()
const constraintsStore = useConstraintsStore()

const showErrors = ref(false)
const activeClass = ref('')
const activeTeacher = ref('')
const saveMessage = ref('')
const importMessage = ref('')
const importError = ref('')

const hasSchedule = computed(() => 
  Object.keys(scheduleStore.schedule).length > 0
)

const hasAssignedTeachers = computed(() => {
  return classesStore.classLessons && 
    Object.values(classesStore.classLessons).every(lessons => 
      lessons.every(l => l.teacherId || lessonsStore.isStajLesson(l.lessonId))
    )
})

const generationStatusText = computed(() => {
  const statusMap = {
    idle: 'Başlamadı',
    running: 'Oluşturuluyor...',
    paused: 'Duraklatıldı',
    completed: 'Tamamlandı',
    error: 'Hata Oluştu'
  }
  return statusMap[scheduleStore.generationStatus] || 'Bilinmiyor'
})

function getScheduleItem(classId, day, slot) {
  return scheduleStore.getSlotInfo(classId, day, slot)
}

function getTeacherScheduleItem(teacherId, day, slot) {
  return scheduleStore.getTeacherSchedule(teacherId)?.[day]?.[slot]
}

function getLessonCode(lessonId) {
  const lesson = lessonsStore.getLessonById(lessonId)
  return lesson?.code || '?'
}

function getTeacherShort(teacherId) {
  if (!teacherId) return '-'
  const teacher = teachersStore.getTeacherById(teacherId)
  return teacher?.shortName || '?'
}

function getClassName(classId) {
  const cls = classesStore.getClassById(classId)
  return cls?.name || '?'
}

function isDutySlot(classId, day, slot) {
  const cls = classesStore.getClassById(classId)
  if (!cls?.advisorTeacherId) return false
  
  const teacher = teachersStore.getTeacherById(cls.advisorTeacherId)
  return teacher?.duties?.some(d => d.day === day && d.slot === slot)
}

function getDutyName(classId, day, slot) {
  const cls = classesStore.getClassById(classId)
  if (!cls?.advisorTeacherId) return ''
  
  const teacher = teachersStore.getTeacherById(cls.advisorTeacherId)
  const duty = teacher?.duties?.find(d => d.day === day && d.slot === slot)
  return duty?.name || ''
}

function isTeacherDutySlot(teacherId, day, slot) {
  const teacher = teachersStore.getTeacherById(teacherId)
  return teacher?.duties?.some(d => d.day === day && d.slot === slot)
}

function getTeacherDutyName(teacherId, day, slot) {
  const teacher = teachersStore.getTeacherById(teacherId)
  const duty = teacher?.duties?.find(d => d.day === day && d.slot === slot)
  return duty?.name || ''
}

function showValidationErrors() {
  showErrors.value = true
}

async function validateAndGenerate() {
  scheduleStore.clearValidationErrors()
  
  // 1. Check if all lessons have teachers assigned
  for (const [classId, lessons] of Object.entries(classesStore.classLessons)) {
    const cls = classesStore.getClassById(classId)
    const unassignedLessons = lessons.filter(l => 
      !l.teacherId && !lessonsStore.isStajLesson(l.lessonId)
    )
    
    if (unassignedLessons.length > 0) {
      const lessonNames = unassignedLessons.map(l => {
        const lesson = lessonsStore.getLessonById(l.lessonId)
        return lesson?.name || 'Bilinmiyor'
      }).join(', ')
      
      scheduleStore.addValidationError({
        severity: 'error',
        title: 'Öğretmensiz Dersler',
        message: `${cls?.name} sınıfının şu derslerine öğretmen atanmamış: ${lessonNames}`
      })
    }
  }
  
  // 2. Check total hours per class
  for (const cls of classesStore.classes) {
    const lessons = classesStore.getClassLessons(cls.id)
    const totalHours = lessons.reduce((sum, l) => {
      const lesson = lessonsStore.getLessonById(l.lessonId)
      if (!lesson?.distributionPlan) return sum
      const hours = lesson.distributionPlan.split('+').reduce((a, b) => a + parseInt(b), 0)
      return sum + hours
    }, 0)
    
    const requiredHours = (cls.mandatoryHours || 0) + (cls.electiveHours || 0) + (cls.guidanceHours || 0)
    
    if (totalHours > requiredHours) {
      scheduleStore.addValidationError({
        severity: 'error',
        title: 'Aşırı Ders Saati',
        message: `${cls.name} sınıfının haftalık ders saati ${requiredHours} olması gerekirken ${totalHours} saat ders tanımlanmış.`
      })
    }
  }
  
  // 3. Check teacher availability
  for (const teacher of teachersStore.teachers) {
    if (!teacher.availability) continue
    
    // Count assigned hours per day
    const dailyHours = {}
    for (const [classId, classSchedule] of Object.entries(scheduleStore.schedule)) {
      for (const [day, slots] of Object.entries(classSchedule)) {
        for (const [slot, info] of Object.entries(slots)) {
          if (info.teacherId === teacher.id) {
            dailyHours[day] = (dailyHours[day] || 0) + 1
          }
        }
      }
    }
    
    // Check against constraints
    for (const [day, hours] of Object.entries(dailyHours)) {
      const constraint = teacher.dailyConstraints?.[day]
      if (constraint?.max && hours > constraint.max) {
        scheduleStore.addValidationError({
          severity: 'error',
          title: 'Öğretmen Günlük Limit Aşımı',
          message: `${teacher.firstName} ${teacher.lastName} öğretmenin ${day} günü ${hours} saat dersi var, maksimum ${constraint.max} saat olmalı.`
        })
      }
    }
    
    // Check total available hours vs assigned lessons
    const availableHours = Object.values(teacher.availability).flat().filter(Boolean).length
    // This would need to be checked during actual assignment
  }
  
  // If no errors, start generation
  if (!scheduleStore.hasErrors) {
    startGeneration()
  } else {
    showErrors.value = true
  }
}

async function startGeneration() {
  scheduleStore.startGeneration()
  
  // Simulate generation progress
  const totalSteps = 100
  for (let i = 0; i <= totalSteps; i++) {
    if (scheduleStore.generationStatus === 'paused') {
      await waitForResume()
    }
    if (scheduleStore.generationStatus === 'idle') {
      return // Stopped
    }
    
    await new Promise(resolve => setTimeout(resolve, 50))
    scheduleStore.updateProgress(i)
    
    // Here you would implement the actual scheduling algorithm
    if (i === totalSteps) {
      // Generate mock schedule for demonstration
      generateMockSchedule()
      scheduleStore.completeGeneration()
    }
  }
}

function waitForResume() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (scheduleStore.generationStatus === 'running') {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })
}

function generateMockSchedule() {
  // Mock schedule generation - in real implementation, this would be the actual algorithm
  for (const cls of classesStore.classes) {
    const lessons = classesStore.getClassLessons(cls.id)
    for (const lessonAssignment of lessons) {
      const lesson = lessonsStore.getLessonById(lessonAssignment.lessonId)
      if (!lesson?.distributionPlan) continue
      
      const distribution = lesson.distributionPlan.split('+').map(Number)
      let dayIndex = 0
      let slotIndex = 0
      
      for (const hours of distribution) {
        for (let h = 0; h < hours; h++) {
          const day = settingsStore.days[dayIndex % settingsStore.days.length]
          if (!scheduleStore.isSlotOccupied(cls.id, day, slotIndex)) {
            scheduleStore.assignSlot(cls.id, day, slotIndex, lesson.id, lessonAssignment.teacherId)
          }
          slotIndex++
          if (slotIndex >= settingsStore.dailyLessonHours) {
            slotIndex = 0
            dayIndex++
          }
        }
        dayIndex++
      }
    }
  }
  
  // Set initial active class and teacher
  if (classesStore.classes.length > 0) {
    activeClass.value = classesStore.classes[0].id
  }
  if (teachersStore.teachers.length > 0) {
    activeTeacher.value = teachersStore.teachers[0].id
  }
}

const saveSchedule = async () => {
  const data = {
    schedule: scheduleStore.$state,
    teachers: teachersStore.$state,
    classes: classesStore.$state,
    lessons: lessonsStore.$state,
    settings: settingsStore.$state,
    constraints: constraintsStore.$state,
  }
  const result = await window.electronAPI.saveSchedule(data)
  if (result.success) {
    saveMessage.value = 'Tüm veriler kaydedildi.'
    // Clear message after 3 seconds
    setTimeout(() => saveMessage.value = '', 3000)
  }
}

const exportSchedule = () => {
  const data = {
    schedule: scheduleStore.$state,
    teachers: teachersStore.$state,
    classes: classesStore.$state,
    lessons: lessonsStore.$state,
    settings: settingsStore.$state,
    constraints: constraintsStore.$state,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ders-programi-tum-veriler.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importSchedule = () => {
  // JSON dosyasından içe aktar
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          Object.assign(scheduleStore.$state, data.schedule)
          Object.assign(teachersStore.$state, data.teachers)
          Object.assign(classesStore.$state, data.classes)
          Object.assign(lessonsStore.$state, data.lessons)
          Object.assign(settingsStore.$state, data.settings)
          Object.assign(constraintsStore.$state, data.constraints)
          importMessage.value = 'Veriler içe aktarıldı.'
          importError.value = ''
          // Clear message after 3 seconds
          setTimeout(() => importMessage.value = '', 3000)
        } catch (error) {
          importError.value = 'Dosya okunurken hata oluştu.'
          importMessage.value = ''
          // Clear error after 5 seconds
          setTimeout(() => importError.value = '', 5000)
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>

<style scoped>
.schedule-page {
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.save-message {
  margin-top: 12px;
  padding: 8px 12px;
  background: #d1fae5;
  color: #065f46;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
}

.import-message {
  margin-top: 12px;
  padding: 8px 12px;
  background: #d1fae5;
  color: #065f46;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
}

.import-error {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Progress */
.progress-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-value {
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s;
}

.progress-status {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Errors */
.errors-section {
  background: white;
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.errors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fee2e2;
  border-bottom: 1px solid #fecaca;
}

.errors-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin: 0;
}

.errors-list {
  padding: 16px;
}

.error-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.error-item.error {
  background: #fee2e2;
}

.error-item.warning {
  background: #fef3c7;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-item.error .error-icon {
  color: #dc2626;
}

.error-item.warning .error-icon {
  color: #f59e0b;
}

.error-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.error-message {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

/* Schedule View */
.schedule-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.schedule-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.schedules-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-secondary);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.schedule-table-container {
  overflow-x: auto;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: center;
}

.schedule-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-secondary);
}

.time-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.slot-number {
  font-weight: 600;
  color: var(--text-primary);
}

.slot-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.schedule-cell {
  min-width: 100px;
  height: 60px;
  vertical-align: middle;
}

.lesson-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  background: #dbeafe;
  border-radius: 4px;
  border: 1px solid #93c5fd;
}

.lesson-block.teacher-view {
  background: #d1fae5;
  border-color: #6ee7b7;
}

.lesson-code {
  font-weight: 600;
  font-size: 12px;
  color: #1e40af;
}

.teacher-short,
.class-name {
  font-size: 11px;
  color: #3b82f6;
}

.duty-block {
  padding: 6px;
  background: #f3e8ff;
  border-radius: 4px;
  border: 1px solid #c4b5fd;
}

.duty-name {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 500;
}

/* Empty State */
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

.empty-state h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.prerequisites {
  margin-top: 32px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: inline-block;
}

.prerequisites h4 {
  margin-bottom: 12px;
  color: var(--text-primary);
}

.prerequisites ul {
  list-style: none;
  text-align: left;
}

.prerequisites li {
  padding: 6px 0;
  padding-left: 24px;
  position: relative;
}

.prerequisites li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: var(--text-secondary);
}

.prerequisites li.met::before {
  content: '✓';
  color: var(--success-color);
}

.prerequisites li.met {
  color: var(--success-color);
}

/* Animations */
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .schedules-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
</style>
