function ObservableContextGlossary() {
    this.observers = [];
}

ObservableContextGlossary.prototype = {
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
     * Observer: the alternative terms for this segment have changed
     */
    contextGlossaryUpdated: function(segmentIndex, newContextGlossary) {
        for(var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].contextGlossaryUpdated === "function") {
                this.observers[observerIndex].contextGlossaryUpdated(segmentIndex, newContextGlossary);
            }
        }
    }
};