<template>
  <div class="fabric-demo-view">
    <h1>Fabric.js 示例</h1>
    <p class="description">
      这是一个简单的 Fabric.js
      示例，展示了基本的图形操作功能。你可以创建、移动、缩放、旋转和删除各种图形。
    </p>
    <FabricDemo />
  </div>
</template>

<script setup lang="ts">
import FabricDemo from '@/components/FabricDemo/FabricDemo.vue'
</script>

<style scoped>
.fabric-demo-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.description {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}
</style>
