import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Teachers from '../views/Teachers.vue'
import Classes from '../views/Classes.vue'
import Lessons from '../views/Lessons.vue'
import Constraints from '../views/Constraints.vue'
import Settings from '../views/Settings.vue'
import ScheduleGenerator from '../views/ScheduleGenerator.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: 'Ana Sayfa', icon: 'LayoutDashboard' }
  },
  {
    path: '/teachers',
    name: 'teachers',
    component: Teachers,
    meta: { title: 'Öğretmenler', icon: 'Users' }
  },
  {
    path: '/classes',
    name: 'classes',
    component: Classes,
    meta: { title: 'Sınıflar', icon: 'School' }
  },
  {
    path: '/lessons',
    name: 'lessons',
    component: Lessons,
    meta: { title: 'Dersler', icon: 'BookOpen' }
  },
  {
    path: '/constraints',
    name: 'constraints',
    component: Constraints,
    meta: { title: 'Kısıtlamalar', icon: 'Shield' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { title: 'Ayarlar', icon: 'Settings' }
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: ScheduleGenerator,
    meta: { title: 'Program Oluştur', icon: 'Calendar' }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
