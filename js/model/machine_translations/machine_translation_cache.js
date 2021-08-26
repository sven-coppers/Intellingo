function MachineTranslationCache() {
    this.observers = new ObservableMTCache();

    this.cachedTranslations = {};
}

MachineTranslationCache.prototype = {
    getTranslation: function (segmentIndex) {
        return this.cachedTranslations[segmentIndex];
    },

    setTranslation: function (segmentIndex, machineTranslation) {
        this.cachedTranslations[segmentIndex] = machineTranslation;

        this.observers.machineTranslationUpdated(segmentIndex, machineTranslation);
    },

    isTranslationCached: function (segmentIndex) {
        return typeof this.cachedTranslations[segmentIndex] !== "undefined";
    },

    machineTranslationFailed: function (segmentIndex, errorText) {
        this.observers.machineTranslationFailed(segmentIndex, errorText);
    },

    reset: function() {
        this.cachedTranslations = {};
    }
};
