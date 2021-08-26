/**
 * Keep track of where an alternative came from
 */
function TMOccurrence(match, tokenIndexes, inputTokenIndexes) {
    this.match = match;
    this.tokenIndexes = tokenIndexes;
    this.type = OCCURRENCE_TYPE_TM;
    this.relevantInputTokenIndexes = inputTokenIndexes;
}

TMOccurrence.prototype = new Occurrence();
TMOccurrence.prototype.extendPrototype({
    /**
     * Get the indexes of the input tokens that are relevant to this occurrence
     * @returns {Array}
     */
    getRelevantInputTokenIndexes: function () {
        return this.relevantInputTokenIndexes;
    },

    isPreTrans: function () {
        for(var i = 0; i < this.tokenIndexes.length; i++) {
            if(this.match.targetPreTraGroups[this.tokenIndexes[i]] >= 0) {
                return true;
            }
        }

        return false;
    },

    /**
     * Return a string to represent this object
     */
    toString: function () {
        return "occurred in match " + this.match.matchIndex + " (" + this.tokenIndexes + ")";
    }
});