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
      meta: {
        showInNav: true,
        title: '关于',
      },
    },
    {
      path: '/office-editor',
      name: 'office-editor',
      component: () => import('../views/OfficeEditorView.vue'),
      meta: {
        showInNav: true,
        title: 'Office 编辑器',
      },
    },

    {
      path: '/office-viewer',
      name: 'office-viewer',
      component: () => import('../views/OfficeEditorViewer.vue'),
      meta: {
        showInNav: true,
        title: 'Office 阅读器',
      },
    },

    {
      path: '/office-viewer-h5',
      name: 'office-viewer-h5',
      component: () => import('../views/office-editor-viewer-h5.vue'),
      meta: {
        showInNav: true,
        title: 'Office 阅读器 H5',
      },
    },

    {
      path: '/fabric-demo',
      name: 'fabric-demo',
      component: FabricDemoView,
      meta: {
        showInNav: true,
        title: 'Fabric 演示',
      },
    },

    {
      path: '/tree-demo',
      name: 'tree-demo',
      component: () => import('../views/tree-demo.vue'),
      meta: {
        showInNav: true,
        title: '树演示',
      },
    },

    {
      path: '/lottery-demo',
      name: 'lottery-demo',
      component: () => import('../views/LotteryDemoView.vue'),
      meta: {
        showInNav: true,
        title: '抽奖演示',
      },
    },
    {
      path: '/particle-effect',
      name: 'particle-effect',
      component: () => import('../views/ParticleEffectView.vue'),
      meta: {
        showInNav: true,
        title: '粒子效果 (Antigravity)',
      },
    },
  ],
})

export default router
