class IndexedDBManager {
  constructor() {
    this.dbName = 'uni-data-manager';
    this.dbVersion = 1;
    this.db = null;
  }

  async openDB() {
    if (this.db) return this.db; // 如果数据库已打开，直接返回
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.db.onversionchange = () => {
          console.warn('Database version has changed. Closing DB.');
          this.closeDB();
        };
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Failed to open DB:', event.target.error);
        resolve(null); // 避免阻塞操作
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        if (!this.db.objectStoreNames.contains('globalData')) {
          this.db.createObjectStore('globalData'); // 初始化对象存储
        }
        resolve(this.db);
      };
    });
  }

  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async ensureDBReady() {
    if (!this.db) await this.openDB();
    if (!this.db) throw new Error('Database connection is not available.');
  }

  async createObjectStore(storeName) {
    if (!this.db) await this.openDB();
    if (this.db && !this.db.objectStoreNames.contains(storeName)) {
      await this.closeDB(); // 必须关闭连接以进行版本升级
      return new Promise((resolve) => {
        const request = indexedDB.open(this.dbName, this.db.version + 1);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore(storeName);
        };
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error creating object store "${storeName}":`, event.target.error);
          resolve();
        };
      });
    }
  }

  async setDBData(storeName, key, value) {
    try {
      await this.ensureDBReady();
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.put(value, key);
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        console.warn('Database connection was closed. Reopening...');
        await this.openDB(); // 重新打开连接
        return this.setDBData(storeName, key, value); // 重试操作
      }
      console.error('Failed to set data:', error);
    }
  }

  async getDBData(storeName, key) {
    try {
      await this.ensureDBReady();
      const transaction = this.db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = objectStore.get(key);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
          console.error('Failed to get data:', event.target.error);
          resolve(null); // 返回空值而不是阻塞
        };
      });
    } catch (error) {
      console.error('Failed to get data:', error);
      return null;
    }
  }

  async removeDBData(storeName, key) {
    try {
      await this.ensureDBReady();
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.delete(key);
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        console.warn('Database connection was closed. Reopening...');
        await this.openDB();
        return this.removeDBData(storeName, key); // 重试操作
      }
      console.error('Failed to remove data:', error);
    }
  }

  async clearDBData(storeName) {
    try {
      await this.ensureDBReady();
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.clear();
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        console.warn('Database connection was closed. Reopening...');
        await this.openDB();
        return this.clearDBData(storeName); // 重试操作
      }
      console.error('Failed to clear data:', error);
    }
  }

  async getDBDataInfo(storeName) {
    try {
      await this.ensureDBReady();
      const transaction = this.db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
          console.error('Failed to get all data:', event.target.error);
          resolve([]); // 返回空数组而不是阻塞
        };
      });
    } catch (error) {
      console.error('Failed to get data info:', error);
      return [];
    }
  }

  async clearDB() {
    if (!this.db) await this.openDB();
    if (this.db) {
      const transaction = this.db.transaction(this.db.objectStoreNames, 'readwrite');
      transaction.oncomplete = () => console.log('All stores cleared.');
      Array.from(this.db.objectStoreNames).forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });
    }
  }
}

export default IndexedDBManager;
