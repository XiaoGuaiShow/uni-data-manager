class LocalStorageManager {

  constructor() {
  }

  setLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }

  getLocalStorage(key) {
    return localStorage.getItem(key);
  }

  removeLocalStorage(key) {
    localStorage.removeItem(key);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  getLocalStorageInfo() {
    return localStorage;
  }

}

export default LocalStorageManager;