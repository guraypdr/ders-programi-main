<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <School class="logo-icon" />
      <h1 class="logo-text">Ders Programı</h1>
    </div>
    
    <nav class="sidebar-nav">
      <router-link
        v-for="route in routes"
        :key="route.name"
        :to="route.path"
        :class="['nav-item', { active: $route.name === route.name }]"
      >
        <component :is="getIcon(route.meta.icon)" class="nav-icon" />
        <span class="nav-text">{{ route.meta.title }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <div class="school-info" v-if="settingsStore.schoolName">
        <span class="school-name">{{ settingsStore.schoolName }}</span>
        <span class="school-type">{{ settingsStore.schoolTypeLabel }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '../../stores/settings'
import router from '../../router'
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Shield,
  Settings,
  Calendar,
  FileText
} from 'lucide-vue-next'

const route = useRoute()
const settingsStore = useSettingsStore()

const routes = computed(() => {
  const allRoutes = router.getRoutes().filter(r => r.meta?.title)
  const uniqueRoutes = []
  const seen = new Set()
  for (const route of allRoutes) {
    if (!seen.has(route.name)) {
      seen.add(route.name)
      uniqueRoutes.push(route)
    }
  }
  return uniqueRoutes
})

const iconMap = {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Shield,
  Settings,
  Calendar
}

function getIcon(iconName) {
  return iconMap[iconName] || LayoutDashboard
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #60a5fa;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.school-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.school-name {
  font-size: 13px;
  font-weight: 500;
  color: white;
}

.school-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
