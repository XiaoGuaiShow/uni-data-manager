import MemoryManager from './memoryManager';
import CacheManager from './cacheManager';

const mixinClass = (base, ...mixins) => {
  class baseWithMixins extends base {
    constructor(...args) {
      super(...args);
      mixins.forEach((mixin) => {
        mixin.prototype.initializer.call(this);
      });
    }
  }

  for (const mixin of mixins) {
    for (const prop in mixin.prototype) {
      if (prop !== 'initializer') {
        baseWithMixins.prototype[prop] = mixin.prototype[prop];
      }
    }
  }

  return baseWithMixins;
}


class DataManager extends mixinClass(MemoryManager, CacheManager) {
  constructor() {
    super();
  }
}

const dataManager = new DataManager();
export default dataManager;