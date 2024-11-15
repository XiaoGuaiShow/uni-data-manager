import IndexedDBManager from "./indexedDBManager";
import LocalStorageManager from "./localStorageManager";
import mixinClass from './mixinClass';
import { getStringSize } from "./utils";

class CacheManager extends mixinClass(IndexedDBManager, LocalStorageManager) {
  constructor() {
    super();
    this._maxCacheDataSizeBytes = 1024 * 1024 * 5; // 5MB
    this._upgradeDataSizeBytes = 1024 * 1024; // 1MB
  }

  // 环境检测工具函数
  _isUniApp() {
    return typeof uni !== 'undefined';
  }

  _isIndexedDBSupported() {
    return typeof indexedDB !== 'undefined';
  }

  async setCacheData(key, value) {
    try {
      const dataSize = getStringSize(JSON.stringify(value));

      // 优先判断是否需要升级存储
      if (this._isIndexedDBSupported() && dataSize > this._upgradeDataSizeBytes) {
        await this.setDBData('globalData', key, { ...value, _isUpgrade: true });
        return;
      }

      // 检查当前存储是否需要升级
      const { isUpgrade } = this.checkCacheDataSize();
      if (isUpgrade && this._isIndexedDBSupported()) {
        await this.setDBData('globalData', key, { ...value, _isUpgrade: true });
        console.warn('Cache size exceeded. Data upgraded to IndexedDB.');
        return;
      }

      // 存储到本地
      const storageValue = JSON.stringify(value);
      if (this._isUniApp()) {
        uni.setStorageSync(key, storageValue);
      } else {
        this.setLocalStorage(key, storageValue);
      }
    } catch (e) {
      this._handleError('setCacheData', e);
    }
  }

  async getCacheData(key) {
    try {
      if (this._isUniApp()) {
        const value = uni.getStorageSync(key);
        if (value) return JSON.parse(value);
      }

      if (this._isIndexedDBSupported()) {
        const dbData = await this.getDBData('globalData', key);
        if (dbData && dbData._isUpgrade) {
          delete dbData._isUpgrade;
          return dbData;
        }
      }

      const localData = this.getLocalStorage(key);
      return localData ? JSON.parse(localData) : {};
    } catch (e) {
      this._handleError('getCacheData', e);
      return {};
    }
  }

  async removeCacheData(key) {
    try {
      if (this._isUniApp()) {
        uni.removeStorageSync(key);
      } else if (this._isIndexedDBSupported()) {
        await this.removeDBData('globalData', key);
      } else {
        this.removeLocalStorage(key);
      }
    } catch (e) {
      this._handleError('removeCacheData', e);
    }
  }

  clearCacheData() {
    try {
      if (this._isUniApp()) {
        uni.clearStorageSync();
      } else {
        this.clearLocalStorage();
      }
    } catch (e) {
      this._handleError('clearCacheData', e);
    }
  }

  getCacheDataInfo() {
    try {
      if (this._isUniApp()) {
        const keys = uni.getStorageInfoSync().keys;
        const cacheData = {};
        keys.forEach((key) => {
          cacheData[key] = this.getCacheData(key);
        });
        return cacheData;
      } else {
        return this.getLocalStorageInfo();
      }
    } catch (e) {
      this._handleError('getCacheDataInfo', e);
      return {};
    }
  }

  checkCacheDataSize() {
    try {
      const isApp = this._isUniApp() && uni.getSystemInfoSync().uniPlatform === 'app';
      let totalSize = 0;

      if (this._isUniApp()) {
        const keys = uni.getStorageInfoSync().keys;
        totalSize = keys.reduce((sum, key) => {
          const value = uni.getStorageSync(key);
          return sum + getStringSize(JSON.stringify(value));
        }, 0);
      } else {
        const localData = this.getLocalStorageInfo();
        totalSize = getStringSize(JSON.stringify(localData));
      }

      if (isApp || totalSize <= this._maxCacheDataSizeBytes) {
        return { isUpgrade: false };
      } else {
        console.warn('Cache data size exceeded maximum limit.');
        return { isUpgrade: true };
      }
    } catch (e) {
      this._handleError('checkCacheDataSize', e);
      return { isUpgrade: false };
    }
  }

  // 统一错误处理
  _handleError(method, error) {
    console.error(`CacheManager ${method} failed:`, error);
  }
}

export default CacheManager;
