/**
 * Constructor for matches found using levenshtein
 * @param jsonMatch Uses a jsonmatch from the fuzzy matcher to build a match
 */
function LevenshteinMatch(jsonMatch, inputSentence, inputTokens) {
    this.tmid = jsonMatch["tmid"];
    this.replacedTokens = [];
    this.inputSentence = inputSentence;
    this.inputTokens = inputTokens;
    this.sourceSentence = jsonMatch["tmnontoksrcsent"];
    this.targetSentence = jsonMatch["tmnontoktrgsent"];
    this.sourceTokens = jsonMatch["tmtoksrcsent"];
    this.targetTokens = jsonMatch["tmtrgaln"];
    this.origin = MATCH_ORIGIN_LEVENSHTEIN;
    this.score = jsonMatch["score"] * 100;
    this.initInterAlignment(jsonMatch["monoaln"]);
    this.initIntraAlignment(jsonMatch["bialn"]);
    this.initGlobalAlignment();
    this.initPreTraAlignment();
    this.qualityScore = null;
}

LevenshteinMatch.prototype = new Match();
LevenshteinMatch.prototype.extendPrototype({
    initIntraAlignment: function(jsonMatches) {
        this.intraSourceTokenRelationships = [];
        this.intraTargetTokenRelationships = [];

        for(var i = 0; i < this.sourceTokens.length; i++) {
            this.intraSourceTokenRelationships.push([]);
        }

        for(var i = 0; i < this.targetTokens.length; i++) {
            this.intraTargetTokenRelationships.push([]);
        }

        for(var i = 0; i < jsonMatches.length; i += 3) {
            var sourceTokenIndex = parseInt(jsonMatches[i]["spans"][0]);
            var targetTokenIndex = parseInt(jsonMatches[i + 1]["spans"][0]);
            var tmMatchScore = jsonMatches[i + 2];

            this.intraSourceTokenRelationships[sourceTokenIndex].push(targetTokenIndex);
            this.intraTargetTokenRelationships[targetTokenIndex].push(sourceTokenIndex);
        }
    },

    initInterAlignment: function(jsonMatches) {
        this.interInputTokenGroups = [];
        this.interSourceTokenGroups = [];
        var newGroupIndex = 0;

        for(var i = 0; i < this.inputTokens.length; i++) {
            this.interInputTokenGroups.push(-1);
        }

        for(var i = 0; i < this.sourceTokens.length; i++) {
            this.interSourceTokenGroups.push(-1);
        }

        // For every group of matching nodes
        for(var i = 0; i < jsonMatches.length; i+= 3) {
            var inputStart = parseInt(jsonMatches[i]["spans"][0]);
            var inputEnd = parseInt(jsonMatches[i]["spans"][1]);
            var sourceStart = parseInt(jsonMatches[i + 1]["spans"][0]);
            var sourceEnd = parseInt(jsonMatches[i + 1]["spans"][1]);

            if(inputEnd - inputStart != sourceEnd - sourceStart) {
                logger.log("Niet evenveel tokens in monoaln");
            } else {
                var numTokens = inputEnd - inputStart;

                for(var j = 0; j <= numTokens; j++) {
                    this.interInputTokenGroups[inputStart + j] = newGroupIndex;
                    this.interSourceTokenGroups[sourceStart + j] = newGroupIndex;
                    newGroupIndex++;
                }
            }
        }
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMSourceTokens: function (TMSourceTokenIndexes) {
        return TMSourceTokenIndexes;
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMTargetTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMTargetTokens: function (TMTargetTokenIndexes) {
        return TMTargetTokenIndexes;
    },

    /**
     * Get TM Source Phrases, given TM target tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMTargetPhrase: function (TMTargetTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMTargetTokenIndexes.length; i++) {
            var intraSourceTokens = this.intraTargetTokenRelationships[TMTargetTokenIndexes[i]];

            result = mergeWithoutDuplicates(result, intraSourceTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get TM Target Phrases, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMSourcePhrase: function (TMSourceTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMSourceTokenIndexes.length; i++) {
            var intraSourceTokens = this.intraSourceTokenRelationships[TMSourceTokenIndexes[i]];

            result = mergeWithoutDuplicates(result, intraSourceTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getInputPhraseByTMSource: function (TMSourceTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMSourceTokenIndexes.length; i++) {
            var interGroupIndexToFind = this.interSourceTokenGroups[TMSourceTokenIndexes[i]];

            if(interGroupIndexToFind != -1 ) {
                for (var j = 0; j < this.interInputTokenGroups.length; j++) {
                    var interGroupIndexFound = this.interInputTokenGroups[j];

                    if (interGroupIndexToFind == interGroupIndexFound) {
                        result = mergeWithoutDuplicates(result, [j]);
                    }
                }
            }
        }

        sort(result);

        return result;
    },

    /**
     * Get input phrase, given TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhrasesByInput: function (inputTokenIndexes) {
        var result = [];

        for(var i = 0; i < inputTokenIndexes.length; i++) {
            var interGroupIndexToFind = this.interInputTokenGroups[inputTokenIndexes[i]];

            if(interGroupIndexToFind != -1 ) {
                for(var j = 0; j < this.interSourceTokenGroups.length; j++) {
                    var interGroupIndexFound = this.interSourceTokenGroups[j];

                    if(interGroupIndexToFind == interGroupIndexFound ) {
                        result = mergeWithoutDuplicates(result, [j]);
                    }
                }
            }
        }

        sort(result);

        return result;
    }
});