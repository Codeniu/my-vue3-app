<template>
  <div>
    <h1>新浦大厦19层1908号</h1>
  </div>
  <OfficeViewer>
    <template #right>
      <div>
        <template v-if="isActiveing">
          <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
            <h3>工位基本信息</h3>
            <FormItem label="工位编号">
              <span>
                {{ selectedObject.number }}
              </span>
            </FormItem>

            <FormItem label="工位属性">
              <Select
                ref="select"
                v-model:value="selectedObject.sideType"
                style="width: 100%"
                :options="[
                  {
                    value: '临时工位',
                    label: '临时工位',
                  },
                  {
                    value: '测试工位',
                    label: '测试工位',
                  },
                ]"
              ></Select>
            </FormItem>

            <FormItem label="使用人员">
              <Input v-model:value="selectedObject.name" @input="updateObjectName" />
            </FormItem>

            <h3>工位审批信息</h3>

            <h3>历史使用情况</h3>

            <div style="width: 400px; height: 300px; overflow: auto">
              {{ selectedObject.name }}
            </div>
          </Form>
        </template>

        <template v-else>
          <div>
            <h3>工位总数量16个，空闲7个，使用中7个</h3>

            <h3>工位申请信息：待审批2条，已审批20条</h3>
          </div>
        </template>
      </div>
    </template>
  </OfficeViewer>
</template>

<script setup lang="ts">
import { nextTick, onMounted, computed } from 'vue'
import type { FabricObject } from 'fabric'
import { Form, FormItem, Input, Select } from 'ant-design-vue'

import OfficeViewer from '@/components/OfficeEditor/computer-viewer.vue'
import { deskGroup } from '@/components/OfficeEditor/CanvasLeft/templates'

import useCanvas, {
  setCanvasTransform,
  selectedObject,
  updateObjectName,
} from '@/components/OfficeEditor/hooks/useCanvas'

// 获取对象类型的中文描述
// const getObjectType = (type: string) => {
//   const typeMap: Record<string, string> = {
//     rect: '矩形',
//     circle: '圆形',
//     triangle: '三角形',
//     iText: '文本',
//   }
//   return typeMap[type] || type
// }

// 计算当前是否选中元素
const isActiveing = computed(() => selectedObject.value)

// 初始化模板
const addTemplate = async () => {
  const [canvas] = useCanvas()
  if (!canvas) return

  await canvas.loadFromJSON(deskGroup)

  // 遍历所有对象并锁定移动
  canvas.getObjects().forEach((obj: FabricObject) => {
    obj.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    })

    if (obj?.name) {
      console.log(obj.name)
    }
  })
  canvas.renderAll()
  setCanvasTransform()
}

onMounted(async () => {
  await nextTick()

  addTemplate()
})
</script>
