<template>
  <div class="office-editor-view">
    <h1>办公区域编辑器</h1>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="editor-wrapper">
      <OfficeEditor 
        :width="900" 
        :height="600" 
        :initialData="seats"
        @update:seats="handleSeatsUpdate"
      />
      
      <div class="status-panel">
        <h3>工位状态统计</h3>
        <div class="status-item">
          <div class="status-color" style="background-color: #4CAF50;"></div>
          <span>空闲: {{ getStatusCount('available') }}</span>
        </div>
        <div class="status-item">
          <div class="status-color" style="background-color: #FF9800;"></div>
          <span>已占用: {{ getStatusCount('occupied') }}</span>
        </div>
        <div class="status-item">
          <div class="status-color" style="background-color: #2196F3;"></div>
          <span>已预订: {{ getStatusCount('reserved') }}</span>
        </div>
        <div class="status-item">
          <div class="status-color" style="background-color: #F44336;"></div>
          <span>维护中: {{ getStatusCount('maintenance') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OfficeEditor from '@/components/OfficeEditor/OfficeEditor.vue';
import officeDataService from '@/services/officeDataService';

export default {
  name: 'OfficeEditorView',
  components: {
    OfficeEditor
  },
  data() {
    return {
      seats: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      this.loading = true;
      const data = await officeDataService.fetchOfficeData();
      this.seats = data;
    } catch (error) {
      this.error = '加载办公区域数据失败';
      console.error(error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async handleSeatsUpdate(updatedSeats) {
      try {
        this.loading = true;
        const success = await officeDataService.updateSeatData(updatedSeats);
        if (success) {
          this.seats = [...updatedSeats];
          this.$message.success('工位数据更新成功');
        }
      } catch (error) {
        this.error = '更新工位数据失败';
        this.$message.error('更新工位数据失败');
      } finally {
        this.loading = false;
      }
    },
    getStatusCount(status) {
      return this.seats.filter(seat => seat.status === status).length;
    }
  }
}
</script>

<style scoped>
.office-editor-view {
  padding: 20px;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #f44336;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-panel {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>