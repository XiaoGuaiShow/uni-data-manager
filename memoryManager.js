class MemoryManager {
  constructor() {
    this.memoryData = {};
    this.maxMemoryDataSizeBytes = 1024 * 1024 * 10; // 10MB
  }

  setMemoryData(key, value) {
    this.checkMemoryDataSize();
    this.memoryData[key] = value;
  }

  getMemoryData(key) {
    return this.memoryData[key];
  }

  removeMemoryData(key) {
    delete this.memoryData[key];
  }

  clearMemoryData() {
    this.memoryData = {};
  }

  getOnceMemoryData(key) {
    const value = this.getMemoryData(key);
    this.removeMemoryData(key);
    return value;
  }

  getMemoryDataInfo() {
    return this.memoryData;
  }

  checkMemoryDataSize() {
    const currentCacheSizeBytes = new TextEncoder().encode(JSON.stringify(this.memoryData)).length;
    if (currentCacheSizeBytes > this.maxMemoryDataSizeBytes) {
      console.error('Memory data size exceeded. Consider removing unused data to free up memory.');
    }
  }
}

export default MemoryManager;
