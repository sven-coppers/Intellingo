/* Local matches can be updated all the time */
function LocalMatcher(matcher, translationTools){
    this.matcher = matcher;

    this.progress = translationTools.getProgressData();

    this.cache = {};
}

LocalMatcher.prototype = {
    /**
     * Load the matches
     * matchesUpdated() will be called on all observers with the results
     */
    loadMatches: function(segmentIndex) {
        if(this.cache[segmentIndex] == null) {
            this.cache[segmentIndex] = this.match(segmentIndex);
        }

        this.matcher.matcherCompleted(segmentIndex, this.cache[segmentIndex], "local");
    },

    match: function(segmentIndex) {
        var localMatches = [];

        var thisSegment = this.progress.getSegment(segmentIndex);
        var relatedIDs = this.progress.getRelatedTasks(segmentIndex);

        for(var i = 0; i < relatedIDs.length; i++) {
            var relatedID = relatedIDs[i];
            var relatedSegment = this.progress.getSegmentByID(relatedID);

            if(relatedSegment != null) {
                if(relatedSegment["target"].length > 0) {
                    localMatches.push(new LocalMatch(relatedSegment, thisSegment));
                }
            }
        }

        return localMatches;
    }
};

