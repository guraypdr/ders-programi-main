import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'ders-programi-teachers'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load teachers:', e)
  }
  return []
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save teachers:', e)
  }
}

export const useTeachersStore = defineStore('teachers', () => {
  // State
  const teachers = ref(loadFromStorage())
  const searchQuery = ref('')

  // Watch and save to localStorage
  watch(teachers, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })

  // Getters
  const filteredTeachers = computed(() => {
    let result = teachers.value
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(t => 
        t.firstName.toLowerCase().includes(query) ||
        t.lastName.toLowerCase().includes(query) ||
        t.branch.toLowerCase().includes(query) ||
        t.shortName.toLowerCase().includes(query)
      )
    }
    
    // Group by branch and sort alphabetically
    const grouped = {}
    result.forEach(teacher => {
      if (!grouped[teacher.branch]) {
        grouped[teacher.branch] = []
      }
      grouped[teacher.branch].push(teacher)
    })
    
    // Sort teachers within each branch
    Object.keys(grouped).forEach(branch => {
      grouped[branch].sort((a, b) => 
        (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName)
      )
    })
    
    // Sort branches
    const sortedBranches = Object.keys(grouped).sort()
    
    return { grouped, sortedBranches }
  })

  const getTeacherById = computed(() => (id) => {
    return teachers.value.find(t => t.id === id)
  })

  const branches = computed(() => {
    const uniqueBranches = new Set(teachers.value.map(t => t.branch))
    return Array.from(uniqueBranches).sort()
  })

  // Actions
  function addTeacher(teacherData) {
    try {
      const teacher = {
        id: 'teacher_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...teacherData,
        availability: initializeAvailability(),
        dailyConstraints: {},
        duties: [],
        createdAt: new Date().toISOString()
      }
      teachers.value.push(teacher)
      return teacher
    } catch (error) {
      console.error('Öğretmen eklenirken hata:', error)
      throw error
    }
  }

  function updateTeacher(id, updates) {
    try {
      const index = teachers.value.findIndex(t => t.id === id)
      if (index !== -1) {
        teachers.value[index] = { ...teachers.value[index], ...updates }
      }
    } catch (error) {
      console.error('Öğretmen güncellenirken hata:', error)
      throw error
    }
  }

  function deleteTeacher(id) {
    teachers.value = teachers.value.filter(t => t.id !== id)
  }

  function setAvailability(teacherId, day, slot, available) {
    const teacher = teachers.value.find(t => t.id === teacherId)
    if (teacher) {
      if (!teacher.availability) {
        teacher.availability = initializeAvailability()
      }
      teacher.availability[day][slot] = available
    }
  }

  function setDailyConstraints(teacherId, day, constraints) {
    const teacher = teachers.value.find(t => t.id === teacherId)
    if (teacher) {
      if (!teacher.dailyConstraints) {
        teacher.dailyConstraints = {}
      }
      teacher.dailyConstraints[day] = constraints
    }
  }

  function addDuty(teacherId, duty) {
    const teacher = teachers.value.find(t => t.id === teacherId)
    if (teacher) {
      if (!teacher.duties) {
        teacher.duties = []
      }
      teacher.duties.push({
        id: 'duty_' + Date.now(),
        ...duty
      })
    }
  }

  function removeDuty(teacherId, dutyId) {
    const teacher = teachers.value.find(t => t.id === teacherId)
    if (teacher && teacher.duties) {
      teacher.duties = teacher.duties.filter(d => d.id !== dutyId)
    }
  }

  function importFromExcel(data) {
    let addedCount = 0
    data.forEach((row, index) => {
      const teacher = {
        id: 'teacher_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9),
        firstName: row.firstName || row.ad || '',
        lastName: row.lastName || row.soyad || '',
        branch: row.branch || row.branş || '',
        phone: row.phone || row.telefon || '',
        shortName: row.shortName || row.kısaltma || '',
        availability: initializeAvailability(),
        dailyConstraints: {},
        duties: [],
        createdAt: new Date().toISOString()
      }
      teachers.value.push(teacher)
      addedCount++
    })
    return addedCount
  }

  function initializeAvailability() {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
    const availability = {}
    days.forEach(day => {
      availability[day] = Array(8).fill(true)
    })
    return availability
  }

  return {
    teachers,
    searchQuery,
    filteredTeachers,
    getTeacherById,
    branches,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    setAvailability,
    setDailyConstraints,
    addDuty,
    removeDuty,
    importFromExcel
  }
})
