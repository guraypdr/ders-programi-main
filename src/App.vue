<template>
  <div class="app-container">
    <Sidebar v-if="!isLoginPage" />
    <main class="main-content" :class="{ 'full-width': isLoginPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'login')
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  background: #f8fafc;
  padding: 0;
}

.main-content.full-width {
  margin-left: 0;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
