const mixinClass = (base, ...mixins) => {
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

export default mixinClass