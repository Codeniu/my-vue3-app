<template>
  <div class="office-editor">
    <div class="editor-container">
      <canvas ref="canvasRef" class="office-canvas"></canvas>
    </div>

    <div class="editor-sidebar">
      <template v-if="selectedSeat">
        <h3>工位信息</h3>
        <div class="form-group">
          <label>工位编号:</label>
          <input type="text" v-model="selectedSeat.id" />
        </div>
        <div class="form-group">
          <label>员工姓名:</label>
          <input type="text" v-model="selectedSeat.employee" />
        </div>
        <div class="form-group">
          <label>工位状态:</label>
          <select v-model="selectedSeat.status">
            <option value="available">空闲</option>
            <option value="occupied">已占用</option>
            <option value="reserved">已预订</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>
        <button @click="handleSaveChanges">保存更改</button>
      </template>

      <template v-else>
        <h3>办公室尺寸</h3>
        <div class="form-group">
          <label>宽度 (px):</label>
          <input type="number" :value="officeWidth" @input="handleWidthChange" min="400" />
        </div>
        <div class="form-group">
          <label>高度 (px):</label>
          <input type="number" :value="officeHeight" @input="handleHeightChange" min="300" />
        </div>
        <p class="size-tip">提示：也可以直接拖拽调整外框大小</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fabric } from 'fabric'
import type { Seat, SeatStatus, StatusColors, OfficeEditorProps } from './types'

const props = withDefaults(defineProps<OfficeEditorProps>(), {
  width: 800,
  height: 600,
  initialData: () => [],
})

