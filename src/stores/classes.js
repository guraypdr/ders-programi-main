import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings'

export const useClassesStore = defineStore('classes', () => {
  const settingsStore = useSettingsStore()
  
  // State
  const classes = ref([])
  const classLessons = ref({}) // classId -> lessons[]

  // Getters
  const classesByLevel = computed(() => {
    const grouped = {}
    settingsStore.classLevels.forEach(level => {
      grouped[level] = classes.value.filter(c => c.level === level)
    })
    return grouped
  })

  const getClassById = computed(() => (id) => {
    return classes.value.find(c => c.id === id)
  })

  const getClassLessons = computed(() => (classId) => {
    return classLessons.value[classId] || []
  })

  // Actions
  function addClass(classData) {
    try {
      const cls = {
        id: 'class_' + Date.now(),
        ...classData,
        createdAt: new Date().toISOString()
      }
      classes.value.push(cls)
      classLessons.value[cls.id] = []
      return cls
    } catch (error) {
      console.error('Sınıf eklenirken hata:', error)
      throw error
    }
  }

  function updateClass(id, updates) {
    try {
      const index = classes.value.findIndex(c => c.id === id)
      if (index !== -1) {
        classes.value[index] = { ...classes.value[index], ...updates }
      }
    } catch (error) {
      console.error('Sınıf güncellenirken hata:', error)
      throw error
    }
  }

  function deleteClass(id) {
    classes.value = classes.value.filter(c => c.id !== id)
    delete classLessons.value[id]
  }

  function assignLesson(classId, lessonId, teacherId = null) {
    if (!classLessons.value[classId]) {
      classLessons.value[classId] = []
    }
    
    const existing = classLessons.value[classId].find(l => l.lessonId === lessonId)
    if (existing) {
      existing.teacherId = teacherId
    } else {
      classLessons.value[classId].push({
        lessonId,
        teacherId,
        assignedAt: new Date().toISOString()
      })
    }
  }

  function removeLesson(classId, lessonId) {
    if (classLessons.value[classId]) {
      classLessons.value[classId] = classLessons.value[classId].filter(
        l => l.lessonId !== lessonId
      )
    }
  }

  function updateTeacherAssignment(classId, lessonId, teacherId) {
    if (classLessons.value[classId]) {
      const assignment = classLessons.value[classId].find(l => l.lessonId === lessonId)
      if (assignment) {
        assignment.teacherId = teacherId
      }
    }
  }

  function getTotalHours(classId) {
    const lessons = classLessons.value[classId] || []
    return lessons.reduce((total, l) => {
      // This would need lesson details from lessons store
      return total + 1 // Placeholder
    }, 0)
  }

  function validateDailyHours(classId, daySchedule) {
    const cls = classes.value.find(c => c.id === classId)
    if (!cls) return { valid: false, error: 'Sınıf bulunamadı' }
    
    const dailyHours = daySchedule.filter(s => s).length
    if (cls.maxDailyHours && dailyHours > cls.maxDailyHours) {
      return {
        valid: false,
        error: `Günlük ders saati ${cls.maxDailyHours} saati aşıyor`
      }
    }
    
    return { valid: true }
  }

  return {
    classes,
    classLessons,
    classesByLevel,
    getClassById,
    getClassLessons,
    addClass,
    updateClass,
    deleteClass,
    assignLesson,
    removeLesson,
    updateTeacherAssignment,
    getTotalHours,
    validateDailyHours
  }
})
