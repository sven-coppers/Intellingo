function Match() {
    this.tmid = -1;
    this.segmentIndex = -1;
    this.inputSentence = null;
    this.sourceSentence = null;
    this.targetSentence = null;
    this.inputTokens = [];
    this.sourceTokens = [];
    this.targetTokens = [];
    this.origin = null;
    this.score = 0;
    this.user = -1;
    this.matchIndex = -1;
    this.sourceTokenGlobalGroups = []; // For every source token, keep track of it's alternativesGroupIndex
    this.targetTokenGlobalGroups = []; // For every target token, keep track of it's alternativesGroupIndex
    this.sourcePretraGroups = [];
    this.targetPreTraGroups = [];
    this.grammarErrors = [];

    this.qualityScore = null;
}

Match.prototype = {
    /**
     * Allow this class to be extended
     * @param obj
     */
    extendPrototype: function(obj){
        for(var p in obj)this[p] = obj[p];
    },

    setMatchIndex: function(matchIndex) {
        this.matchIndex = matchIndex;
    },

    initGlobalAlignment: function () {
        this.sourceTokenGlobalGroups = [];
        this.targetTokenGlobalGroups = [];

        for (var i = 0; i < this.sourceTokens.length; i++) {
            this.sourceTokenGlobalGroups.push(-1);
        }

        for (var i = 0; i < this.targetTokens.length; i++) {
            this.targetTokenGlobalGroups.push(-1);
        }
    },

    initPreTraAlignment: function () {
        this.sourcePretraGroups = [];
        this.targetPreTraGroups = [];

        for (var i = 0; i < this.sourceTokens.length; i++) {
            this.sourcePretraGroups.push(-1);
        }

        for (var i = 0; i < this.targetTokens.length; i++) {
            this.targetPreTraGroups.push(-1);
        }
    },

    getGlobalGroupBySourceToken: function(sourceTokenIndex) {
        return this.sourceTokenGlobalGroups[sourceTokenIndex];
    },

    getGlobalGroupByTargetToken: function(targetTokenIndex) {
        return this.targetTokenGlobalGroups[targetTokenIndex];
    },

    setGlobalGroupForSourceToken: function(sourceTokenIndex, groupIndex) {
        this.sourceTokenGlobalGroups[sourceTokenIndex] = groupIndex;
    },

    setGlobalGroupForTargetToken: function(targetTokenIndex, groupIndex) {
        this.targetTokenGlobalGroups[targetTokenIndex] = groupIndex;
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMSourceTokens: function (TMSourceTokenIndexes) {
        console.log("getTMSourcePhraseByTMSourceTokens not implemented for " + this.origin);
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMTargetTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMTargetTokens: function (TMTargetTokenIndexes) {
        console.log("getTMTargetPhraseByTMTargetTokens not implemented for " + this.origin);
    },

    /**
     * Get TM Source Phrases, given TM target tokens

     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMTargetPhrase: function (TMTargetTokenIndexes) {
        console.log("getTMSourcePhraseByTMTargetPhrase not implemented for " + this.origin);
    },

    /**
     * Get TM Target Phrases, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMSourcePhrase: function (TMSourceTokenIndexes) {
        console.log("getTMTargetPhraseByTMSourcePhrase not implemented for " + this.origin);
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getInputPhraseByTMSource: function (TMSourceTokenIndexes) {
        console.log("getInputPhraseByTMSource not implemented for " + this.origin);
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhrasesByInput: function (inputTokenIndexes) {
        console.log("getTMSourcePhrasesByInput not implemented for " + this.origin);
    },

    /**
     * Return if this match is used in the hybrid translation
     * @returns {boolean}
     */
    isUsedInHybridTranslation: function() {
        for(var i = 0; i < this.targetPreTraGroups.length; i++) {
            if(this.targetPreTraGroups[i] > -1) {
                return true;
            }
        }

        return false;
    },

    setPreTraGroupForSourceToken: function(inputTokenIndex, groupIndex) {
        this.sourcePretraGroups[inputTokenIndex] = groupIndex;
    },

    setPreTraGroupForTargetToken: function(targetTokenIndex, groupIndex) {
        this.targetPreTraGroups[targetTokenIndex] = groupIndex;
    },

    getPreTraGroupForSourceToken: function(inputTokenIndex) {
        return this.sourcePretraGroups[inputTokenIndex];
    },

    getPreTraGroupForTargetToken: function(targetTokenIndex) {
        return this.targetPreTraGroups[targetTokenIndex] ;
    }
};