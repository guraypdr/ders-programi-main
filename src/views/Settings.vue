<template>
  <div class="settings-page">
    <header class="page-header">
      <h1 class="page-title">Ayarlar</h1>
      <p class="page-subtitle">Okul ve ders programı ayarlarını yapılandırın</p>
    </header>

    <div class="settings-grid">
      <!-- School Type and Info -->
      <div class="card">
        <div class="card-header">
          <h3>Okul Bilgileri</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Okul Türü *</label>
            <select v-model="settings.schoolType" class="form-select" required>
              <option value="">Seçiniz</option>
              <option value="ilkokul">İlkokul</option>
              <option value="ortaokul">Ortaokul</option>
              <option value="lise">Lise</option>
            </select>
            <small class="help-text">Okul türüne göre sınıf düzeyleri otomatik belirlenecektir</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Okul Adı</label>
              <input v-model="settings.schoolName" @blur="capitalizeOnBlur('schoolName')" type="text" class="form-input" placeholder="Okul adını girin">
            </div>
            <div class="form-group">
              <label class="form-label">Müdür Adı</label>
              <input v-model="settings.principalName" @blur="capitalizeOnBlur('principalName')" type="text" class="form-input" placeholder="Müdür adını girin">
            </div>
          </div>

          <div class="preview-section" v-if="settings.schoolType">
            <label class="form-label">Sınıf Düzeyleri</label>
            <div class="level-badges">
              <span v-for="level in availableLevels" :key="level" class="badge badge-primary">
                {{ level === 'Hazırlık' ? 'Hazırlık Sınıfı' : level + '. Sınıf' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Settings -->
      <div class="card">
        <div class="card-header">
          <h3>Ders Programı Ayarları</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Günlük Ders Saati Sayısı</label>
              <input v-model.number="settings.dailyLessonHours" type="number" min="1" max="12" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Ders Başlangıç Saati</label>
              <input v-model="settings.lessonStartTime" type="time" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Teneffüs Süresi (dk)</label>
              <input v-model.number="settings.breakDuration" type="number" min="5" max="30" class="form-input">
              <small class="help-text">Dersler arası teneffüs süresi</small>
            </div>
            <div class="form-group">
              <label class="form-label">Dersler Arası Farklı Teneffüs</label>
              <div class="checkbox-wrapper">
                <input v-model="settings.useDynamicBreaks" type="checkbox" id="dynamicBreaks" class="checkbox-input">
                <label for="dynamicBreaks" class="checkbox-label">Her ders arası farklı süre kullan</label>
              </div>
            </div>
          </div>

          <div v-if="settings.useDynamicBreaks" class="dynamic-breaks-section">
            <label class="form-label">Dersler Arası Teneffüs Süreleri (dk)</label>
            <div class="breaks-list">
              <div v-for="i in settings.dailyLessonHours - 1" :key="i" class="break-item">
                <span class="break-label">{{ i }}. ve {{ i + 1 }}. ders arası:</span>
                <input 
                  v-model.number="settings.dynamicBreaks[i-1]" 
                  type="number" 
                  min="0" 
                  max="60" 
                  class="form-input small"
                  placeholder="dk"
                >
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Öğle Arası Hangi Dersten Sonra</label>
              <input v-model.number="settings.lunchAfterLesson" type="number" min="1" :max="settings.dailyLessonHours" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Öğle Arası Süresi (dk)</label>
              <input v-model.number="settings.lunchDuration" type="number" min="20" max="60" class="form-input">
            </div>
          </div>

          <div class="preview-section">
            <label class="form-label">Ders Saatleri Önizlemesi</label>
            <div class="time-slots">
              <div v-for="slot in lessonSlots" :key="slot.index" class="time-slot" :class="{ lunch: slot.isLunchAfter }">
                <span class="slot-number">{{ slot.index + 1 }}. Ders</span>
                <span class="slot-time">{{ slot.start }} - {{ slot.end }}</span>
                <span v-if="slot.isLunchAfter" class="lunch-badge">Öğle Arası</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fields (only for Lise) -->
      <div class="card" v-if="settings.schoolType === 'lise'">
        <div class="card-header">
          <h3>Alanlar</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Yeni Alan Ekle</label>
            <div class="add-field-row">
              <input v-model="newField" @blur="capitalizeOnBlur('newField', newField)" type="text" class="form-input" placeholder="Alan adını girin (örn: Fen, Sosyal)">
              <button @click="addField" class="btn btn-primary" :disabled="!newField.trim()">
                <Plus class="icon" />
                Ekle
              </button>
            </div>
          </div>

          <div class="fields-list">
            <div v-for="field in settings.fields" :key="field.id" class="field-item" :class="{ default: field.id === 'default' }">
              <span class="field-name">{{ field.name }}</span>
              <button v-if="field.id !== 'default'" @click="removeField(field.id)" class="btn-icon" title="Sil">
                <X class="icon" />
              </button>
              <span v-else class="default-badge">Varsayılan</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions-bar">
      <button @click="saveSettings" class="btn btn-primary btn-lg">
        <Save class="icon" />
        Ayarları Kaydet
      </button>
    </div>

    <div v-if="saveMessage" class="save-message">
      {{ saveMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { Plus, X, Save } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const newField = ref('')
const saveMessage = ref('')

// Utility function to capitalize first letter of each word
function capitalizeWords(str) {
  if (!str) return str
  return str.split(' ').map(word => {
    if (!word) return word
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
  }).join(' ')
}

const settings = ref({
  schoolType: settingsStore.schoolType,
  schoolName: settingsStore.schoolName,
  principalName: settingsStore.principalName,
  dailyLessonHours: settingsStore.dailyLessonHours,
  lessonDuration: settingsStore.lessonDuration,
  breakDuration: settingsStore.breakDuration,
  useDynamicBreaks: settingsStore.useDynamicBreaks || false,
  dynamicBreaks: settingsStore.dynamicBreaks || [],
  lunchAfterLesson: settingsStore.lunchAfterLesson,
  lunchDuration: settingsStore.lunchDuration,
  lessonStartTime: settingsStore.lessonStartTime,
  fields: [...settingsStore.fields]
})

// Capitalize on blur instead of watch to avoid focus issues
function capitalizeOnBlur(field, targetRef = null) {
  const ref = targetRef || settings.value
  if (ref[field]) {
    ref[field] = capitalizeWords(ref[field])
  }
}

const availableLevels = computed(() => {
  switch (settings.value.schoolType) {
    case 'ilkokul': return [1, 2, 3, 4]
    case 'ortaokul': return [5, 6, 7, 8]
    case 'lise': return ['Hazırlık', 9, 10, 11, 12]
    default: return []
  }
})

const lessonSlots = computed(() => {
  const slots = []
  let currentTime = settings.value.lessonStartTime
  
  for (let i = 0; i < settings.value.dailyLessonHours; i++) {
    const [hours, minutes] = currentTime.split(':').map(Number)
    const start = new Date(2024, 0, 1, hours, minutes)
    const end = new Date(start.getTime() + settings.value.lessonDuration * 60000)
    
    slots.push({
      index: i,
      start: formatTime(start),
      end: formatTime(end),
      isLunchAfter: i === settings.value.lunchAfterLesson - 1
    })
    
    // Calculate break time
    let breakTime
    if (i === settings.value.lunchAfterLesson - 1) {
      breakTime = settings.value.lunchDuration
    } else if (settings.value.useDynamicBreaks && settings.value.dynamicBreaks[i]) {
      breakTime = settings.value.dynamicBreaks[i]
    } else {
      breakTime = settings.value.breakDuration
    }
    
    const nextStart = new Date(end.getTime() + breakTime * 60000)
    currentTime = formatTime(nextStart)
  }
  
  return slots
})

function formatTime(date) {
  return date.toTimeString().slice(0, 5)
}

function addField() {
  if (newField.value.trim() && !settings.value.fields.find(f => f.name === newField.value.trim())) {
    settings.value.fields.push({
      id: 'field_' + Date.now(),
      name: newField.value.trim()
    })
    newField.value = ''
  }
}

function removeField(fieldId) {
  settings.value.fields = settings.value.fields.filter(f => f.id !== fieldId)
}

function saveSettings() {
  settingsStore.updateSettings(settings.value)
  saveMessage.value = 'Ayarlar başarıyla kaydedildi!'
  // Clear message after 3 seconds
  setTimeout(() => saveMessage.value = '', 3000)
}
</script>

<style scoped>
.settings-page {
  padding: 24px;
  padding-bottom: 100px;
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

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: border-color 0.2s;
  background: var(--bg-primary);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.level-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.time-slot.lunch {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.slot-number {
  font-weight: 500;
  min-width: 80px;
}

.slot-time {
  color: var(--text-secondary);
  flex: 1;
}

.lunch-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: #f59e0b;
  color: white;
  border-radius: 4px;
}

.add-field-row {
  display: flex;
  gap: 12px;
}

.add-field-row .form-input {
  flex: 1;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.field-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.field-item.default {
  background: #dbeafe;
  border-color: #3b82f6;
}

.field-name {
  font-size: 14px;
  font-weight: 500;
}

.default-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
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
  background: var(--bg-tertiary);
  color: var(--danger-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

.actions-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 260px;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  z-index: 50;
}

.icon {
  width: 18px;
  height: 18px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.dynamic-breaks-section {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.breaks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.break-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.break-label {
  font-size: 14px;
  color: var(--text-primary);
  min-width: 150px;
}

.form-input.small {
  width: 80px;
  text-align: center;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    left: 0;
  }
}

.save-message {
  position: fixed;
  bottom: 80px;
  right: 24px;
  padding: 12px 16px;
  background: #d1fae5;
  color: #065f46;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  z-index: 100;
}
</style>
