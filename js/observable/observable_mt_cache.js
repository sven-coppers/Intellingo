function ObservableMTCache() {
    this.observers = [];
}

ObservableMTCache.prototype = {
    register: function (newObserver) {
        this.observers.push(newObserver);
    },

    unregister: function (oldObserver) {
        this.observers = this.observers.filter(
            function (item) {
                if (item !== oldObserver) {
                    return item;
                }
            }
        );
    },

    /**
     * Observer: visible difficulty has changed
     */
    machineTranslationFailed: function (segmentIndex) {
        for (var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].machineTranslationFailed === "function") {
                this.observers[observerIndex].machineTranslationFailed(segmentIndex);
            }
        }
    },

    /**
     * Observer: visible difficulty has changed
     */
    machineTranslationUpdated: function (segmentIndex, machineTranslation) {
        for (var observerIndex in this.observers) {
            this.observers[observerIndex].machineTranslationUpdated(segmentIndex, machineTranslation);
        }
    },

    /**
     * Observer: the quality cache has updated
     */
    qualityUpdated: function (segmentIndex) {
        for (var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].qualityUpdated === "function") {
                this.observers[observerIndex].qualityUpdated(segmentIndex);
            }
        }
    }
};