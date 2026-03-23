import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConstraintsStore = defineStore('constraints', () => {
  // State
  const sameTimeConstraints = ref([]) // Aynı saate gelmesi istenen dersler
  const differentDayConstraints = ref([]) // Aynı güne gelmemesi istenen dersler
  const specificDayConstraints = ref([]) // Sadece belirli günlere gelmesi istenen dersler

  // Getters
  const allConstraints = computed(() => {
    return [
      ...sameTimeConstraints.value.map(c => ({ ...c, type: 'sameTime' })),
      ...differentDayConstraints.value.map(c => ({ ...c, type: 'differentDay' })),
      ...specificDayConstraints.value.map(c => ({ ...c, type: 'specificDay' }))
    ]
  })

  const getConstraintsForClass = computed(() => (classId) => {
    return {
      sameTime: sameTimeConstraints.value.filter(c => c.classId === classId),
      differentDay: differentDayConstraints.value.filter(c => c.classId === classId),
      specificDay: specificDayConstraints.value.filter(c => c.classId === classId)
    }
  })

  const getConstraintsForLesson = computed(() => (lessonId) => {
    return {
      sameTime: sameTimeConstraints.value.filter(c => 
        c.lessons.includes(lessonId)
      ),
      differentDay: differentDayConstraints.value.filter(c => 
        c.lesson1 === lessonId || c.lesson2 === lessonId
      ),
      specificDay: specificDayConstraints.value.filter(c => 
        c.lessonId === lessonId
      )
    }
  })

  // Actions
  function addSameTimeConstraint(classId, lessonIds) {
    sameTimeConstraints.value.push({
      id: 'st_' + Date.now(),
      classId,
      lessons: lessonIds,
      createdAt: new Date().toISOString()
    })
  }

  function removeSameTimeConstraint(constraintId) {
    sameTimeConstraints.value = sameTimeConstraints.value.filter(
      c => c.id !== constraintId
    )
  }

  function addDifferentDayConstraint(classId, lesson1Id, lesson2Id) {
    differentDayConstraints.value.push({
      id: 'dd_' + Date.now(),
      classId,
      lesson1: lesson1Id,
      lesson2: lesson2Id,
      createdAt: new Date().toISOString()
    })
  }

  function removeDifferentDayConstraint(constraintId) {
    differentDayConstraints.value = differentDayConstraints.value.filter(
      c => c.id !== constraintId
    )
  }

  function addSpecificDayConstraint(classId, lessonId, allowedDays) {
    specificDayConstraints.value.push({
      id: 'sd_' + Date.now(),
      classId,
      lessonId,
      allowedDays,
      createdAt: new Date().toISOString()
    })
  }

  function removeSpecificDayConstraint(constraintId) {
    specificDayConstraints.value = specificDayConstraints.value.filter(
      c => c.id !== constraintId
    )
  }

  function updateSpecificDays(constraintId, newDays) {
    const constraint = specificDayConstraints.value.find(c => c.id === constraintId)
    if (constraint) {
      constraint.allowedDays = newDays
    }
  }

  // Validation helpers
  function checkSameTimeCompatibility(classId, lessonId, day, slot) {
    const constraints = sameTimeConstraints.value.filter(c => 
      c.classId === classId && c.lessons.includes(lessonId)
    )
    
    for (const constraint of constraints) {
      const otherLessons = constraint.lessons.filter(l => l !== lessonId)
      // Check if other lessons can be scheduled at the same time
      // This would need to be checked during schedule generation
    }
    
    return true
  }

  function checkDifferentDayViolation(classId, lessonId, day) {
    const constraints = differentDayConstraints.value.filter(c =>
      c.classId === classId && (c.lesson1 === lessonId || c.lesson2 === lessonId)
    )
    
    // Return the constraint if there's a violation
    return constraints.filter(c => {
      const otherLesson = c.lesson1 === lessonId ? c.lesson2 : c.lesson1
      // Check if other lesson is already scheduled on this day
      // This would be checked during schedule generation
      return false
    })
  }

  function checkSpecificDayAllowed(classId, lessonId, day) {
    const constraint = specificDayConstraints.value.find(c =>
      c.classId === classId && c.lessonId === lessonId
    )
    
    if (!constraint) return true // No constraint means any day is allowed
    return constraint.allowedDays.includes(day)
  }

  return {
    sameTimeConstraints,
    differentDayConstraints,
    specificDayConstraints,
    allConstraints,
    getConstraintsForClass,
    getConstraintsForLesson,
    addSameTimeConstraint,
    removeSameTimeConstraint,
    addDifferentDayConstraint,
    removeDifferentDayConstraint,
    addSpecificDayConstraint,
    removeSpecificDayConstraint,
    updateSpecificDays,
    checkSameTimeCompatibility,
    checkDifferentDayViolation,
    checkSpecificDayAllowed
  }
})
