<template>
  <div class="particle-container">
    <div ref="sceneContainer" class="scene"></div>
    <div class="controls">
      <button @click="toggleGravity" :class="{ active: isAntigravity }">
        {{ isAntigravity ? 'Disable Antigravity' : 'Enable Antigravity' }}
      </button>
      <button @click="resetScene">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Matter from 'matter-js'

const sceneContainer = ref<HTMLElement | null>(null)
const isAntigravity = ref(false)

// Matter.js module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint

let engine: Matter.Engine
let render: Matter.Render
let runner: Matter.Runner

const containerWidth = 800
const containerHeight = 600

const initScene = () => {
  if (!sceneContainer.value) return

  // Create engine
  engine = Engine.create()

  // Create renderer
  render = Render.create({
    element: sceneContainer.value,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      wireframes: false,
      background: '#0f0f13', // Dark premium background
      pixelRatio: window.devicePixelRatio,
    },
  })

  // Create falling objects (particles/shapes)
  const particles: Matter.Body[] = []
  const particleCount = 100
  const colors = ['#FF4D4D', '#1A73E8', '#34A853', '#FBBC05', '#A142F4', '#24C1E0'] // Google-ish vibrant colors

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * containerWidth
    const y = Math.random() * containerHeight // Start inside screen
    const size = 15 + Math.random() * 30
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Mix of shapes
    let body: Matter.Body
    const shapeType = Math.random()

    if (shapeType < 0.33) {
      body = Bodies.circle(x, y, size / 2, {
        render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 0 },
        restitution: 0.9,
      })
    } else if (shapeType < 0.66) {
      body = Bodies.rectangle(x, y, size, size, {
        render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 0 },
        restitution: 0.9,
      })
    } else {
      body = Bodies.polygon(x, y, Math.floor(Math.random() * 5) + 3, size / 2, {
        render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 0 },
        restitution: 0.9,
      })
    }

    particles.push(body)
  }

  // Walls
  const wallOptions = {
    isStatic: true,
    render: { visible: false },
  }
  const ground = Bodies.rectangle(
    containerWidth / 2,
    containerHeight + 50,
    containerWidth,
    100,
    wallOptions,
  )
  const leftWall = Bodies.rectangle(-50, containerHeight / 2, 100, containerHeight * 2, wallOptions)
  const rightWall = Bodies.rectangle(
    containerWidth + 50,
    containerHeight / 2,
    100,
    containerHeight * 2,
    wallOptions,
  )
  const ceiling = Bodies.rectangle(containerWidth / 2, -50, containerWidth, 100, wallOptions) // Ceiling at top

  Composite.add(engine.world, [...particles, ground, leftWall, rightWall, ceiling])

  // Mouse control
  const mouse = Mouse.create(render.canvas)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  })

  Composite.add(engine.world, mouseConstraint)

  // Keep the mouse in sync with rendering
  render.mouse = mouse

  // Run the renderer
  Render.run(render)

  // Create runner
  runner = Runner.create()
  Runner.run(runner, engine)

  // Handle resize
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  if (!render) return
  render.canvas.width = containerWidth
  render.canvas.height = containerHeight
  // Re-position walls not implemented for simplicity, but could be added
}

const toggleGravity = () => {
  isAntigravity.value = !isAntigravity.value
  if (isAntigravity.value) {
    engine.gravity.y = -1 // Reverse gravity
  } else {
    engine.gravity.y = 1 // Normal gravity
  }
}

const resetScene = () => {
  // Simple reload for now, or clear world and easier Re-init
  location.reload()
}

onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  if (render) {
    Render.stop(render)
    if (render.canvas) render.canvas.remove()
  }
  if (runner) {
    Runner.stop(runner)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.particle-container {
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;
  background: red;
}

.scene {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

button.active {
  background: rgba(66, 133, 244, 0.6);
  border-color: #4285f4;
}
</style>
