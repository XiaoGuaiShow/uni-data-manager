import IndexedDBManager from "./indexedDBManager";
import LocalStorageManager from "./localStorageManager";
import mixinClass from './mixinClass';
import { getStringSize } from "./utils";

class CacheManager extends mixinClass(IndexedDBManager, LocalStorageManager) {
  constructor() {
    super();
  }

  async setCacheData(key, value) {
    try {
      const currentDataSizeBytes = getStringSize(JSON.stringify(value));
      if (typeof indexedDB !== 'undefined' && currentDataSizeBytes > this._upgradeDataSizeBytes) {
        await this.setDBData('globalData', key, {...value, _isUpgrade: true});
      } else {
        const { isUpgrade } = this.checkCacheDataSize();
        if (typeof indexedDB !== 'undefined' && isUpgrade) {
          await this.setDBData('globalData', key, {...value, _isUpgrade: true});
          console.error('Cache data size exceeded. Data is automatically upgraded to the indexedDB.');
        } else if (typeof uni !== 'undefined' && typeof uni.setStorageSync === 'function') {
          uni.setStorageSync(key, JSON.stringify(value));
        } else {
          this.setLocalStorage(key, JSON.stringify(value));
        }
      }
    } catch (e) {
      console.error('Failed to set cache data:', e);
    }
  }

  async getCacheData(key) {
    try {
      if (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') {
        const value = uni.getStorageSync(key);
        if (value) {
          return JSON.parse(value);
        }
      }
      if (typeof indexedDB !== 'undefined') {
        const dbData = await this.getDBData('globalData', key)
        if (dbData && dbData._isUpgrade) {
          delete dbData._isUpgrade;
          return dbData;
        }
      }
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(this.getLocalStorage(key)) || {};
      }

      return {};
    } catch (e) {
      console.error('Failed to get cache data:', e);
    }
  }

  getOnceCacheData(key) {
    const value = this.getCacheData(key);
    return this.removeCacheData(key).then(() => {
      return value;
    });
  }

  async removeCacheData(key) {
    try {
      let value = null;
      if (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') {
        value = uni.getStorageSync(key);
        if (value) {
          uni.removeStorageSync(key);
        }
      }
      if (!value) {
        if (typeof indexedDB !== 'undefined') {
          const dbData = await this.getDBData('globalData', key);
          if (dbData && dbData._isUpgrade) {
            await this.removeDBData('globalData', key);
          } else {
            this.removeLocalStorage(key);
          }
        } else {
          this.removeLocalStorage(key);
        }
      }
    } catch (e) {
      console.error('Failed to remove cache data:', e);
    }
  }

  clearCacheData() {
    try {
      if (typeof uni !== 'undefined' && typeof uni.clearStorageSync === 'function') {
        uni.clearStorageSync();
      } else {
        this.clearLocalStorage();
      }
    } catch (e) {
      console.error('Failed to clear cache data:', e);
    }
  }

  getCacheDataInfo() {
    try {
      if (typeof uni !== 'undefined' && typeof uni.getStorageInfoSync === 'function') {
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
      console.error('Failed to get cache data info:', e);
    }
  }

  checkCacheDataSize() {
    try {
      if (typeof uni !== 'undefined' && typeof uni.getStorageInfoSync === 'function') {
        const isApp = uni.getSystemInfoSync().uniPlatform === 'app';
        const keys = uni.getStorageInfoSync().keys;
        const currentCacheSizeBytes = keys.reduce((total, key) => {
          return total + getStringSize(JSON.stringify(uni.getStorageSync(key)));
        }, 0);
        if (isApp) {
          return { isUpgrade: false };
        } else if (currentCacheSizeBytes > this._maxCacheDataSizeBytes) {
          console.error('Cache data size exceeded. Consider removing unused data to free up memory.');
          return { isUpgrade: true };
        }
      }
      const currentLocalStorageSizeBytes = getStringSize(JSON.stringify(this.getLocalStorageInfo()));
      if (currentLocalStorageSizeBytes > this._maxCacheDataSizeBytes) {
        console.error('Cache data size exceeded. Consider removing unused data to free up memory.');
        return { isUpgrade: true };
      }
      return { isUpgrade: false };
    } catch (e) {
      console.error('Failed to check cache data size:', e);
    }
  }
}
CacheManager.prototype._maxCacheDataSizeBytes = 1024 * 1024 * 5; // 5MB
CacheManager.prototype._upgradeDataSizeBytes = 1024 * 1024; // 1MB
export default CacheManager;
