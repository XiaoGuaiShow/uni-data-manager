import {getStringSize} from "./utils";

class MemoryManager {
  constructor() {
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
    const currentCacheSizeBytes = getStringSize(JSON.stringify(this.memoryData));
    if (currentCacheSizeBytes > this._maxMemoryDataSizeBytes) {
      console.error('Memory data size exceeded. Consider removing unused data to free up memory.');
    }
  }
}
MemoryManager.prototype.memoryData = {};
MemoryManager.prototype._maxMemoryDataSizeBytes = 1024 * 1024 * 10; // 10MB
export default MemoryManager;
