import { ref, nextTick, shallowRef, onUnmounted, watch } from 'vue'
import * as fabric from 'fabric'
import { FabricObject, Point } from 'fabric'
import { useFabricStore } from '@/stores/fabric'
import { storeToRefs } from 'pinia'
import { useElementBounding } from '@vueuse/core'
import { LayerCommand } from '@/types/elements'

let canvas: null | fabric.Canvas = null

/** 当前选中的颜色值，用于设置对象的填充色或描边色 */
const currentColor = ref('#797979')

/**
 * 当前选中对象的属性集合，包含位置、尺寸、样式等信息
 * 当选中画布上的对象时会更新这些属性
 */
const selectedObject = ref<any>({
  fill: '#fff', // 填充颜色
  stroke: '#fff', // 描边颜色
})

/**
 * 画布的基本属性配置，包含尺寸和背景色
 * 这些属性可以通过UI进行动态调整
 */
const canvasProperties = ref({
  width: 600, // 画布宽度
  height: 400, // 画布高度
  backgroundColor: '#F2F2F2', // 画布背景色
})

// 初始化控制点样式
const initControlStyle = () => {
  FabricObject.ownDefaults.objectCaching = false
  FabricObject.ownDefaults.borderColor = 'blue'
  FabricObject.ownDefaults.cornerColor = 'white'
  FabricObject.ownDefaults.cornerStrokeColor = '#c0c0c0'
  FabricObject.ownDefaults.borderOpacityWhenMoving = 1
  FabricObject.ownDefaults.borderScaleFactor = 1
  FabricObject.ownDefaults.cornerSize = 8
  FabricObject.ownDefaults.cornerStyle = 'rect'
  FabricObject.ownDefaults.centeredScaling = false
  FabricObject.ownDefaults.centeredRotation = true
  FabricObject.ownDefaults.transparentCorners = false
}

// 设置画布背景
const setPainter = () => {
  const bg = new fabric.Rect({
    name: 'template',
    width: canvasProperties.value.width,
    height: canvasProperties.value.height,
    stroke: 'pink',
    strokeWidth: 2,
    fill: canvasProperties.value.backgroundColor,
    evented: false,
    selectable: false,
  })

  bg.canvas = canvas as fabric.Canvas
  if (canvas) {
    canvas.backgroundImage = bg
  }
}

// 初始化画布
const initCanvas = async () => {
  await nextTick()

  const fabricStore = useFabricStore()
  const { canvasRef } = storeToRefs(fabricStore)

  if (!canvasRef.value) return

  canvas = new fabric.Canvas(canvasRef.value, {
    width: 800,
    height: 600,
    preserveObjectStacking: true, // 保持对象堆叠顺序
  })

  // 监听对象选择事件
  canvas.on('selection:created', handleObjectSelected)
  canvas.on('selection:updated', handleObjectSelected)
  canvas.on('selection:cleared', handleSelectionCleared)
  canvas.on('object:modified', handleObjectModified)

  // 设置画布背景
  setPainter()

  // 设置控制点样式
  initControlStyle()

  // 监听鼠标滚轮事件
  initMouseWheel()

  // 初始化拖拽功能
  initDragCanvas()
}

// 更新视图区长宽
const setCanvasTransform = () => {
  if (!canvas) return
  const fabricStore = useFabricStore()
  const { wrapperRef } = storeToRefs(fabricStore)
  const { width, height } = useElementBounding(wrapperRef.value)
  console.log('width, height', width.value, height.value)
  canvas.setDimensions({ width: width.value, height: height.value })
}

// 初始化编辑器
const initEditor = async () => {
  await initCanvas()

  addTextDemo()

  // const fabricStore = useFabricStore()
  // const { wrapperRef } = storeToRefs(fabricStore)
  // const { width, height } = useElementBounding(wrapperRef.value)
  // watch([width, height], () => {
  //   setCanvasTransform()
  // })
}

