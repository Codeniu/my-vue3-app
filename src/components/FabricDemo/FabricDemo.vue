<template>
  <div class="fabric-demo">
    <div class="toolbar">
      <button @click="addRect">矩形</button>
      <button @click="addCircle">圆形</button>
      <button @click="addTriangle">三角形</button>
      <button @click="addText">文本</button>
      <button @click="deleteSelected">删除</button>
      <button @click="clearCanvas">清空</button>
      <div class="color-picker">
        <label>颜色：</label>
        <input type="color" v-model="currentColor" @change="updateObjectColor" />
      </div>
    </div>
    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fabric } from 'fabric'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<fabric.Canvas | null>(null)
const currentColor = ref('#000000')

onMounted(() => {
  if (canvasRef.value) {
    canvas.value = new fabric.Canvas(canvasRef.value, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    })

    // 启用对象选择和移动
    canvas.value.selection = true

    // 监听对象选择事件
    canvas.value.on('selection:created', handleObjectSelected)
    canvas.value.on('selection:cleared', handleSelectionCleared)
  }
})

// 添加矩形
const addRect = () => {
  if (!canvas.value) return

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 80,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  })

  canvas.value.add(rect)
  canvas.value.setActiveObject(rect)
}

// 添加圆形
const addCircle = () => {
  if (!canvas.value) return

  const circle = new fabric.Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  })

  canvas.value.add(circle)
  canvas.value.setActiveObject(circle)
}

// 添加三角形
const addTriangle = () => {
  if (!canvas.value) return

  const triangle = new fabric.Triangle({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: currentColor.value,
    stroke: '#000000',
    strokeWidth: 1,
  })

  canvas.value.add(triangle)
  canvas.value.setActiveObject(triangle)
}

// 添加文本
const addText = () => {
  if (!canvas.value) return

  const text = new fabric.IText('双击编辑文本', {
    left: 100,
    top: 100,
    fontSize: 20,
    fill: currentColor.value,
  })

  canvas.value.add(text)
  canvas.value.setActiveObject(text)
}

// 删除选中的对象
const deleteSelected = () => {
  if (!canvas.value) return

  const activeObjects = canvas.value.getActiveObjects()
  canvas.value.remove(...activeObjects)
  canvas.value.discardActiveObject()
  canvas.value.renderAll()
}

// 清空画布
const clearCanvas = () => {
  if (!canvas.value) return
  canvas.value.clear()
  canvas.value.backgroundColor = '#ffffff'
  canvas.value.renderAll()
}

// 更新对象颜色
const updateObjectColor = () => {
  if (!canvas.value) return

  const activeObject = canvas.value.getActiveObject()
  if (activeObject) {
    activeObject.set('fill', currentColor.value)
    canvas.value.renderAll()
  }
}

// 处理对象选中事件
const handleObjectSelected = () => {
  if (!canvas.value) return

  const activeObject = canvas.value.getActiveObject()
  if (activeObject) {
    currentColor.value = (activeObject.get('fill') as string) || '#000000'
  }
}

// 处理取消选中事件
const handleSelectionCleared = () => {
  currentColor.value = '#000000'
}
</script>

<style scoped>
.fabric-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.canvas-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

canvas {
  background-color: #ffffff;
}
</style>
