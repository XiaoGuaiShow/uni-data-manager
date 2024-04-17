class IndexedDBManager {
  constructor() {
    this.dbName = 'uni-data-manager';
    this.dbVersion = 1;
    this.db = null;
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (event) => {
        console.error('Failed to open DB:', event.target.error);
        reject(event.target.error);
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onupgradeneeded = async (event) => {
        this.db = event.target.result;
        await this.createObjectStore('globalData');
        resolve(this.db);
      };
    });
  }

  closeDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close();
        this.db = null;
        resolve();
      } else {
        reject('DB is not open.');
      }
    });
  }

  clearDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        const objectStoreNames = this.db.objectStoreNames;
        for (let i = 0; i < objectStoreNames.length; i++) {
          this.db.deleteObjectStore(objectStoreNames[i]);
        }
        resolve();
      } else {
        reject('DB is not open.');
      }
    });
  }

  async createObjectStore(storeName) {
    if (!this.db) {
      await this.openDB();
    }
    return new Promise(async (resolve) => {
      if (this.db.objectStoreNames.contains(storeName)) {
        resolve();
      } else {
        this.db.createObjectStore(storeName);
        resolve();
      }
    });
  }

  async deleteObjectStore(storeName) {
    if (!this.db) {
      await this.openDB();
    }
    return new Promise(async (resolve) => {
      if (this.db.objectStoreNames.contains(storeName)) {
        this.db.deleteObjectStore(storeName);
        resolve();
      } else {
        resolve();
      }
    });
  }

  async setDBData(storeName, key, value) {
    if (!this.db) {
      await this.openDB();
      if (!this.db.objectStoreNames.contains(storeName)) {
        await this.createObjectStore(storeName);
      }
    }
    return new Promise(async (resolve) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.put(value, key);
      resolve();
    });
  }

  async getDBData(storeName, key) {
    if (!this.db) {
      await this.openDB();
      if (!this.db.objectStoreNames.contains(storeName)) {
        await this.createObjectStore(storeName);
      }
    }
    return new Promise(async (resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);
      request.onerror = (event) => {
        reject(event.target.error);
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  async removeDBData(storeName, key) {
    if (!this.db) {
      await this.openDB();
      if (!this.db.objectStoreNames.contains(storeName)) {
        await this.createObjectStore(storeName);
      }
    }
    return new Promise(async (resolve) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.delete(key);
      resolve();
    });
  }

  async clearDBData(storeName) {
    return new Promise(async (resolve, reject) => {
      if (this.db) {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        objectStore.clear();
        resolve();
      } else {
        reject('DB is not open.');
      }
    });
  }

  async getDBDataInfo(storeName) {
    return new Promise(async (resolve, reject) => {
      if (this.db) {
        const transaction = this.db.transaction(storeName, 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onerror = (event) => {
          reject(event.target.error);
        };
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      } else {
        reject('DB is not open.');
      }
    });
  }
}

export default IndexedDBManager;
