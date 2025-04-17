// 办公区域数据服务
import { ref, reactive } from 'vue';

// 使用响应式状态管理办公区域数据
const officeData = reactive({
  seats: [],
  loading: false,
  error: null
});

// 模拟API调用获取数据
const fetchOfficeData = async () => {
  officeData.loading = true;
  officeData.error = null;
  
  try {
    // 在实际应用中，这里应该是API调用
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟从服务器获取的数据
    const data = [
      // 这里可以放入初始数据，或者从后端获取
    ];
    
    officeData.seats = data;
    return data;
  } catch (error) {
    officeData.error = '获取办公区域数据失败';
    console.error('获取办公区域数据失败:', error);
    return [];
  } finally {
    officeData.loading = false;
  }
};

// 更新工位数据
const updateSeatData = async (updatedSeats) => {
  officeData.loading = true;
  
  try {
    // 在实际应用中，这里应该是API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 更新本地状态
    officeData.seats = [...updatedSeats];
    return true;
  } catch (error) {
    officeData.error = '更新工位数据失败';
    console.error('更新工位数据失败:', error);
    return false;
  } finally {
    officeData.loading = false;
  }
};

// 获取单个工位数据
const getSeatById = (seatId) => {
  return officeData.seats.find(seat => seat.id === seatId);
};

export default {
  officeData,
  fetchOfficeData,
  updateSeatData,
  getSeatById
};