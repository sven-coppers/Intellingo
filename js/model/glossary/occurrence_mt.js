/**
 * Keep track of where an alternative came from
 */
function MTOccurrence(tokenIndexes, relevantInputTokens) {
    this.tokenIndexes = tokenIndexes;
    this.type = OCCURRENCE_TYPE_MT;
    this.relevantInputTokenIndexes = relevantInputTokens;
}

MTOccurrence.prototype = new Occurrence();
MTOccurrence.prototype.extendPrototype({
    /**
     * Get the indexes of the input tokens that are relevant to this occurrence
     * @returns {Array}
     */
    getRelevantInputTokenIndexes: function () {
        return this.relevantInputTokenIndexes;
    },

    getRelativeIndexOfToken: function (tokenIndex) {
        for(var i = 0; i < this.tokenIndexes.length; i++) {
            if(this.tokenIndex[i] == tokenIndex) {
                return i;
            }
        }

        return -1;
    },

    /**
     * Return a string to represent this object
     */
    toString: function () {
        return "occurred in MT (" + this.tokenIndexes + ")";
    }
});
