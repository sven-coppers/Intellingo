function MachineTranslation(jsonResponse) {
    this.inputSentence = jsonResponse["input"][0];
    this.targetSentence = jsonResponse["output"][0];
    this.inputTokens = jsonResponse["intok"][0]["tokens"];
    this.targetTokens = jsonResponse["transtok"][0]["tokens"];
    this.score = jsonResponse["scores"][0];
    this.unKnownSourceTokens = jsonResponse["unks"][0]["tokpos"];

    this.sourceTokenRelationships = [];
    this.destTokenRelationships = [];
    this.sourceTokenGroups = [];
    this.destTokenGroups = [];

    this.inputTokenGlobalGroups = []; // Keep track of the alternatives group for every input token
    this.targetTokenGlobalGroups = []; // Keep track of the alternatives group for every target token

    this.inputPretraGroups = [];
    this.targetPreTraGroups = [];

    this.qualityScore = null;

    this.initCorrespondingTokens(jsonResponse["wordaln"][0]["tokpos"]);
    this.initCorrespondingPhrases(jsonResponse["phrasealn"][0]["tokpos"]);
    this.initGlobalGroups();
    this.initPreTraGroups();

    if(startsWithCapital(this.inputSentence)) {
        this.targetTokens[0] = capitalizeFirstLetter(this.targetTokens[0]);
        this.targetSentence = capitalizeFirstLetter(this.targetSentence);
    }

    this.grammarErrors = [];
}

