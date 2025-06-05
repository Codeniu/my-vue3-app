import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FabricDemoView from '../views/FabricDemoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/office-editor',
      name: 'office-editor',
      component: () => import('../views/OfficeEditorView.vue'),
    },

    {
      path: '/office-viewer',
      name: 'office-viewer',
      component: () => import('../views/OfficeEditorViewer.vue'),
    },

    {
      path: '/office-viewer-h5',
      name: 'office-viewer-h5',
      component: () => import('../views/office-editor-viewer-h5.vue'),
    },

    {
      path: '/fabric-demo',
      name: 'fabric-demo',
      component: FabricDemoView,
    },
  ],
})

export default router
