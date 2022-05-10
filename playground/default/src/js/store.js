export const Store = class extends EventTarget {
  constructor(localStorageKey) {
    super();
    this.localStorageKey = localStorageKey;
    this._readStorage();
    // handle if data is edited in another window
    window.addEventListener(
      'storage',
      () => {
        this._readStorage();
        this._save();
      },
      false
    );
  }
  _readStorage() {
    this.data = JSON.parse(
      window.localStorage.getItem(this.localStorageKey) || '[]'
    );
  }
  _save() {
    window.localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.data)
    );
    this.dispatchEvent(new CustomEvent('save'));
  }
  // GETTER methods
  // MUTATE methods
};
