/**
 * Local Match constructor
 * @param relatedSegment Uses a relatedSegment to build a match
 */
function LocalMatch(relatedSegment, testSegment) {
    var equal = relatedSegment.source === testSegment.source;

    this.inputTokens = splitSentenceInTokens(testSegment["source"]);
    this.inputSentence = testSegment["source"];
    this.replacedTokens = relatedSegment["replaced_tokens"];
    this.segmentIndex = relatedSegment["segment_id"] - 1;
    this.inputSentence = relatedSegment["source"];
    this.targetSentence = relatedSegment["target"];
    this.inputTokens = splitSentenceInTokens(relatedSegment["source"]);
    this.targetTokens = splitSentenceInTokens(relatedSegment["target"]);
    this.origin = MATCH_ORIGIN_LOCAL;
    this.score = (equal)? 100 : 25; // equal = 100%, not equal = 50%
    this.user = relatedSegment["translator"];
    this.initGlobalAlignment();
    this.initPreTraAlignment();
}

LocalMatch.prototype = new Match();
LocalMatch.prototype.extendPrototype({
    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMSourceTokens: function (TMSourceTokenIndexes) {
        return [];
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMTargetTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMTargetTokens: function (TMTargetTokenIndexes) {
        return [];
    },

    /**
     * Get TM Source Phrases, given TM target tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMTargetPhrase: function (TMTargetTokenIndexes) {
        return [];
    },

    /**
     * Get TM Target Phrases, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMSourcePhrase: function (TMSourceTokenIndexes) {
        return [];
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getInputPhraseByTMSource: function (TMSourceTokenIndexes) {
        if(this.score == 100) {
            return createArray(this.inputTokens.length);
        } else {
            return [];
        }
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhrasesByInput: function (inputTokenIndexes) {
        if(this.score == 100) {
            return createArray(this.inputTokens.length);
        } else {
            return [];
        }
    }
});