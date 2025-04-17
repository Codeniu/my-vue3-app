<template>
  <div class="fabric-demo">
    <div class="main-content">
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
    <div v-if="selectedObject" class="object-info">
      <h3>元素信息</h3>
      <div class="info-item">
        <label>名称：</label>
        <input
          v-model="selectedObject.name"
          @input="updateObjectName"
          type="text"
          placeholder="输入元素名称"
        />
      </div>
      <div class="info-item">
        <label>类型：</label>
        <span>{{ getObjectType(selectedObject.type) }}</span>
      </div>
      <div class="info-item">
        <label>位置：</label>
        <span>
          X: {{ Math.round(selectedObject.left) }}, Y: {{ Math.round(selectedObject.top) }}
        </span>
      </div>
      <div class="info-item" v-if="selectedObject.width !== undefined">
        <label>尺寸：</label>
        <span>
          宽: {{ Math.round(selectedObject.width) }}, 高:
          {{ Math.round(selectedObject.height) }}
        </span>
      </div>
      <div class="info-item" v-if="selectedObject.radius !== undefined">
        <label>半径：</label>
        <span>{{ Math.round(selectedObject.radius) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, shallowRef } from 'vue'
import { fabric } from 'fabric'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas = shallowRef<fabric.Canvas | null>(null)
const currentColor = ref('#000000')
const selectedObject = ref<any>(null)

onMounted(async () => {
  await nextTick()

  if (canvasRef.value) {
    canvas.value = new fabric.Canvas(canvasRef.value, {
      width: 800,
      height: 600,
      backgroundColor: 'gray',
      preserveObjectStacking: true, // 保持对象堆叠顺序
    })

    addTextDemo()

    // 设置控制点样式
    fabric.Object.prototype.set({
      transparentCorners: false,
      borderColor: '#2196F3',
      cornerColor: '#2196F3',
      cornerStyle: 'circle',
      cornerSize: 10,
      padding: 10,
    })

    // 监听对象选择事件
    canvas.value.on('selection:created', handleObjectSelected)
    canvas.value.on('selection:updated', handleObjectSelected)
    canvas.value.on('selection:cleared', handleSelectionCleared)
    canvas.value.on('object:modified', handleObjectModified)
    canvas.value.on('scaling', handleObjectScaling)

    // 监听鼠标滚轮事件
    canvas.value.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY
      let zoom = canvas.value!.getZoom()
      zoom *= 0.999 ** delta
      canvas.value!.setZoom(Math.min(Math.max(zoom, 0.01), 20))
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })
  }
})

const addTextDemo = () => {
  if (!canvas.value) return

  const textValue = 'fabric.js sandbox'
  const text = new fabric.Textbox(textValue, {
    originX: 'center',
    splitByGrapheme: true,
    width: 200,
    top: 20,
    styles: fabric.util.stylesFromArray(
      [
        {
          style: {
            fontWeight: 'bold',
            fontSize: 64,
          },
          start: 0,
          end: 9,
        },
      ],
      textValue,
    ),
  })
  canvas.value.add(text)
  canvas.value.centerObjectH(text)
}

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
    selectedObject.value = {
      type: activeObject.type,
      left: activeObject.left,
      top: activeObject.top,
      width: activeObject.width,
      height: activeObject.height,
      radius: activeObject.type === 'circle' ? (activeObject as fabric.Circle).radius : undefined,
      name: activeObject.name || '',
    }
  }
}

// 处理取消选中事件
const handleSelectionCleared = () => {
  currentColor.value = '#000000'
  selectedObject.value = null
}

// 处理对象修改事件
const handleObjectModified = (e: any) => {
  if (!canvas.value) return
  const modifiedObject = e.target
  if (modifiedObject && selectedObject.value) {
    selectedObject.value = {
      ...selectedObject.value,
      left: modifiedObject.left,
      top: modifiedObject.top,
      width: modifiedObject.width,
      height: modifiedObject.height,
      radius: modifiedObject.type === 'circle' ? modifiedObject.radius : undefined,
    }
  }
}

// 更新对象名称
const updateObjectName = () => {
  if (!canvas.value || !selectedObject.value) return
  const activeObject = canvas.value.getActiveObject()
  if (activeObject) {
    activeObject.name = selectedObject.value.name
    canvas.value.renderAll()
  }
}

// 获取对象类型的中文描述
const getObjectType = (type: string) => {
  const typeMap: Record<string, string> = {
    rect: '矩形',
    circle: '圆形',
    triangle: '三角形',
    iText: '文本',
  }
  return typeMap[type] || type
}

// 处理对象缩放事件
const handleObjectScaling = (e: any) => {
  if (!canvas.value) return
  const scalingObject = e.target
  console.log(scalingObject)

  if (scalingObject && selectedObject.value) {
    selectedObject.value = {
      ...selectedObject.value,
      width: Math.round(scalingObject.getScaledWidth()),
      height: Math.round(scalingObject.getScaledHeight()),
      radius:
        scalingObject.type === 'circle'
          ? Math.round(scalingObject.getScaledWidth() / 2)
          : undefined,
    }
  }
}
</script>

<style scoped>
.fabric-demo {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.object-info {
  width: 300px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.object-info h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.info-item {
  margin-bottom: 12px;
}

.info-item label {
  display: inline-block;
  width: 60px;
  color: #666;
}

.info-item input {
  width: 200px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-item span {
  color: #333;
}
</style>
