function ObservableProgress() {
    this.observers = [];
}

ObservableProgress.prototype = {
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
     * The segment with this index has changed
     * @param segmentIndex
     */
    segmentChanged: function(segmentIndex) {
        for(var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].segmentChanged === "function") {
                this.observers[observerIndex].segmentChanged(segmentIndex);
            }
        }
    },

    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        for (var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].selectionChanged === "function") {
                this.observers[observerIndex].selectionChanged(newSegmentIndex, oldSegmentIndex);
            }
        }
    },

    /**
     * Observer: The preview changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    previewChanged: function(newSegmentIndex, oldSegmentIndex) {
        for(var observerIndex in this.observers) {
            if (typeof this.observers[observerIndex].previewChanged === "function") {
                this.observers[observerIndex].previewChanged(newSegmentIndex, oldSegmentIndex);
            }
        }
    }
};
