function ObservableTranslationTools() {
    this.observers = [];
}

ObservableTranslationTools.prototype = {
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
     * The translation tools has been loaded
     */
    translationToolsLoaded: function() {
        for(var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].translationToolsLoaded === "function") {
                this.observers[observerIndex].translationToolsLoaded();
            }
        }
    }
};
