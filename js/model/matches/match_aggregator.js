var MATCH_ORIGIN_LOCAL = "local";
var MATCH_ORIGIN_SHAREDSUBPARTS = "sharedsubparts";
var MATCH_ORIGIN_LEVENSHTEIN = "levenshtein";

/* External matches are cached (always the same), local matches are refreshed all the time (can be updated) */
function MatchAggregator(translationTools){
    this.matchersFinshed = []; // Count the number of matchers that are finished, for each segment

    this.initCache();
    this.initMatchers(translationTools);

    this.TMCache = translationTools.getTMCache();
}

MatchAggregator.prototype = {
    initCache: function() {
        for(var i = 0; i < config.max_num_segments; i++) {
            this.matchersFinshed.push(0);
        }
    },

    /**
     * Init all matchers
     * @param translationTools
     */
    initMatchers: function(translationTools) {
        this.matchers = [];

        if(config.match_local) {
            this.matchers.push(new LocalMatcher(this, translationTools));
        }

        for(var i = 0; i < config.match_tm_names.length; i++) {
            var tmName = config.match_tm_names[i];
            this.matchers.push(new TranslationMemory(this, tmName));
        }
    },

    /**
     * Load the matches
     * matchesUpdated() will be called on all observers with the results
     */
    loadMatches: function(segmentIndex) {
        if (this.TMCache.isSegmentFullyMatched(segmentIndex)) {
            // Do nothing
        } else {
            this.TMCache.clearMatches(segmentIndex);
            this.matchersFinshed[segmentIndex] = 0;

            for(var i = 0; i < this.matchers.length; i++) {
                this.matchers[i].loadMatches(segmentIndex);
            }
        }
    },

    /**
     * One of the matchers has found new matches
     * @param segmentIndex
     * @param newMatches
     * @param tmName
     */
    matcherCompleted: function(segmentIndex, newMatches, tmName) {
        this.matchersFinshed[segmentIndex]++;

        var ready = this.matchersFinshed[segmentIndex] >= this.matchers.length;

        logger.log(newMatches.length + " new matches found in '" + tmName + "' matcher", segmentIndex);

        this.TMCache.addMatches(segmentIndex, newMatches, ready);
    },

    matcherFailed: function(segmentIndex, tmName) {
        this.matchersFinshed[segmentIndex]++;

        logger.log("Matcher failed: '" + tmName + "'", segmentIndex);

        this.TMCache.matcherFailed(segmentIndex);
    }
};