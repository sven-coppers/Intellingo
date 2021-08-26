/**
 * This class can generate a list of synonyms for each input token
 */
function ContextGlossaryBuilder(translationTools) {
    this.TB = translationTools.getTermBase();

    this.MTCache = translationTools.getMTCache();
    this.TMCache = translationTools.getTMCache();
    this.progress = translationTools.getProgressData();
}

ContextGlossaryBuilder.prototype = {
    /**
     * Build a new context glossary for this segment
     * @param segmentIndex
     * @returns {ContextGlossary}
     * @post globalgroup will be set for all tokens in the machine translation and matches
     */
    buildContextGlossary: function(segmentIndex) {
        this.newAlternativeGroupIndex = 0;
        var glossary = new ContextGlossary();

        this.resetGlobalGroups(segmentIndex);
        this.gatherCorrespondingTerms(segmentIndex, glossary);
        this.gatherRemainingMTTerms(segmentIndex, glossary);
        this.gatherRemainingTMTerms(segmentIndex, glossary);

        return glossary;
    },

    resetGlobalGroups: function (segmentIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);

        if(translation != null) {
            translation.initGlobalGroups();
        }

        for(var i = 0; i < matches.length; i++) {
            matches[i].initGlobalAlignment();
        }
    },

    /**
     * Gather all tokens that correspond with each other (TM, MT and TB)
     * @param segmentIndex
     */
    gatherCorrespondingTerms: function(segmentIndex, glossary) {
        var translation = this.MTCache.getTranslation(segmentIndex);

        if(translation != null) {
            var numInputTokens = translation.inputTokens.length;
            var remainingTokenIndexes = createArray(numInputTokens);

            while(remainingTokenIndexes.length > 0) {
                var currentTokenIndex = remainingTokenIndexes[0];
                var relevantTokenIndexes = this.growInputTokenIndexes(segmentIndex, [currentTokenIndex]);// Init with the singleton
                this.buildCorrespondingGroup(segmentIndex, glossary, this.newAlternativeGroupIndex, relevantTokenIndexes);
                this.newAlternativeGroupIndex++;

                for(var i = 0; i < relevantTokenIndexes.length; i++) {
                    removeFromArray(relevantTokenIndexes[i], remainingTokenIndexes);
                }
            }
        }
    },

    /**
     * Find MT tokens that are not aligned, and their synonyms
     * @param segmentIndex
     * @param glossary
     */
    gatherRemainingMTTerms: function (segmentIndex, glossary) {
        var translation = this.MTCache.getTranslation(segmentIndex);

        if(translation != null) {
            var remainingTargetTokensIndexes = this.getRemainingMTTokenIndexes(translation);

            while(remainingTargetTokensIndexes.length > 0) {
                var currentTokenIndex = remainingTargetTokensIndexes[0];
                var relevantTargetTokenIndexes = this.growMTTargetTokenIndexes(translation, [currentTokenIndex]);// Init with the singleton
                var relevantTargetTokens = resolveTokens(relevantTargetTokenIndexes, translation.targetTokens);
                var relevantSourceTokenIndexes = translation.getInputTokensByMT(relevantTargetTokenIndexes);

                var term = glossary.getTerm(relevantTargetTokens, this.newAlternativeGroupIndex);

                term.addOccurrence(new MTOccurrence(relevantTargetTokenIndexes, []));

                // TODO
                this.findTBAlternatives(glossary, this.newAlternativeGroupIndex, translation.inputTokens, relevantSourceTokenIndexes);

                for(var j = 0; j < relevantTargetTokenIndexes.length; j++) {
                    removeFromArray(relevantTargetTokenIndexes[j], remainingTargetTokensIndexes);
                }

                for(var j = 0; j < relevantTargetTokenIndexes.length; j++) {
                    translation.setGlobalGroupForTargetToken(relevantTargetTokenIndexes[j], this.newAlternativeGroupIndex);
                }

                for(var j = 0; j < relevantSourceTokenIndexes.length; j++) {
                    translation.setGlobalGroupForSourceToken(relevantSourceTokenIndexes[j], this.newAlternativeGroupIndex);
                }

                this.newAlternativeGroupIndex++;
            }
        }
    },

    /**
     * Gather the remaining tokens from TM (light gray) and TB
     * @param segmentIndex
     */
    gatherRemainingTMTerms: function (segmentIndex, glossary) {
        var matches = this.TMCache.getMatches(segmentIndex);

        for(var i = 0; i < matches.length; i++) {
            if(config.synonym_tm_metrics[matches[i].origin]) {
                var remainingTMTargetTokenIndexes = this.getRemainingTMTargetTokenIndexes(matches[i]);

                while(remainingTMTargetTokenIndexes.length > 0) {
                    var currentTokenIndex = remainingTMTargetTokenIndexes[0];
                    var relevantTargetTokenIndexes = this.growTMTargetTokenIndexes(matches[i], [currentTokenIndex]);// Init with the singleton
                    var relevantTargetTokens = resolveTokens(relevantTargetTokenIndexes, matches[i].targetTokens);
                    var relevantSourceTokenIndexes = matches[i].getTMSourcePhraseByTMTargetPhrase(relevantTargetTokenIndexes);
                    var term = glossary.getTerm(relevantTargetTokens, this.newAlternativeGroupIndex);

                    term.addOccurrence(new TMOccurrence(matches[i], relevantTargetTokenIndexes, []));

                    // TODO
                    this.findTBAlternatives(glossary, this.newAlternativeGroupIndex, matches[i].sourceTokens, relevantSourceTokenIndexes);

                    for(var j = 0; j < relevantTargetTokenIndexes.length; j++) {
                        removeFromArray(relevantTargetTokenIndexes[j], remainingTMTargetTokenIndexes);
                    }

                    for(var j = 0; j < relevantTargetTokenIndexes.length; j++) {
                        matches[i].setGlobalGroupForTargetToken(relevantTargetTokenIndexes[j], this.newAlternativeGroupIndex);
                    }

                    for(var j = 0; j < relevantSourceTokenIndexes.length; j++) {
                        matches[i].setGlobalGroupForSourceToken(relevantSourceTokenIndexes[j], this.newAlternativeGroupIndex);
                    }

                    this.newAlternativeGroupIndex++;
                }
            }
        }
    },

    /**
     * Find the inputTokenIndexes that are required to find the relevant translations
     * @param segmentIndex
     * @param inputTokenIndexes
     * @returns {Array} a larger set of inputTokenIndexes
     */
    growInputTokenIndexes: function (segmentIndex, inputTokenIndexes) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);
        var newInputTokenIndexes = [];

        // Grow from MT
        if(translation != null) {
            var potentialMTTokenIndexes = translation.getMTTokensByInput(inputTokenIndexes);
            var requiredInputTokenIndexes = translation.getInputTokensByMT(potentialMTTokenIndexes);
            newInputTokenIndexes = mergeWithoutDuplicates(inputTokenIndexes, requiredInputTokenIndexes);
        }

        // Grow from TM
        for(var i = 0; i < matches.length; i++) {
            if(config.synonym_tm_metrics[matches[i].origin]) {
                var potentialTMSourceTokenIndexes = matches[i].getTMSourcePhrasesByInput(newInputTokenIndexes);
                var requiredTMSourceTokenIndexes = this.growTMSourceTokenIndexes(matches[i], potentialTMSourceTokenIndexes);
                var requiredTMInputTokenIndexes = matches[i].getInputPhraseByTMSource(requiredTMSourceTokenIndexes);
                newInputTokenIndexes = mergeWithoutDuplicates(newInputTokenIndexes, requiredTMInputTokenIndexes);
            }
        }

        // We have grown, so we might need more in a future iteration
        if(newInputTokenIndexes.length != inputTokenIndexes.length) {
            newInputTokenIndexes = this.growInputTokenIndexes(segmentIndex, newInputTokenIndexes);
        }

        return newInputTokenIndexes;
    },

    growTMSourceTokenIndexes: function (match, potentialTMSourceTokenIndexes) {
        var potentialTMTargetTokenIndexes = match.getTMTargetPhraseByTMSourcePhrase(potentialTMSourceTokenIndexes);
        var requiredTMSourceTokenIndexes = match.getTMSourcePhraseByTMTargetPhrase(potentialTMTargetTokenIndexes);

        return mergeWithoutDuplicates(requiredTMSourceTokenIndexes, potentialTMSourceTokenIndexes);
    },

    growTMTargetTokenIndexes: function (match, potentialTMTargetTokenIndexes) {
        var potentialTMSourceTokenIndexes = match.getTMSourcePhraseByTMTargetPhrase(potentialTMTargetTokenIndexes);
        var requiredTMTargetTokenIndexes = match.getTMTargetPhraseByTMSourcePhrase(potentialTMSourceTokenIndexes);

        return mergeWithoutDuplicates(requiredTMTargetTokenIndexes, potentialTMTargetTokenIndexes);
    },
    
    growMTTargetTokenIndexes: function (translation, potentialMTTargetTokenIndexes) {
        var potentialMTSourceTokenIndexes = translation.getInputTokensByMT(potentialMTTargetTokenIndexes);
        var requiredMTTargetTokenIndexes = translation.getMTTokensByInput(potentialMTSourceTokenIndexes);

        return mergeWithoutDuplicates(requiredMTTargetTokenIndexes, potentialMTTargetTokenIndexes);
    },

    /**
     * Get all TM Source tokens that do not yet belong in a group
     * @param match
     */
    getRemainingTMSourceTokenIndexes: function(match) {
        var sourceTokenGlobalGroups = match.sourceTokenGlobalGroups;
        var result = [];

        for(var i = 0; i < sourceTokenGlobalGroups.length; i++) {
            if(sourceTokenGlobalGroups[i] == -1) {
                result.push(i);
            }
        }

        return result;
    },

    /**
     * Get all TM target tokens that do not yet belong in a group
     * @param match
     */
    getRemainingTMTargetTokenIndexes: function(match) {
        var targetTokenGlobalGroups = match.targetTokenGlobalGroups;
        var result = [];

        for(var i = 0; i < targetTokenGlobalGroups.length; i++) {
            if(targetTokenGlobalGroups[i] == -1) {
                result.push(i);
            }
        }

        return result;
    },

    getRemainingMTTokenIndexes: function (translation) {
        var targetTokenGlobalGroups = translation.targetTokenGlobalGroups;
        var result = [];

        for(var i = 0; i < targetTokenGlobalGroups.length; i++) {
            if(targetTokenGlobalGroups[i] == -1) {
                result.push(i);
            }
        }

        return result;
    },

    /**
     * Create all terms that correspond in the same group
     * @param segmentIndex
     * @param glossary
     * @param alternativeGroupIndex
     * @param inputTokenIndexes
     * @returns {*}
     */
    buildCorrespondingGroup: function (segmentIndex, glossary, alternativeGroupIndex, inputTokenIndexes) {
        if(inputTokenIndexes.length == 0) return;

        var translation = this.MTCache.getTranslation(segmentIndex);

        // TODO
        this.findTBAlternatives(glossary, alternativeGroupIndex, translation.inputTokens, inputTokenIndexes);
        this.findMTAlternatives(glossary, alternativeGroupIndex, segmentIndex, inputTokenIndexes);
        this.findTMAlternatives(glossary, alternativeGroupIndex, segmentIndex, inputTokenIndexes);
    },

    /**
     * Find alternatives in Term Base
     * @param alternativesList
     * @param inputTokens
     */
    // NEW
    //findTBAlternatives: function (glossary, alternativeGroupIndex, allInputTokens, usedInputTokenIndexes) {
    // OLD
    //findTBAlternatives: function (glossary, alternativeGroupIndex, inputTokens) {

    findTBAlternatives: function (glossary, alternativeGroupIndex, allTokens, usedTokenIndexes) {
        var translations = this.TB.translate(allTokens, usedTokenIndexes); //["term": score, ...]

        for(var translation in translations) {
            var translationTokens = splitSentenceInTokens(translation);
            var term = glossary.getTerm(translationTokens, alternativeGroupIndex);

            term.setTermBaseScore(translations[translation]);
        }
    },

    /**
     * Find alternatives in Translation Memory
     * @param alternativesList
     * @param inputTokens
     */
    findTMAlternatives: function (glossary, alternativeGroupIndex, segmentIndex, inputTokenIndexes) {
        var matches = this.TMCache.getMatches(segmentIndex);
        var results = [];

        for(var i = 0; i < matches.length; i++) {
            if(config.synonym_tm_metrics[matches[i].origin]) {
                var TMSourcePhrase = matches[i].getTMSourcePhrasesByInput(inputTokenIndexes);
                var TMTargetPhrase = matches[i].getTMTargetPhraseByTMSourcePhrase(TMSourcePhrase);

                if(TMTargetPhrase.length > 0) {
                    var destTokens = resolveTokens(TMTargetPhrase, matches[i].targetTokens);
                    var term = glossary.getTerm(destTokens, alternativeGroupIndex);

                    term.addOccurrence(new TMOccurrence(matches[i], TMTargetPhrase, inputTokenIndexes));

                    for(var j = 0; j < TMTargetPhrase.length; j++) {
                        matches[i].setGlobalGroupForTargetToken(TMTargetPhrase[j], alternativeGroupIndex);
                    }

                    for(var j = 0; j < TMSourcePhrase.length; j++) {
                        matches[i].setGlobalGroupForSourceToken(TMSourcePhrase[j], alternativeGroupIndex);
                    }
                }
            }
        }

        return results;
    },

    /**
     * Find alternatives in Machine Translation
     * @param alternativesList
     * @param inputTokens
     */
    findMTAlternatives: function (glossary, alternativeGroupIndex, segmentIndex, inputTokenIndexes) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var destTokenIndexes = translation.getMTTokensByInput(inputTokenIndexes);

        if(destTokenIndexes.length > 0) {
            var destTokens = resolveTokens(destTokenIndexes, translation.targetTokens);
            var term = glossary.getTerm(destTokens, alternativeGroupIndex);

            term.addOccurrence(new MTOccurrence(destTokenIndexes, inputTokenIndexes));

            for(var j = 0; j < destTokenIndexes.length; j++) {
                translation.setGlobalGroupForTargetToken(destTokenIndexes[j], alternativeGroupIndex);
            }

            for(var j = 0; j < inputTokenIndexes.length; j++) {
                translation.setGlobalGroupForInputToken(inputTokenIndexes[j], alternativeGroupIndex);
            }
        }
    }
};