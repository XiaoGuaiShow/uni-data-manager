class IndexedDBManager {
  constructor() {
    this.dbName = 'ceekeeDB';
    this.dbVersion = 1;
    this.db = null;
  }

  async openDB() {
    if (this.db) {
      return this.db;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = (event) => {
        console.error('Failed to open DB:', event.target.error);
        reject(event.target.error);
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.createObjectStore('globalData');
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
    });
  }

  async closeDB() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close();
        resolve();
      } else {
        reject('DB is not open.');
      }
    });
  }

  async clearDB() {
    return new Promise(async (resolve, reject) => {
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
    await this.openDB();
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
    await this.openDB();
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
    await this.openDB();
    return new Promise(async (resolve) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.put(value, key);
      resolve();
    });
  }

  async getDBData(storeName, key) {
    await this.openDB();
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
    await this.openDB();
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
