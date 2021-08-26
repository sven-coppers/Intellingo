function ObservableTMCache() {
    this.observers = [];
}

ObservableTMCache.prototype = {
    register: function(newObserver) {
        this.observers.push(newObserver);
    },

    unregister: function(oldObserver) {
        this.observers = this.observers.filter(
            function(item) {
                if (item !== oldObserver) {
                    return item;
                }
            }
        );
    },

    /**
     * Observer: the fuzzy matches have updated
     */
    matchesUpdated: function (segmentIndex, matches) {
        for(var observerIndex in this.observers) {
            this.observers[observerIndex].matchesUpdated(segmentIndex, matches);
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