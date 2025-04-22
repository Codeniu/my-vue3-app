<template>
  <div class="object-info">
    <h3>{{ selectedObject ? '元素信息' : '画布信息' }}</h3>
    <template v-if="selectedObject">
      <div class="info-item">
        <label>类型：</label>
        <span>{{ getObjectType(selectedObject.type) }}</span>
      </div>
      <div class="info-item">
        <label>名称：</label>
        <input
          v-model="selectedObject.name"
          @input="updateObjectName"
          type="text"
          style="width: 160px; display: inline-block"
          placeholder="输入元素名称"
        />
      </div>
      <div class="info-item">
        <button class="delete-btn" @click="deleteSelected">删除元素</button>
      </div>
      <div class="info-item">
        <label>位置：</label>
        <span>
          X: {{ Math.round(selectedObject.left) }}, Y: {{ Math.round(selectedObject.top) }}
        </span>
      </div>
      <div class="info-item" v-if="selectedObject.width !== undefined">
        <label>尺寸：</label>
        <div class="size-inputs">
          <label> 宽：</label>
          <input
            type="number"
            v-model="selectedObject.width"
            @input="updateObjectSize"
            class="size-input"
            placeholder="宽度"
          />
          <label> 高：</label>
          <input
            type="number"
            v-model="selectedObject.height"
            @input="updateObjectSize"
            class="size-input"
            placeholder="高度"
          />
        </div>
      </div>
      <div class="info-item" v-if="selectedObject.radius !== undefined">
        <label>半径：</label>
        <input
          type="number"
          v-model="selectedObject.radius"
          @input="updateObjectRadius"
          class="size-input"
          placeholder="半径"
        />
      </div>
      <div class="info-item">
        <label>填充：</label>
        <input type="color" v-model="selectedObject.fill" @input="updateObjectColor" />
      </div>
      <div class="info-item">
        <label>边框：</label>
        <input type="color" v-model="selectedObject.stroke" @input="updateObjectStroke" />
      </div>
      <div class="info-item">
        <label>边框宽度：</label>
        <input
          type="number"
          v-model="selectedObject.strokeWidth"
          @input="updateObjectStrokeWidth"
          class="size-input"
          placeholder="边框宽度"
        />
      </div>

      <div class="info-item">
        <label>层级：</label>
        <div class="layer-buttons">
          <button @click="layerElement(LayerCommand.TOP)">置顶</button>
          <button @click="layerElement(LayerCommand.BOTTOM)">置底</button>
          <button @click="layerElement(LayerCommand.UP)">上移</button>
          <button @click="layerElement(LayerCommand.DOWN)">下移</button>
        </div>
      </div>
      <div class="info-item">
        <label>翻转：</label>
        <div class="flip-buttons">
          <button @click="toggleFlipX" :class="{ active: selectedObject.flipX }">水平翻转</button>
          <button @click="toggleFlipY" :class="{ active: selectedObject.flipY }">垂直翻转</button>
        </div>
      </div>
      <div class="info-item">
        <label>旋转：</label>
        <div class="rotate-controls">
          <input
            type="number"
            v-model="selectedObject.angle"
            @input="updateObjectAngle"
            class="angle-input"
            placeholder="角度"
          />
          <div class="rotate-buttons">
            <button @click="rotateLeft">左转45°</button>
            <button @click="rotateRight">右转45°</button>
          </div>
        </div>
      </div>
    </template>

    <template v-if="!selectedObject">
      <div class="info-item">
        <label>画布尺寸：</label>
        <div class="size-inputs">
          <label>宽：</label>
          <input
            type="number"
            v-model="canvasProperties.width"
            @input="updateCanvasProperties"
            class="size-input"
            placeholder="宽度"
          />
          <label>高：</label>
          <input
            type="number"
            v-model="canvasProperties.height"
            @input="updateCanvasProperties"
            class="size-input"
            placeholder="高度"
          />
        </div>
      </div>
      <div class="info-item">
        <label>背景色：</label>
        <input
          type="color"
          v-model="canvasProperties.backgroundColor"
          @input="updateCanvasProperties"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  selectedObject,
  canvasProperties,
  updateCanvasProperties,
  deleteSelected,
  updateObjectColor,
} from '../hooks/useCanvas'

