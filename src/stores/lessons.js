import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings'
import { useClassesStore } from './classes'

export const useLessonsStore = defineStore('lessons', () => {
  const settingsStore = useSettingsStore()
  const classesStore = useClassesStore()

  // State
  const lessons = ref([])

  // Getters
  const lessonsByType = computed(() => {
    const types = {
      zorunlu: [],
      secmeli: [],
      rehberlik: []
    }
    
    lessons.value.forEach(lesson => {
      // Group by level and field
      const key = `${lesson.level}_${lesson.field || 'default'}`
      if (!types[lesson.type].find(g => g.key === key)) {
        types[lesson.type].push({
          key,
          level: lesson.level,
          field: lesson.field || 'default',
          lessons: []
        })
      }
      const group = types[lesson.type].find(g => g.key === key)
      group.lessons.push(lesson)
    })
    
    // Sort groups by level
    Object.keys(types).forEach(type => {
      types[type].sort((a, b) => {
        const levelA = settingsStore.classLevels.indexOf(a.level)
        const levelB = settingsStore.classLevels.indexOf(b.level)
        return levelA - levelB
      })
    })
    
    return types
  })

  const getLessonById = computed(() => (id) => {
    return lessons.value.find(l => l.id === id)
  })

  const lessonsByLevel = computed(() => (level) => {
    return lessons.value.filter(l => l.level === level)
  })

  const lessonsByField = computed(() => (field) => {
    return lessons.value.filter(l => l.field === field)
  })

  const isStajLesson = computed(() => (id) => {
    const lesson = lessons.value.find(l => l.id === id)
    return lesson ? lesson.isStaj : false
  })

  // Actions
  function addLesson(lessonData) {
    try {
      const lesson = {
        id: 'lesson_' + Date.now(),
        ...lessonData,
        createdAt: new Date().toISOString()
      }
      lessons.value.push(lesson)
      
      // Auto-assign to compatible classes
      autoAssignToClasses(lesson)
      
      return lesson
    } catch (error) {
      console.error('Ders eklenirken hata:', error)
      throw error
    }
  }

  function updateLesson(id, updates) {
    try {
      const index = lessons.value.findIndex(l => l.id === id)
      if (index !== -1) {
        lessons.value[index] = { ...lessons.value[index], ...updates }
      }
    } catch (error) {
      console.error('Ders güncellenirken hata:', error)
      throw error
    }
  }

  function deleteLesson(id) {
    lessons.value = lessons.value.filter(l => l.id !== id)
  }

  function importFromExcel(data) {
    let addedCount = 0
    data.forEach((row, index) => {
      const lesson = {
        id: 'lesson_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9),
        name: row.name || row.ad || '',
        code: (row.code || row.kısaltma || '').toUpperCase(),
        level: row.level || row.sınıf || '',
        field: row.field || 'default',
        type: (row.type || row.tür || 'zorunlu').toLowerCase(),
        distributionPlan: row.distributionPlan || '',
        isStaj: row.isStaj === 'true' || row.isStaj === true || false,
        createdAt: new Date().toISOString()
      }
      lessons.value.push(lesson)
      
      // Auto-assign to compatible classes
      autoAssignToClasses(lesson)
      
      addedCount++
    })
    return addedCount
  }

  function autoAssignToClasses(lesson) {
    // Find classes that match the lesson's level and field
    const compatibleClasses = classesStore.classes.filter(c => 
      c.level === lesson.level && 
      (lesson.field === 'default' || c.field === lesson.field)
    )
    
    compatibleClasses.forEach(cls => {
      classesStore.assignLesson(cls.id, lesson.id)
    })
  }

  function getDistributionPlan(lessonId) {
    const lesson = lessons.value.find(l => l.id === lessonId)
    if (!lesson || !lesson.distributionPlan) return null
    
    // Parse distribution plan (e.g., "2+2+2" or "3+3")
    return lesson.distributionPlan.split('+').map(Number)
  }

  function getTotalHours(lessonId) {
    const distribution = getDistributionPlan(lessonId)
    return distribution ? distribution.reduce((a, b) => a + b, 0) : 0
  }

  return {
    lessons,
    lessonsByType,
    getLessonById,
    lessonsByLevel,
    lessonsByField,
    isStajLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    importFromExcel,
    getDistributionPlan,
    getTotalHours
  }
})
