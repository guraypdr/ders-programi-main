import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'ders-programi-settings'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return null
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // Load saved data or use defaults
  const saved = loadFromStorage()
  // State
  const schoolType = ref(saved?.schoolType || '')
  const schoolName = ref(saved?.schoolName || '')
  const principalName = ref(saved?.principalName || '')
  const dailyLessonHours = ref(saved?.dailyLessonHours ?? 8)
  const lessonDuration = ref(saved?.lessonDuration ?? 40)
  const breakDuration = ref(saved?.breakDuration ?? 10)
  const useDynamicBreaks = ref(saved?.useDynamicBreaks || false)
  const dynamicBreaks = ref(saved?.dynamicBreaks || [])
  const lunchAfterLesson = ref(saved?.lunchAfterLesson ?? 4)
  const lunchDuration = ref(saved?.lunchDuration ?? 40)
  const lessonStartTime = ref(saved?.lessonStartTime || '08:30')
  const fields = ref(saved?.fields || [{ id: 'default', name: 'Alan Yok' }])
  const days = ref(saved?.days || ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'])

  // Watch all state and save to localStorage
  watch([schoolType, schoolName, principalName, dailyLessonHours, lessonDuration,
    breakDuration, lunchAfterLesson, lunchDuration, lessonStartTime, fields, days],
    () => {
      saveToStorage({
        schoolType: schoolType.value,
        schoolName: schoolName.value,
        principalName: principalName.value,
        dailyLessonHours: dailyLessonHours.value,
        lessonDuration: lessonDuration.value,
        breakDuration: breakDuration.value,
        useDynamicBreaks: useDynamicBreaks.value,
        dynamicBreaks: dynamicBreaks.value,
        lunchAfterLesson: lunchAfterLesson.value,
        lunchDuration: lunchDuration.value,
        lessonStartTime: lessonStartTime.value,
        fields: fields.value,
        days: days.value
      })
    }, { deep: true })

  // Getters
  const classLevels = computed(() => {
    switch (schoolType.value) {
      case 'ilkokul':
        return [1, 2, 3, 4]
      case 'ortaokul':
        return [5, 6, 7, 8]
      case 'lise':
        return ['Hazırlık', 9, 10, 11, 12]
      default:
        return []
    }
  })

  const schoolTypeLabel = computed(() => {
    const labels = {
      ilkokul: 'İlkokul',
      ortaokul: 'Ortaokul',
      lise: 'Lise'
    }
    return labels[schoolType.value] || ''
  })

  const lessonSlots = computed(() => {
    const slots = []
    let currentTime = lessonStartTime.value

    for (let i = 0; i < dailyLessonHours.value; i++) {
      const [hours, minutes] = currentTime.split(':').map(Number)
      const start = new Date(2024, 0, 1, hours, minutes)
      const end = new Date(start.getTime() + lessonDuration.value * 60000)

      slots.push({
        index: i,
        start: formatTime(start),
        end: formatTime(end),
        isLunchAfter: i === lunchAfterLesson.value - 1
      })

      // Calculate break time
      let breakTime
      if (i === lunchAfterLesson.value - 1) {
        breakTime = lunchDuration.value
      } else if (useDynamicBreaks.value && dynamicBreaks.value[i] !== undefined) {
        breakTime = dynamicBreaks.value[i]
      } else {
        breakTime = breakDuration.value
      }

      const nextStart = new Date(end.getTime() + breakTime * 60000)
      currentTime = formatTime(nextStart)
    }

    return slots
  })

  // Actions
  function updateSettings(newSettings) {
    if (newSettings.schoolType !== undefined) schoolType.value = newSettings.schoolType
    if (newSettings.schoolName !== undefined) schoolName.value = newSettings.schoolName
    if (newSettings.principalName !== undefined) principalName.value = newSettings.principalName
    if (newSettings.dailyLessonHours !== undefined) dailyLessonHours.value = newSettings.dailyLessonHours
    if (newSettings.lessonDuration !== undefined) lessonDuration.value = newSettings.lessonDuration
    if (newSettings.breakDuration !== undefined) breakDuration.value = newSettings.breakDuration
    if (newSettings.useDynamicBreaks !== undefined) useDynamicBreaks.value = newSettings.useDynamicBreaks
    if (newSettings.dynamicBreaks !== undefined) dynamicBreaks.value = newSettings.dynamicBreaks
    if (newSettings.lunchAfterLesson !== undefined) lunchAfterLesson.value = newSettings.lunchAfterLesson
    if (newSettings.lunchDuration !== undefined) lunchDuration.value = newSettings.lunchDuration
    if (newSettings.lessonStartTime !== undefined) lessonStartTime.value = newSettings.lessonStartTime
    if (newSettings.fields !== undefined) fields.value = newSettings.fields
    if (newSettings.days !== undefined) days.value = newSettings.days
  }

  function addField(fieldName) {
    if (fieldName && !fields.value.find(f => f.name === fieldName)) {
      fields.value.push({
        id: 'field_' + Date.now(),
        name: fieldName
      })
    }
  }

  function removeField(fieldId) {
    if (fieldId !== 'default') {
      fields.value = fields.value.filter(f => f.id !== fieldId)
    }
  }

  function formatTime(date) {
    return date.toTimeString().slice(0, 5)
  }

  return {
    schoolType,
    schoolName,
    principalName,
    dailyLessonHours,
    lessonDuration,
    breakDuration,
    useDynamicBreaks,
    dynamicBreaks,
    lunchAfterLesson,
    lunchDuration,
    lessonStartTime,
    fields,
    days,
    classLevels,
    schoolTypeLabel,
    lessonSlots,
    updateSettings,
    addField,
    removeField
  }
})