// 初始化鼠标滚轮事件
const initMouseWheel = () => {
  if (!canvas) return

  const fabricStore = useFabricStore()
  const { zoom } = storeToRefs(fabricStore)

  canvas.on('mouse:wheel', function (opt) {
    const e = opt.e
    if (e.ctrlKey) {
      // 按住Ctrl键时进行缩放
      const delta = opt.e.deltaY
      let zoomVal = canvas!.getZoom()
      const point = canvas!.getViewportPoint(opt.e)
      zoomVal *= 0.999 ** delta
      zoomVal = Math.min(Math.max(zoomVal, 0.01), 20)
      canvas!.zoomToPoint({ x: point.x, y: point.y } as any, zoomVal)
      // 更新画布尺寸
      canvasProperties.value.width = Math.round(canvas!.getWidth() * zoomVal)
      canvasProperties.value.height = Math.round(canvas!.getHeight() * zoomVal)

      // 更新缩放比例
      zoom.value = zoomVal
    } else if (e.shiftKey) {
      // 按住Shift键时进行水平移动
      const vpt = canvas!.viewportTransform!
      const maxPan = 1000 // 最大平移距离
      const newPosX = vpt[4] - opt.e.deltaY
      vpt[4] = Math.min(Math.max(newPosX, -maxPan), maxPan)
      canvas!.setViewportTransform(vpt)
      canvas!.requestRenderAll()
    } else {
      // 不按任何键时进行上下移动
      const vpt = canvas!.viewportTransform!
      const maxPan = 1000 // 最大平移距离
      const newPosY = vpt[5] - opt.e.deltaY
      vpt[5] = Math.min(Math.max(newPosY, -maxPan), maxPan)
      canvas!.setViewportTransform(vpt)
      canvas!.requestRenderAll()
    }
    opt.e.preventDefault()
    opt.e.stopPropagation()
  })
}

// 初始化画布拖拽功能
const initDragCanvas = () => {
  if (!canvas) return

  let isDragging = false
  let lastPosX = 0
  let lastPosY = 0
  let isSpacePressed = false

  // 监听空格键按下和释放
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpacePressed) {
      isSpacePressed = true
      canvas!.defaultCursor = 'grab'
      if (canvas!.getActiveObject()) {
        canvas!.discardActiveObject()
        canvas!.renderAll()
      }
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isSpacePressed = false
      isDragging = false
      canvas!.defaultCursor = 'default'
    }
  })

  // 监听鼠标事件实现拖拽
  canvas.on('mouse:down', (opt: any) => {
    if (isSpacePressed) {
      isDragging = true
      canvas!.selection = false
      lastPosX = opt.e.clientX
      lastPosY = opt.e.clientY
      canvas!.defaultCursor = 'grabbing'
      opt.e.preventDefault()
    }
  })

  canvas.on('mouse:move', (opt) => {
    if (isDragging) {
      const e: any = opt.e
      const vpt = canvas!.viewportTransform!
      const maxPan = 1000 // 最大平移距离
      const newPosX = e.clientX - lastPosX
      const newPosY = e.clientY - lastPosY

      // 限制平移范围
      vpt[4] = Math.min(Math.max(vpt[4] + newPosX, -maxPan), maxPan)
      vpt[5] = Math.min(Math.max(vpt[5] + newPosY, -maxPan), maxPan)

      canvas!.requestRenderAll()
      lastPosX = e.clientX
      lastPosY = e.clientY
      e.preventDefault()
    }
  })

  canvas.on('mouse:up', () => {
    isDragging = false
    canvas!.selection = true
    if (isSpacePressed) {
      canvas!.defaultCursor = 'grab'
    } else {
      canvas!.defaultCursor = 'default'
    }
  })
}

// 处理对象选中事件
const handleObjectSelected = () => {
  if (!canvas) return

  const activeObject = canvas.getActiveObject() as any

  if (activeObject) {
    selectedObject.value = {
      type: activeObject.type,
      left: activeObject.left,
      top: activeObject.top,
      width: activeObject?.cacheWidth || activeObject.width,
      height: activeObject?.cacheHeight || activeObject.height,
      radius: activeObject.type === 'circle' ? (activeObject as fabric.Circle).radius : undefined,
      name: activeObject.name || '',
      fill: (activeObject.get('fill') as string) || '#000000',
      stroke: (activeObject.get('stroke') as string) || '#000000',
      strokeWidth: activeObject.strokeWidth || 1,
      flipX: activeObject.flipX || false,
      flipY: activeObject.flipY || false,
      angle: activeObject.angle || 0,
    }
  }
}

