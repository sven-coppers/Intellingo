function ObservableFilter() {
    this.observers = [];
}

ObservableFilter.prototype = {
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
     * Observer: visible difficulty has changed
     */
    difficultyChanged: function () {
        for(var observerIndex in this.observers) {
            this.observers[observerIndex].difficultyChanged();
        }
    },

    /**
     * Observer: visible phases have changed
     */
    phaseChanged: function () {
        for(var observerIndex in this.observers) {
            this.observers[observerIndex].phaseChanged();
        }
    },

    /**
     * Observer: visible users have changed
     */
    userChanged: function() {
        for(var observerIndex in this.observers) {
            this.observers[observerIndex].userChanged();
        }
    },

    /**
     * Observer: visible users have changed
     */
    relatedChanged: function() {
        for(var observerIndex in this.observers) {
            this.observers[observerIndex].relatedChanged();
        }
    }
};