const emit = defineEmits<{
  'update:seats': [seats: Seat[]]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<fabric.Canvas | null>(null)
const seats = ref<Seat[]>([])
const selectedSeat = ref<Seat | null>(null)
const officeWidth = ref(props.width - 20)
const officeHeight = ref(props.height - 20)

const statusColors: StatusColors = {
  available: '#4CAF50',
  occupied: '#FF9800',
  reserved: '#2196F3',
  maintenance: '#F44336',
}

const getDefaultEmployee = (id: number): string => {
  const employeeMap: Record<number, string> = {
    1: '李四',
    2: '王五',
    4: '陈琦',
    5: '张飞',
    6: '王琦',
    7: '赵六',
    8: '王五',
    9: '陈琦',
    10: '陈琦',
    11: '陈琦',
    12: '赵六',
    13: '陈琦',
    14: '陈琦',
    15: '陈琦',
    16: '',
  }
  return employeeMap[id] || ''
}

const createDefaultLayout = () => {
  const topRowY = 50
  const bottomRowY = 150
  const seatWidth = 100
  const seatHeight = 100

  // 第一排工位 (01-06)
  for (let i = 0; i < 6; i++) {
    seats.value.push({
      id: String(i + 1).padStart(2, '0'),
      x: 50 + i * seatWidth,
      y: topRowY,
      width: seatWidth,
      height: seatHeight,
      employee: getDefaultEmployee(i + 1),
      status: i % 3 === 1 ? 'occupied' : 'available',
      selected: false,
    })
  }

  // 第二排工位 (07-12)
  for (let i = 0; i < 6; i++) {
    seats.value.push({
      id: String(i + 7).padStart(2, '0'),
      x: 50 + i * seatWidth,
      y: bottomRowY,
      width: seatWidth,
      height: seatHeight,
      employee: getDefaultEmployee(i + 7),
      status: i % 2 === 0 ? 'occupied' : 'available',
      selected: false,
    })
  }

  // 底部工位 (13-16)
  const bottomY = 350
  for (let i = 0; i < 4; i++) {
    seats.value.push({
      id: String(i + 13).padStart(2, '0'),
      x: 400 + i * seatWidth,
      y: bottomY,
      width: seatWidth,
      height: seatHeight,
      employee: getDefaultEmployee(i + 13),
      status: i < 3 ? 'occupied' : 'available',
      selected: false,
    })
  }
}

const drawSeat = (seat: Seat) => {
  if (!canvas.value) return

  const group = new fabric.Group([], {
    left: seat.x,
    top: seat.y,
    width: seat.width,
    height: seat.height,
    selectable: true,
    hasControls: false,
    subTargetCheck: true,
  })

  // 工位边框
  const rect = new fabric.Rect({
    left: 0,
    top: 0,
    width: seat.width,
    height: seat.height,
    fill: 'transparent',
    stroke: seat.selected ? '#ff9900' : '#666',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
  })

  // 工位编号
  const idText = new fabric.Text(seat.id, {
    left: 10,
    top: 10,
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#333',
  })

  // 员工姓名
  const nameText = new fabric.Text(seat.employee || '空置', {
    left: seat.width / 2,
    top: seat.height / 2,
    fontSize: 16,
    fill: seat.employee ? '#333' : '#999',
    originX: 'center',
    originY: 'center',
  })

  // 状态标记
  const statusCircle = new fabric.Circle({
    radius: 8,
    fill: statusColors[seat.status],
    left: seat.width - 20,
    top: 10,
    stroke: '#fff',
    strokeWidth: 1,
  })

  group.addWithUpdate(rect)
  group.addWithUpdate(idText)
  group.addWithUpdate(nameText)
  group.addWithUpdate(statusCircle)

  group.setCoords()

  group.on('selected', () => {
    seats.value.forEach((s) => (s.selected = false))
    seat.selected = true
    selectedSeat.value = seat
    canvas.value?.renderAll()
  })

  canvas.value.add(group)
}

const drawOffice = () => {
  if (!canvas.value) return

  canvas.value.clear()

  // 绘制办公室外框
  const officeRect = new fabric.Rect({
    left: 10,
    top: 10,
    width: props.width - 20,
    height: props.height - 20,
    fill: 'transparent',
    stroke: '#000',
    strokeWidth: 2,
    selectable: true,
    hasControls: true,
    lockRotation: true,
    lockScalingFlip: true,
    minScaleLimit: 0.5,
    padding: 10,
    cornerStyle: 'circle',
    cornerColor: '#2196F3',
    transparentCorners: false,
    cornerSize: 10,
    borderColor: '#2196F3',
  })

  // 绘制门
  const door = new fabric.Path('M 150 550 Q 200 500, 150 450', {
    fill: 'transparent',
    stroke: '#000',
    strokeWidth: 2,
    selectable: false,
  })

  canvas.value.add(officeRect, door)
  seats.value.forEach(drawSeat)

  // 监听外框尺寸变化
  officeRect.on('scaling', (e: any) => {
    const target = e.target
    const newWidth = Math.round(target.getScaledWidth())
    const newHeight = Math.round(target.getScaledHeight())

    // 更新画布尺寸
    canvas.value?.setDimensions({
      width: newWidth + 20,
      height: newHeight + 20,
    })

    // 重新布局工位
    const scaleX = newWidth / (props.width - 20)
    const scaleY = newHeight / (props.height - 20)

    seats.value.forEach((seat) => {
      seat.x = Math.round(seat.x * scaleX)
      seat.y = Math.round(seat.y * scaleY)
    })

    drawOffice()
  })
}

const handleSaveChanges = () => {
  if (selectedSeat.value) {
    emit('update:seats', [...seats.value])
    selectedSeat.value = null
    drawOffice()
  }
}

const handleWidthChange = (event: Event) => {
  const newWidth = Number((event.target as HTMLInputElement).value)
  if (newWidth >= 400) {
    officeWidth.value = newWidth
    canvas.value?.setDimensions({ width: newWidth + 20 })
    updateSeatsLayout(newWidth / (props.width - 20), 1)
    drawOffice()
  }
}

const handleHeightChange = (event: Event) => {
  const newHeight = Number((event.target as HTMLInputElement).value)
  if (newHeight >= 300) {
    officeHeight.value = newHeight
    canvas.value?.setDimensions({ height: newHeight + 20 })
    updateSeatsLayout(1, newHeight / (props.height - 20))
    drawOffice()
  }
}

const updateSeatsLayout = (scaleX: number, scaleY: number) => {
  seats.value.forEach((seat) => {
    seat.x = Math.round(seat.x * scaleX)
    seat.y = Math.round(seat.y * scaleY)
  })
}

onMounted(() => {
  if (canvasRef.value) {
    canvas.value = new fabric.Canvas(canvasRef.value, {
      width: props.width,
      height: props.height,
      backgroundColor: '#f5f5f5',
    })

    if (props.initialData.length > 0) {
      seats.value = [...props.initialData]
    } else {
      createDefaultLayout()
    }

    drawOffice()

    canvas.value.on('mouse:down', (opt: any) => {
      if (!opt.target) {
        selectedSeat.value = null
        seats.value.forEach((s) => (s.selected = false))
        canvas.value?.renderAll()
      }
    })
  }
})

watch(() => seats.value, drawOffice, { deep: true })
</script>

<style scoped>
.office-editor {
  display: flex;
  gap: 20px;
}

.editor-container {
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.office-canvas {
  background-color: #f5f5f5;
}

.editor-sidebar {
  width: 250px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.size-tip {
  margin-top: 10px;
  color: #666;
  font-size: 0.9em;
  font-style: italic;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
