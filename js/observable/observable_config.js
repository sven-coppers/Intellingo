function ObservableConfig() {
    this.observers = [];
}

ObservableConfig.prototype = {
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
     * The configuration has been changed
     */
    configurationChanged: function() {
        for(var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].configurationChanged === "function") {
                this.observers[observerIndex].configurationChanged();
            }
        }
    }
};