MachineTranslation.prototype = {
    /**
     * Find for every source token what machine translation tokens are relevant, AND VISA VERSA
     */
    initCorrespondingTokens: function(wordaln) {
        for(var i = 0; i < this.inputTokens.length; i++) {
            this.sourceTokenRelationships.push([]);
        }

        for(var i = 0; i < this.targetTokens.length; i++) {
            this.destTokenRelationships.push([]);
        }

        if(wordaln != "null") {
            for(var i = 0; i < wordaln.length; i += 2) {
                var sourceTokenIndex = parseInt(wordaln[i]);
                var destTokenIndex = parseInt(wordaln[i + 1]);

                this.sourceTokenRelationships[sourceTokenIndex].push(destTokenIndex);
                this.destTokenRelationships[destTokenIndex].push(sourceTokenIndex);
            }
        }
    },

    /**
     * Find the phrase for every source and machine translation token
     */
    initCorrespondingPhrases: function(phrasealn) {
        for(var i = 0; i < this.inputTokens.length; i++) {
            this.sourceTokenGroups.push(-1);
        }

        for(var i = 0; i < this.targetTokens.length; i++) {
            this.destTokenGroups.push(-1);
        }

        for(var i = 0; i < phrasealn.length; i += 4) {
            var sourceStart = parseInt(phrasealn[i]);
            var sourceEnd = parseInt(phrasealn[i + 1]);
            var destStart = parseInt(phrasealn[i + 2]);
            var destEnd = parseInt(phrasealn[i + 3]);
            var groupIndex = i / 4;

            for(var j = sourceStart; j <= sourceEnd; j++) {
                this.sourceTokenGroups[j] = groupIndex;
            }

            for(var j = destStart; j <= destEnd; j++) {
                this.destTokenGroups[j] = groupIndex;
            }
        }
    },

    initGlobalGroups: function () {
        this.inputTokenGlobalGroups = [];
        this.targetTokenGlobalGroups = [];

        // Reset global group indexes
        for (var i = 0; i < this.inputTokens.length; i++) {
            this.inputTokenGlobalGroups.push(-1);
        }

        for (var i = 0; i < this.targetTokens.length; i++) {
            this.targetTokenGlobalGroups.push(-1);
        }
    },

    initPreTraGroups: function () {
        this.inputPretraGroups = [];
        this.targetPreTraGroups = [];

        // Reset global group indexes
        for (var i = 0; i < this.inputTokens.length; i++) {
            this.inputPretraGroups.push(-1);
        }

        for (var i = 0; i < this.targetTokens.length; i++) {
            this.targetPreTraGroups.push(-1);
        }
    },

    getPreTraGroupByInputToken: function(inputTokenIndex) {
        return this.inputPretraGroups[inputTokenIndex];
    },

    getPreTraGroupByTargetToken: function(targetTokenIndex) {
        return this.targetPreTraGroups[targetTokenIndex];
    },

    setPreTraGroupForInputToken: function(inputTokenIndex, groupIndex) {
        this.inputPretraGroups[inputTokenIndex] = groupIndex;
    },

    setPreTraGroupForTargetToken: function(targetTokenIndex, groupIndex) {
        this.targetPreTraGroups[targetTokenIndex] = groupIndex;
    },

    getGlobalGroupByInputToken: function(inputTokenIndex) {
        return this.inputTokenGlobalGroups[inputTokenIndex];
    },

    getGlobalGroupByTargetToken: function(targetTokenIndex) {
        return this.targetTokenGlobalGroups[targetTokenIndex];
    },

    setGlobalGroupForInputToken: function(inputTokenIndex, groupIndex) {
        this.inputTokenGlobalGroups[inputTokenIndex] = groupIndex;
    },

    setGlobalGroupForTargetToken: function(targetTokenIndex, groupIndex) {
        this.targetTokenGlobalGroups[targetTokenIndex] = groupIndex;
    },

    getInputTokensInGlobalGroup: function(globalGroupIndex) {
        var result = [];

        for(var i = 0; i < this.inputTokenGlobalGroups.length; i++) {
            if(this.inputTokenGlobalGroups[i] == globalGroupIndex) {
                result.push(i);
            }
        }

        return result;
    },

    getTargetTokensInGlobalGroup: function(globalGroupIndex) {
        var result = [];

        for(var i = 0; i < this.targetTokenGlobalGroups.length; i++) {
            if(this.targetTokenGlobalGroups[i] == globalGroupIndex) {
                result.push(i);
            }
        }

        return result;
    },

    getSourceTokensInGroup: function(groupIndex) {
        var result = [];

        for(var i = 0; i < this.sourceTokenGroups.length; i++) {
            if(this.sourceTokenGroups[i] == groupIndex) {
                result.push(i);
            }
        }

        return result;
    },

    getDestTokensInGroup: function(groupIndex) {
        var result = [];

        for(var i = 0; i < this.destTokenGroups.length; i++) {
            if(this.destTokenGroups[i] == groupIndex) {
                result.push(i);
            }
        }

        return result;
    },

    getGroupIndexOfSourceToken: function(tokenIndex) {
        return this.sourceTokenGroups[tokenIndex];
    },

    getGroupIndexOfDestToken: function(tokenIndex) {
        return this.destTokenGroups[tokenIndex];
    },

    getRelatedSourceTokens: function (destTokenIndex) {
        return this.destTokenRelationships[destTokenIndex];
    },

    getRelatedDestTokens: function (sourceTokenIndex) {
        return this.sourceTokenRelationships[sourceTokenIndex];
    },

    /**
     * Get the precise input TokenIndexes that correspond to the MTTokenIndexes
     * @param MTTokenIndexes
     * @return a list of tokenIndexes in the input
     */
    getInputTokensByMT: function (MTTokenIndexes) {
        var result = [];

        for(var i = 0; i < MTTokenIndexes.length; i++) {
            var correspondingInputTokens = this.getRelatedSourceTokens(MTTokenIndexes[i]);

            result = mergeWithoutDuplicates(result, correspondingInputTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get the precise input TokenIndexes that correspond to the MTTokenIndexes
     * @param segmentIndex
     * @param MTTokenIndexes
     * @return a list of tokenIndexes
     */
    getInputPhraseByMT: function (MTTokenIndexes) {
        var result = [];

        for(var i = 0; i < MTTokenIndexes.length; i++) {
            var intraGroupIndex = this.getGroupIndexOfDestToken(MTTokenIndexes[i]);

            if(intraGroupIndex != -1) {
                var correspondingInputTokens = this.getSourceTokensInGroup(intraGroupIndex);

                result = mergeWithoutDuplicates(result, correspondingInputTokens);
            }
        }

        sort(result);

        return result;
    },

    /**
     * Get the precise input TokenIndexes that correspond to the MTTokenIndexes
     * @param segmentIndex
     * @param MTTokenIndexes
     * @return a list of tokenIndexes
     */
    getInputPhraseByInput: function (inputTokenIndexes) {
        var result = [];

        for(var i = 0; i < inputTokenIndexes.length; i++) {
            var intraGroupIndex = this.getGroupIndexOfSourceToken(inputTokenIndexes[i]);

            if(intraGroupIndex != -1) {
                var correspondingInputTokens = this.getSourceTokensInGroup(intraGroupIndex);

                result = mergeWithoutDuplicates(result, correspondingInputTokens);
            }
        }

        sort(result);

        return result;
    },

    /**
     * Get the precise machine translation TokenIndexes that correspond to the inputTokenIndexes
     * @param segmentIndex
     * @param inputTokenIndexes
     * @return a list of tokenIndexes in the machine translation
     */
    getMTTokensByInput: function (inputTokenIndexes) {
        var result = [];

        for(var i = 0; i < inputTokenIndexes.length; i++) {
            var correspondingInputTokens = this.getRelatedDestTokens(inputTokenIndexes[i]);

            result = mergeWithoutDuplicates(result, correspondingInputTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get the precise input TokenIndexes that correspond to the MTTokenIndexes
     * @param segmentIndex
     * @param MTTokenIndexes
     * @return a list of tokenIndexes
     */
    getMTPhraseByInput: function (inputTokenIndexes) {
        var result = [];

        for(var i = 0; i < inputTokenIndexes.length; i++) {
            var intraGroupIndex = this.getGroupIndexOfSourceToken(inputTokenIndexes[i]);

            if(intraGroupIndex != -1) {
                var correspondingInputTokens = this.getDestTokensInGroup(intraGroupIndex);

                result = mergeWithoutDuplicates(result, correspondingInputTokens);
            }
        }

        sort(result);

        return result;
    },

    getGrammarErrors: function() {

    }
};
