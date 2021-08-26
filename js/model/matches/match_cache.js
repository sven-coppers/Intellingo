function MatchCache() {
    this.observers = new ObservableTMCache();

    this.cachedMatches = [];
    this.segmentReady = [];

    this.initCache();
}

MatchCache.prototype = {
    initCache: function() {
        for(var i = 0; i < config.max_num_segments; i++) {
            this.cachedMatches.push([]);
            this.segmentReady.push(false);
        }
    },

    /**
     * Give each of the matches a match index
     * @param matches
     */
    initMatchIndexes: function(matches) {
        for(var i = 0; i < matches.length; i++) {
            matches[i].setMatchIndex(i);
        }
    },

    /**
     * Remove all matches for this segment
     * @param segmentIndex
     */
    clearMatches: function (segmentIndex) {
        this.cachedMatches[segmentIndex] = []; // Reset all matches
        this.observers.matchesUpdated(segmentIndex, []);
    },

    /**
     * Add newly found matches to the list
     * @param segmentIndex
     * @param newMatches
     * @param ready indicating if there are more matches to come
     */
    addMatches: function (segmentIndex, newMatches, ready) {
        var combinedMatches = this.cachedMatches[segmentIndex].concat(newMatches);

        this.initMatchIndexes(combinedMatches);

        this.segmentReady[segmentIndex] = ready;
        this.cachedMatches[segmentIndex] = combinedMatches;
        this.observers.matchesUpdated(segmentIndex, combinedMatches);
    },

    matcherFailed: function(segmentIndex, tmName) {
        this.observers.matchesUpdated(segmentIndex, this.cachedMatches[segmentIndex]);
    },

    /**
     * Get the results that were last send to the observers
     * @param segmentIndex
     * @returns {*}
     */
    getMatches: function(segmentIndex) {
        if(typeof this.cachedMatches[segmentIndex] === "undefined") {
            return [];
        } else {
            return this.cachedMatches[segmentIndex];
        }
    },

    getMatch: function (segmentIndex, matchIndex) {
        if(matchIndex < this.cachedMatches[segmentIndex].length && matchIndex >= 0) {
            return this.cachedMatches[segmentIndex][matchIndex];
        } else {
            return null;
        }
    },

    getNumMatches: function (segmentIndex) {
        if(typeof this.cachedMatches[segmentIndex] === "undefined") {
            return 0;
        } else {
            return this.cachedMatches[segmentIndex].length;
        }
    },

    /**
     * Check if all matches are finished for each segment
     * @param segmentIndex
     * @returns {boolean}
     */
    isSegmentFullyMatched: function (segmentIndex) {
        return this.segmentReady[segmentIndex];
    },

    reset: function() {
        this.cachedMatches = [];
        this.segmentReady = [];
    }
};