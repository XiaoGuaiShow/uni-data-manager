import MemoryManager from './memoryManager';
import CacheManager from './cacheManager';

export const mixinClass = (base, ...mixins) => {
  class baseWithMixins extends base {
    constructor(...args) {
      super(...args);
      mixins.forEach((mixin) => {
        if (mixin.prototype.initializer) {
          mixin.prototype.initializer.call(this);
        }
      });
    }
  }

  for (const mixin of mixins) {
    let prototype = mixin.prototype;
    while (prototype) {
      const mixinPrototype = Object.getOwnPropertyDescriptors(prototype);
      Object.defineProperties(baseWithMixins.prototype, mixinPrototype);
      prototype = Object.getPrototypeOf(prototype);
    }
  }

  return baseWithMixins;
}



class DataManager extends mixinClass(MemoryManager, CacheManager) {
  constructor() {
    super();
  }

  async openDB() {
    if (typeof indexedDB !== 'undefined') {
      return super.openDB();
    } else {
      // CacheManager doesn't have an openDB method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  async closeDB() {
    if (typeof indexedDB !== 'undefined') {
      return super.closeDB();
    } else {
      // CacheManager doesn't have a closeDB method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  async clearDB() {
    if (typeof indexedDB !== 'undefined') {
      return super.clearDB();
    } else {
      // CacheManager doesn't have a closeDB method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  async createObjectStore(storeName) {
    if (typeof indexedDB !== 'undefined') {
      return super.createObjectStore(storeName);
    } else {
      // CacheManager doesn't have a createObjectStore method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  async deleteObjectStore(storeName) {
    if (typeof indexedDB !== 'undefined') {
      return super.deleteObjectStore(storeName);
    } else {
      // CacheManager doesn't have a deleteObjectStore method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  setDBData(storeName, key, value) {
    if (typeof indexedDB !== 'undefined') {
      return super.setDBData(storeName, key, value);
    } else {
      return this.setCacheData(key, value);
    }
  }

  getDBData(storeName, key) {
    if (typeof indexedDB !== 'undefined') {
      return super.getDBData(storeName, key);
    } else {
      return this.getCacheData(key);
    }
  }

  async removeDBData(storeName, key) {
    if (typeof indexedDB !== 'undefined') {
      return super.removeDBData(storeName, key);
    } else {
      return this.removeCacheData(key);
    }
  }

  async clearDBData(storeName) {
    if (typeof indexedDB !== 'undefined') {
      return super.clearDBData(storeName);
    } else {
      // CacheManager doesn't have a closeDB method, so do nothing or implement a corresponding method in CacheManager
    }
  }

  async getDBDataInfo(storeName) {
    if (typeof indexedDB !== 'undefined') {
      return super.getDBDataInfo(storeName);
    } else {
      // CacheManager doesn't have a closeDB method, so do nothing or implement a corresponding method in CacheManager
    }
  }
}

export default DataManager;