# DataManager Usage Guide

These modules are responsible for managing data within the application. They are all exported through a unified `index.js` file.

## Environment

This library is designed for the uni-app environment. If you want to use it in other environments, you may need to make some modifications. For example, you might need to replace `uni.setStorageSync` with `localStorage.setItem` if you're running in a standard web environment.

## Installing the Modules

You can install the modules in your project like this:

```bash
npm install uni-data-manager
```

## Importing the Modules

You can import the modules in your JavaScript files like this:

```javascript
import DataManager from 'uni-data-manager';
const dataManager = new DataManager();
```

## Using the MemoryManager

The `MemoryManager` module is responsible for managing data within the memory of the application. Here's how you can use its methods:

```javascript
// Set data
dataManager.setMemoryData('key', 'value');

// Get data
let memoryData = dataManager.getMemoryData('key');

// Remove data
dataManager.removeMemoryData('key');

// Clear all data
dataManager.clearMemoryData();

// Get data once and remove it
let onceMemoryData = dataManager.getOnceMemoryData('key');

// Get information about the data
let memoryDataInfo = dataManager.getMemoryDataInfo();
```

## Using the CacheManager

The `CacheManager` module is responsible for managing cache data within the application. Here's how you can use its methods:

```javascript
// Set data
dataManager.setCacheData('key', 'value');

// Get data
let cacheData = dataManager.getCacheData('key');

// Remove data
dataManager.removeCacheData('key');

// Clear all data
dataManager.clearCacheData();

// Get data once and remove it
let onceCacheData = dataManager.getOnceCacheData('key');

// Get information about the data
let cacheDataInfo = dataManager.getCacheDataInfo();
```

### CacheManager Upgrade Instructions

The `CacheManager` module has an automatic upgrade feature. When the size of the cache data exceeds a certain limit (5MB by default), or when a single piece of data is larger than a certain size (1MB by default), the data is automatically upgraded to IndexedDB. This is done to prevent the cache data size from exceeding the limit and causing memory issues. The data that is upgraded to IndexedDB is marked with an `_isUpgrade` property set to `true`.

### CacheManager Fallback Instructions

The `CacheManager` module has a fallback feature for environments where `uni.setStorageSync` is not available. When the CacheManager tries to perform an operation that requires uni.setStorageSync (such as setting, getting, or removing data from the cache), it first checks if uni.setStorageSync is available. If uni.setStorageSync is not available, the CacheManager will automatically fallback to using `localStorage` for these operations.  This means that even in environments where uni.setStorageSync is not supported, the CacheManager can still manage data using localStorage. However, please note that localStorage has a smaller storage limit compared to uni.setStorageSync, so it's recommended to use uni.setStorageSync where possible for larger amounts of data.

## Using the IndexedDBManager

The `IndexedDBManager` module is responsible for managing IndexedDB data within the application. Here's how you can use its methods:

```javascript
// Open the database
dataManager.openDB();

// Close the database
dataManager.closeDB();

// Clear the database
dataManager.clearDB();

// Create an object store
dataManager.createObjectStore('storeName');

// Delete an object store
dataManager.deleteObjectStore('storeName');

// Set data in the database
dataManager.setDBData('storeName', 'key', 'value');

// Get data from the database
let dbData = dataManager.getDBData('storeName', 'key');

// Remove data from the database
dataManager.removeDBData('storeName', 'key');

// Clear data from the database
dataManager.clearDBData('storeName');

// Get information about the data in the database
let dbDataInfo = dataManager.getDBDataInfo('storeName');
```

### IndexedDB Fallback Instructions

The `DataManager` module has a fallback feature for environments where IndexedDB is not available. When the `DataManager` tries to perform an operation that requires IndexedDB (such as setting, getting, or removing data from the database), it first checks if IndexedDB is available. If IndexedDB is not available, the `DataManager` will automatically fallback to using the `CacheManager` for these operations.

This means that even in environments where IndexedDB is not supported, the `DataManager` can still manage data using the cache. However, please note that the cache has a smaller storage limit compared to IndexedDB, so it's recommended to use IndexedDB where possible for larger amounts of data.
