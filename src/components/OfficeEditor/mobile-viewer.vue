<template>
  <div class="editor-mobile">
    <div class="layout-content">
      <div class="layout-content-mobile">
        <div class="center-body">
          <CanvasCenter />
        </div>
      </div>

      <slot name="bottom"> </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick, onBeforeUnmount, ref } from 'vue'
import CanvasCenter from './CanvasCenter/index.vue'
import useCanvas, { setCanvasTransform } from './hooks/useCanvas'
import { useFabricStore } from '@/stores/fabric'
import { getObjectsBoundingBox } from '@/utils/fabric'

// 保存原始selection描述符的引用
const originalSelectionDescriptor = ref<any>(null)

// 初始化移动端视图和交互
const initMobileView = async () => {
  await nextTick()
  const [canvas] = useCanvas()
  if (!canvas) return

  // 禁止框选元素 - 确保这个设置不会被覆盖
  canvas.selection = false

  // 使用defineProperty劫持selection属性，确保它始终为false
  originalSelectionDescriptor.value = Object.getOwnPropertyDescriptor(canvas, 'selection')
  if (originalSelectionDescriptor.value && originalSelectionDescriptor.value.configurable) {
    let selectionValue = false
    Object.defineProperty(canvas, 'selection', {
      get: function () {
        return selectionValue
      },
      set: function () {
        // 忽略所有设置尝试，始终保持为false
        selectionValue = false
        return false
      },
      configurable: true,
    })
  }

  // 缩放视图到画面中心
  centerCanvas()

  // 初始化触摸事件
  initTouchEvents()
}

// 缩放视图到画面中心
const centerCanvas = () => {
  const [canvas] = useCanvas()
  if (!canvas) return

  const fabricStore = useFabricStore()

  // 获取所有对象的边界
  const objects = canvas.getObjects()
  if (objects.length === 0) return

  // 计算所有对象的边界
  const boundingBox = getObjectsBoundingBox(objects)
  if (!boundingBox) return

  // 计算缩放比例，使内容适应容器
  const containerWidth = fabricStore.getWidth()
  const containerHeight = fabricStore.getHeight()

  const scaleX = containerWidth / (boundingBox.width * 1.1) // 添加10%的边距
  const scaleY = containerHeight / (boundingBox.height * 1.1)
  const scale = Math.min(scaleX, scaleY, 1) // 限制最大缩放为1

  // 计算边界框的左上角坐标
  const left = boundingBox.centerX - boundingBox.width / 2
  const top = boundingBox.centerY - boundingBox.height / 2

  // 设置缩放和平移以居中显示内容
  canvas.setViewportTransform([
    scale,
    0,
    0,
    scale,
    (containerWidth - boundingBox.width * scale) / 2 - left * scale,
    (containerHeight - boundingBox.height * scale) / 2 - top * scale,
  ])

  canvas.requestRenderAll()
}

// 创建一个引用来跟踪事件处理器，便于清理
const eventHandlers = ref<any>({
  touchDrag: null,
})

// 防抖函数
const debounce = (fn: { (): void; apply?: any }, delay = 300) => {
  let timer: number | null | undefined = null
  return function (...args: any) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 初始化触摸事件
const initTouchEvents = () => {
  const [canvas] = useCanvas()
  if (!canvas) return

  let lastPosX = 0
  let lastPosY = 0
  let isDragging = false

  // 单指拖动处理函数
  const handleTouchDrag = function (event: { e: any }) {
    try {
      const e = event.e
      if (!e.touches || e.touches.length !== 1) return

      if (!isDragging) {
        isDragging = true
        lastPosX = e.touches[0].clientX
        lastPosY = e.touches[0].clientY
        return
      }

      const vpt = canvas.viewportTransform
      if (!vpt) return

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const deltaX = currentX - lastPosX
      const deltaY = currentY - lastPosY

      vpt[4] += deltaX
      vpt[5] += deltaY

      canvas.requestRenderAll()

      lastPosX = currentX
      lastPosY = currentY

      // 阻止默认行为，防止页面滚动
      e.preventDefault()
    } catch (error) {
      console.error('处理触摸拖拽事件出错:', error)
      isDragging = false
    }
  }

  // 注册事件处理器
  try {
    canvas.on('mouse:down', (opt: any) => {
      isDragging = true
      canvas!.selection = false
      lastPosX = opt.e.touches[0].clientX
      lastPosY = opt.e.touches[0].clientY
      canvas!.defaultCursor = 'grabbing'
      opt.e.preventDefault()
    })

    canvas.on('mouse:move', handleTouchDrag)

    // 保存事件处理器引用，以便后续清理
    eventHandlers.value = {
      touchDrag: handleTouchDrag,
    }
  } catch (error) {
    console.error('注册事件处理器出错:', error)
  }
}

// 创建一个防抖处理的resize处理函数
const handleResize = debounce(() => {
  setCanvasTransform()
  centerCanvas()
}, 200)

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  await initMobileView()

  // 监听窗口大小变化，使用防抖处理
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理资源
onBeforeUnmount(() => {
  try {
    // 移除resize事件监听
    window.removeEventListener('resize', handleResize)

    // 移除canvas事件监听
    const [canvas] = useCanvas()
    if (canvas) {
      // 恢复原始selection属性描述符
      if (originalSelectionDescriptor.value && originalSelectionDescriptor.value.configurable) {
        Object.defineProperty(canvas, 'selection', originalSelectionDescriptor.value)
      }

      // 移除事件监听器
      const handlers = eventHandlers.value
      if (handlers.touchDrag) canvas.off('touch:drag', handlers.touchDrag)
    }
  } catch (error) {
    console.error('组件卸载清理资源出错:', error)
  }
})
</script>

<style lang="less" scoped>
.editor-mobile {
  height: calc(100vh - 360px);
}

.layout-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-content-mobile {
  width: 100%;
  height: 70%;

  .center-body {
    padding: 10px;
    background-color: #fff;
    height: 100%;
  }
}

:deep(.canvas-container) {
  height: 100% !important;
}

:deep([name='bottom']) {
  height: 30%;
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
  border-top: 1px solid #eee;
}
</style>
