import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useScheduleStore = defineStore('schedule', () => {
  // State
  const schedule = ref({}) // { [classId]: { [day]: { [slot]: { lessonId, teacherId } } } }
  const generationProgress = ref(0)
  const generationStatus = ref('') // 'idle', 'running', 'paused', 'completed', 'error'
  const validationErrors = ref([])
  const teacherSchedules = ref({}) // { [teacherId]: { [day]: { [slot]: { classId, lessonId } } } }

  // Getters
  const isGenerating = computed(() => generationStatus.value === 'running')
  const isPaused = computed(() => generationStatus.value === 'paused')
  const hasErrors = computed(() => validationErrors.value.length > 0)

  const getClassSchedule = computed(() => (classId) => {
    return schedule.value[classId] || {}
  })

  const getTeacherSchedule = computed(() => (teacherId) => {
    return teacherSchedules.value[teacherId] || {}
  })

  const getSlotInfo = computed(() => (classId, day, slot) => {
    return schedule.value[classId]?.[day]?.[slot] || null
  })

  const isSlotOccupied = computed(() => (classId, day, slot) => {
    return !!schedule.value[classId]?.[day]?.[slot]
  })

  const isTeacherBusy = computed(() => (teacherId, day, slot) => {
    return !!teacherSchedules.value[teacherId]?.[day]?.[slot]
  })

  // Actions
  function startGeneration() {
    generationStatus.value = 'running'
    generationProgress.value = 0
    validationErrors.value = []
    schedule.value = {}
    teacherSchedules.value = {}
  }

  function pauseGeneration() {
    generationStatus.value = 'paused'
  }

  function resumeGeneration() {
    generationStatus.value = 'running'
  }

  function stopGeneration() {
    generationStatus.value = 'idle'
    generationProgress.value = 0
  }

  function completeGeneration() {
    generationStatus.value = 'completed'
    generationProgress.value = 100
  }

  function updateProgress(progress) {
    generationProgress.value = Math.min(100, Math.max(0, progress))
  }

  function addValidationError(error) {
    validationErrors.value.push({
      id: 'err_' + Date.now(),
      ...error,
      timestamp: new Date().toISOString()
    })
  }

  function clearValidationErrors() {
    validationErrors.value = []
  }

  function assignSlot(classId, day, slot, lessonId, teacherId) {
    if (!schedule.value[classId]) {
      schedule.value[classId] = {}
    }
    if (!schedule.value[classId][day]) {
      schedule.value[classId][day] = {}
    }
    
    schedule.value[classId][day][slot] = {
      lessonId,
      teacherId,
      assignedAt: new Date().toISOString()
    }

    // Update teacher schedule
    if (teacherId) {
      if (!teacherSchedules.value[teacherId]) {
        teacherSchedules.value[teacherId] = {}
      }
      if (!teacherSchedules.value[teacherId][day]) {
        teacherSchedules.value[teacherId][day] = {}
      }
      teacherSchedules.value[teacherId][day][slot] = {
        classId,
        lessonId
      }
    }
  }

  function clearSlot(classId, day, slot) {
    const slotInfo = schedule.value[classId]?.[day]?.[slot]
    if (slotInfo) {
      // Clear from teacher schedule
      if (slotInfo.teacherId) {
        delete teacherSchedules.value[slotInfo.teacherId]?.[day]?.[slot]
      }
      // Clear from class schedule
      delete schedule.value[classId][day][slot]
    }
  }

  function swapSlots(classId1, day1, slot1, classId2, day2, slot2) {
    const info1 = schedule.value[classId1]?.[day1]?.[slot1]
    const info2 = schedule.value[classId2]?.[day2]?.[slot2]
    
    clearSlot(classId1, day1, slot1)
    clearSlot(classId2, day2, slot2)
    
    if (info2) {
      assignSlot(classId1, day1, slot1, info2.lessonId, info2.teacherId)
    }
    if (info1) {
      assignSlot(classId2, day2, slot2, info1.lessonId, info1.teacherId)
    }
  }

  function clearSchedule() {
    schedule.value = {}
    teacherSchedules.value = {}
    generationProgress.value = 0
    generationStatus.value = 'idle'
    validationErrors.value = []
  }

  function exportSchedule() {
    return {
      schedule: schedule.value,
      teacherSchedules: teacherSchedules.value,
      exportedAt: new Date().toISOString()
    }
  }

  function importSchedule(data) {
    schedule.value = data.schedule || {}
    teacherSchedules.value = data.teacherSchedules || {}
  }

  return {
    schedule,
    generationProgress,
    generationStatus,
    validationErrors,
    teacherSchedules,
    isGenerating,
    isPaused,
    hasErrors,
    getClassSchedule,
    getTeacherSchedule,
    getSlotInfo,
    isSlotOccupied,
    isTeacherBusy,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    stopGeneration,
    completeGeneration,
    updateProgress,
    addValidationError,
    clearValidationErrors,
    assignSlot,
    clearSlot,
    swapSlots,
    clearSchedule,
    exportSchedule,
    importSchedule
  }
})
