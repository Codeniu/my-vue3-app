<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="side-nav">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="80" height="80" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/office-editor">Office Editor</RouterLink>
        <RouterLink to="/fabric-demo">Fabric Demo</RouterLink>
      </nav>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.side-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid var(--color-border);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content {
  margin-left: 200px;
  flex: 1;
  padding: 2rem;
}

.logo {
  display: block;
  margin-bottom: 2rem;
}

nav {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

nav a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 6px;
  transition: background-color 0.2s;
}

nav a:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

nav a.router-link-exact-active {
  background-color: var(--color-background-soft);
  font-weight: 500;
}
</style>
