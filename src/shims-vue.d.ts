declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 为了支持 ant-design-vue 的类型声明
declare module 'ant-design-vue/es/*'
declare module 'ant-design-vue/lib/*'