import useCanvas from '../hooks/useCanvas'
import { LayerCommand } from '@/types/elements'

// 更新对象边框颜色
const updateObjectStroke = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('stroke', selectedObject.value.stroke)
    canvas.renderAll()
  }
}

// 更新对象名称
const updateObjectName = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject: any = canvas.getActiveObject()
  if (activeObject) {
    activeObject.name = selectedObject.value.name
    canvas.renderAll()
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

// 处理水平翻转
const toggleFlipX = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('flipX', !activeObject.flipX)
    selectedObject.value.flipX = activeObject.flipX
    canvas.renderAll()
  }
}

// 处理垂直翻转
const toggleFlipY = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('flipY', !activeObject.flipY)
    selectedObject.value.flipY = activeObject.flipY
    canvas.renderAll()
  }
}

// 处理层级显示
const layerElement = (command: LayerCommand) => {
  const [canvas] = useCanvas()

  if (!canvas) return
  const handleElement = canvas.getActiveObject()
  if (!handleElement) return
  switch (command) {
    case LayerCommand.UP:
      canvas.bringObjectForward(handleElement)
      break
    case LayerCommand.DOWN:
      canvas.sendObjectBackwards(handleElement)
      break
    case LayerCommand.TOP:
      canvas.bringObjectToFront(handleElement)
      break
    case LayerCommand.BOTTOM:
      canvas.sendObjectToBack(handleElement)
      break
    default:
      break
  }
  canvas.renderAll()
}

// 更新对象角度
const updateObjectAngle = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('angle', Number(selectedObject.value.angle))
    canvas.renderAll()
  }
}

// 向左旋转45度
const rotateLeft = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    const newAngle = (activeObject.angle || 0) - 45
    activeObject.set('angle', newAngle)
    selectedObject.value.angle = newAngle
    canvas.renderAll()
  }
}

// 向右旋转45度
const rotateRight = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    const newAngle = (activeObject.angle || 0) + 45
    activeObject.set('angle', newAngle)
    selectedObject.value.angle = newAngle
    canvas.renderAll()
  }
}

// 更新对象尺寸
const updateObjectSize = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set({
      width: Number(selectedObject.value.width),
      height: Number(selectedObject.value.height),
    })
    canvas.renderAll()
  }
}

// 更新对象半径
const updateObjectRadius = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject && activeObject.type === 'circle') {
    activeObject.set('radius', Number(selectedObject.value.radius))
    canvas.renderAll()
  }
}

// 更新对象边框宽度
const updateObjectStrokeWidth = () => {
  const [canvas] = useCanvas()

  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('strokeWidth', Number(selectedObject.value.strokeWidth))
    canvas.renderAll()
  }
}
</script>
<style scoped>
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
  color: #666;
}

.info-item input {
  display: inline-block;
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-item span {
  color: #333;
}

.flip-buttons {
  display: flex;
  gap: 8px;
}

.flip-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.flip-buttons button.active {
  background-color: #2196f3;
}

.delete-btn {
  width: 100%;
  background-color: #f44336;
  margin-bottom: 12px;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.import-btn {
  position: relative;
  overflow: hidden;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.layer-buttons {
  display: flex;
  gap: 8px;
}

.layer-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.rotate-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.angle-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.rotate-buttons {
  display: flex;
  gap: 8px;
}

.rotate-buttons button {
  padding: 4px 8px;
  font-size: 12px;
}

.size-inputs {
  display: flex;
  gap: 8px;
}

.size-input {
  width: 120px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
