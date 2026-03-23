<template>
  <div class="dashboard">
    <header class="page-header">
      <h1 class="page-title">Ana Sayfa</h1>
      <p class="page-subtitle">Ders Programı Yönetim Sistemine Hoş Geldiniz</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon teachers">
          <Users />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ teachersStore.teachers.length }}</span>
          <span class="stat-label">Öğretmen</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon classes">
          <School />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ classesStore.classes.length }}</span>
          <span class="stat-label">Sınıf</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon lessons">
          <BookOpen />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ lessonsStore.lessons.length }}</span>
          <span class="stat-label">Ders</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon schedule">
          <Calendar />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ scheduleStatus }}</span>
          <span class="stat-label">Program Durumu</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h3>Hızlı Erişim</h3>
        </div>
        <div class="card-body">
          <div class="quick-links">
            <router-link to="/teachers" class="quick-link">
              <Users class="icon" />
              <span>Öğretmenleri Yönet</span>
              <ChevronRight class="arrow" />
            </router-link>
            <router-link to="/classes" class="quick-link">
              <School class="icon" />
              <span>Sınıfları Yönet</span>
              <ChevronRight class="arrow" />
            </router-link>
            <router-link to="/lessons" class="quick-link">
              <BookOpen class="icon" />
              <span>Dersleri Yönet</span>
              <ChevronRight class="arrow" />
            </router-link>
            <router-link to="/schedule" class="quick-link">
              <Calendar class="icon" />
              <span>Program Oluştur</span>
              <ChevronRight class="arrow" />
            </router-link>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Sistem Durumu</h3>
        </div>
        <div class="card-body">
          <div class="status-list">
            <div class="status-item" :class="{ ready: hasSettings }">
              <CheckCircle2 v-if="hasSettings" class="status-icon success" />
              <AlertCircle v-else class="status-icon warning" />
              <span>Ayarlar Tamamlandı</span>
            </div>
            <div class="status-item" :class="{ ready: teachersStore.teachers.length > 0 }">
              <CheckCircle2 v-if="teachersStore.teachers.length > 0" class="status-icon success" />
              <AlertCircle v-else class="status-icon warning" />
              <span>Öğretmenler Eklendi</span>
            </div>
            <div class="status-item" :class="{ ready: classesStore.classes.length > 0 }">
              <CheckCircle2 v-if="classesStore.classes.length > 0" class="status-icon success" />
              <AlertCircle v-else class="status-icon warning" />
              <span>Sınıflar Eklendi</span>
            </div>
            <div class="status-item" :class="{ ready: lessonsStore.lessons.length > 0 }">
              <CheckCircle2 v-if="lessonsStore.lessons.length > 0" class="status-icon success" />
              <AlertCircle v-else class="status-icon warning" />
              <span>Dersler Eklendi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTeachersStore } from '../stores/teachers'
import { useClassesStore } from '../stores/classes'
import { useLessonsStore } from '../stores/lessons'
import { useScheduleStore } from '../stores/schedule'
import { useSettingsStore } from '../stores/settings'
import {
  Users,
  School,
  BookOpen,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'

const teachersStore = useTeachersStore()
const classesStore = useClassesStore()
const lessonsStore = useLessonsStore()
const scheduleStore = useScheduleStore()
const settingsStore = useSettingsStore()

const hasSettings = computed(() => !!settingsStore.schoolType)

const scheduleStatus = computed(() => {
  if (scheduleStore.generationStatus === 'completed') return 'Hazır'
  if (scheduleStore.generationStatus === 'running') return 'Oluşturuluyor'
  return 'Oluşturulmadı'
})
</script>

<style scoped>
.dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.teachers {
  background: #dbeafe;
  color: #2563eb;
}

.stat-icon.classes {
  background: #d1fae5;
  color: #059669;
}

.stat-icon.lessons {
  background: #fef3c7;
  color: #b45309;
}

.stat-icon.schedule {
  background: #f3e8ff;
  color: #7c3aed;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.quick-link:hover {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.quick-link .icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.quick-link span {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.quick-link .arrow {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.status-item.ready {
  background: #d1fae5;
  color: #059669;
}

.status-icon {
  width: 20px;
  height: 20px;
}

.status-icon.success {
  color: #059669;
}

.status-icon.warning {
  color: #f59e0b;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
