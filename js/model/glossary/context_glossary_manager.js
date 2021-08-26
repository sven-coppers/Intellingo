function ContextGlossaryManager(translationTools) {
    this.contextGlossaryCache = {};

    this.observers = new ObservableContextGlossary();

    this.contextGlossaryBuilder = new ContextGlossaryBuilder(translationTools);
}

ContextGlossaryManager.prototype = {
    /**
     * Observers will be notified with the result
     */
    updateContextGlossary: function(segmentIndex) {
        var newContextGlossary = this.contextGlossaryBuilder.buildContextGlossary(segmentIndex);

        if(newContextGlossary != null) {
            this.contextGlossaryCache[segmentIndex] = newContextGlossary;
            this.observers.contextGlossaryUpdated(segmentIndex, newContextGlossary);
        }
    },

    getCachedContextGlossary: function (segmentIndex) {
        return this.contextGlossaryCache[segmentIndex];
    }
};