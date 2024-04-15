import IndexedDBManager from "./indexedDBManager";
class CacheManager extends IndexedDBManager {
  constructor() {
    super();
    this._maxCacheDataSizeBytes = 1024 * 1024 * 5; // 5MB
    this._upgradeDataSizeBytes = 1024 * 1024; // 1MB
  }

  async setCacheData(key, value) {
    try {
      const currentDataSizeBytes = new TextEncoder().encode(JSON.stringify(value)).length;
      if (uni.canIUse('indexedDB') && currentDataSizeBytes > this._upgradeDataSizeBytes) {
        await this.setDBData('globalData', key, {...value, _isUpgrade: true});
      } else {
        const { isUpgrade } = this.checkCacheDataSize();
        if (uni.canIUse('indexedDB') && isUpgrade) {
          await this.setDBData('globalData', key, {...value, _isUpgrade: true});
          console.error('Cache data size exceeded. Data is automatically upgraded to the indexedDB.');
        } else {
          uni.setStorageSync(key, JSON.stringify(value));
        }
      }
    } catch (e) {
      console.error('Failed to set cache data:', e);
    }
  }

  async getCacheData(key) {
    try {
      const value = uni.getStorageSync(key);
      if (value) {
        return JSON.parse(value);
      } else if (uni.canIUse('indexedDB')) {
        const dbData = await this.getDBData('globalData', key);
        if (dbData && dbData._isUpgrade) {
          delete dbData._isUpgrade;
          return dbData;
        }
      }
    } catch (e) {
      console.error('Failed to get cache data:', e);
    }
  }

  async getOnceCacheData(key) {
    const value = this.getCacheData(key);
    await this.removeCacheData(key);
    return value;
  }

  async removeCacheData(key) {
    try {
      const value = uni.getStorageSync(key);
      if (value) {
        uni.removeStorageSync(key);
      } else if (uni.canIUse('indexedDB')) {
        const dbData = await this.getDBData('globalData', key);
        if (dbData && dbData._isUpgrade) {
          await this.removeDBData('globalData', key);
        }
      }
    } catch (e) {
      console.error('Failed to remove cache data:', e);
    }
  }

  clearCacheData() {
    try {
      uni.clearStorageSync();
      if (uni.canIUse('indexedDB')) {
        // TODO 删除DB里所有_isUpgrade为true的数据
      }
    } catch (e) {
      console.error('Failed to clear cache data:', e);
    }
  }

  getCacheDataInfo() {
    try {
      const keys = uni.getStorageInfoSync().keys;
      const cacheData = {};
      keys.forEach((key) => {
        cacheData[key] = this.getCacheData(key);
      });
      return cacheData;
    } catch (e) {
      console.error('Failed to get cache data info:', e);
    }
  }

  checkCacheDataSize() {
    try {
      const isApp = uni.getSystemInfoSync().uniPlatform === 'app';
      const keys = uni.getStorageInfoSync().keys;
      const currentCacheSizeBytes = keys.reduce((total, key) => {
        return total + new TextEncoder().encode(uni.getStorageSync(key)).length;
      }, 0);
      if (!isApp && currentCacheSizeBytes > this._maxCacheDataSizeBytes) {
        console.error('Cache data size exceeded. Consider removing unused data to free up memory.');
        return { isUpgrade: true };
      }
      return { isUpgrade: false };
    } catch (e) {
      console.error('Failed to check cache data size:', e);
    }
  }
}

export default CacheManager;