// 处理取消选中事件
const handleSelectionCleared = () => {
  currentColor.value = '#000000'
  selectedObject.value = null
  // 更新画布属性
  if (canvas) {
    canvasProperties.value = {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: canvas.backgroundColor as string,
    }
  }
}

// 处理对象修改事件
const handleObjectModified = (e: any) => {
  if (!canvas) return
  const modifiedObject = e.target
  if (modifiedObject && selectedObject.value) {
    // 设置统一的边框宽度
    modifiedObject.set('strokeUniform', true)

    // 更新对象属性
    selectedObject.value = {
      ...selectedObject.value,
      left: Math.round(modifiedObject.left),
      top: Math.round(modifiedObject.top),
      width: Math.round(modifiedObject.getScaledWidth()),
      height: Math.round(modifiedObject.getScaledHeight()),
      radius:
        modifiedObject.type === 'circle'
          ? Math.round(modifiedObject.getScaledWidth() / 2)
          : undefined,
      angle: modifiedObject.angle || 0,
      flipX: modifiedObject.flipX || false,
      flipY: modifiedObject.flipY || false,
    }
  }
}

// 初始化模板
const addTextDemo = () => {
  if (!canvas) return

  const textValue = 'codeniu'
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

  // 创建自定义控件并添加到矩形中
  text.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer', // 鼠标移到控件时的指针样式
    mouseUpHandler: () => {
      console.log('deleteControl')
    }, // 鼠标抬起时触发的事件
    render: function (ctx, left, top) {
      const size = 12
      ctx.save()
      ctx.fillStyle = 'pink'
      ctx.translate(left, top)
      ctx.fillRect(-size / 2, -size / 2, size, size)
      ctx.restore()
    },
  })

  canvas.add(text)
  canvas.centerObjectH(text)
}

// 更新画布属性
const updateCanvasProperties = () => {
  if (!canvas) return

  setPainter()
  canvas.renderAll()
}

// 清理事件监听
// onUnmounted(() => {
//   window.removeEventListener('keydown', handleKeyDown)
// })

// 添加键盘事件处理函数
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' && selectedObject.value) {
    deleteSelected()
  }
}

// delete按键删除
window.addEventListener('keydown', handleKeyDown)

// 删除选中的对象
const deleteSelected = () => {
  if (!canvas) return

  const activeObjects = canvas.getActiveObjects()
  canvas.remove(...activeObjects)
  canvas.discardActiveObject()
  canvas.renderAll()
}

// 更新对象颜色
const updateObjectColor = () => {
  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()

  if (activeObject) {
    activeObject.set('fill', selectedObject.value.fill)
    canvas.renderAll()
  }
}

// 更新对象边框颜色
const updateObjectStroke = () => {
  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('stroke', selectedObject.value.stroke)
    canvas.renderAll()
  }
}

// 更新对象名称
const updateObjectName = () => {
  if (!canvas || !selectedObject.value) return
  const activeObject: any = canvas.getActiveObject()
  if (activeObject) {
    activeObject.name = selectedObject.value.name
    canvas.renderAll()
  }
}

// 处理水平翻转
const toggleFlipX = () => {
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
  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('angle', Number(selectedObject.value.angle))
    canvas.renderAll()
  }
}

// 向左旋转45度
const rotateLeft = () => {
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
  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject && activeObject.type === 'circle') {
    activeObject.set('radius', Number(selectedObject.value.radius))
    canvas.renderAll()
  }
}

// 更新对象边框宽度
const updateObjectStrokeWidth = () => {
  if (!canvas || !selectedObject.value) return
  const activeObject = canvas.getActiveObject()
  if (activeObject) {
    activeObject.set('strokeWidth', Number(selectedObject.value.strokeWidth))
    canvas.renderAll()
  }
}

export {
  currentColor,
  selectedObject,
  canvasProperties,
  initEditor,
  updateCanvasProperties,
  deleteSelected,
  updateObjectColor,
  updateObjectStroke,
  updateObjectName,
  toggleFlipX,
  toggleFlipY,
  layerElement,
  updateObjectAngle,
  rotateLeft,
  rotateRight,
  updateObjectSize,
  updateObjectRadius,
  updateObjectStrokeWidth,
}

export default (): [any] => [canvas as any]
