function HighlightController(translationTools) {
    this.MTCache = translationTools.getMTCache();
    this.TMCache = translationTools.getTMCache();
    this.glossaryManager = translationTools.getContextGlossaryManager();

    this.highlighting = new HighLighting(this, translationTools);
}

HighlightController.prototype = {
    removeHighlights: function(segmentIndex) {
        this.highlighting.removeHighlights(segmentIndex);
    },

    highlightGlobalGroup: function (segmentIndex, globalGroupIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

        if(glossary == null) return;

        var terms = glossary.getTermsInGroup(globalGroupIndex);
        var inputTokenIndexes = translation.getInputTokensInGlobalGroup(globalGroupIndex);

        this.highlighting.highlightInputTokens(segmentIndex, inputTokenIndexes);
        this.highlightTerms(segmentIndex, terms, globalGroupIndex);
    },

    highlightTerms: function(segmentIndex, terms) {
        for(var i = 0; i < terms.length; i++) {
            var occurrences = terms[i].occurrences;

            for(var j = 0; j < occurrences.length; j++) {
                if(occurrences[j].type == OCCURRENCE_TYPE_MT) {
                    this.highlighting.highlightMTTargetTokens(segmentIndex, occurrences[j].tokenIndexes);
                } else if(occurrences[j].type == OCCURRENCE_TYPE_TM) {
                    this.highlightMatchByTargetTokens(segmentIndex, occurrences[j].tokenIndexes, occurrences[j].match.matchIndex);
                }
            }
        }
    },

    focusTerm: function(segmentIndex, term) {
        if(term == null) return;
        var occurrences = term.occurrences;

        for(var j = 0; j < occurrences.length; j++) {
            if(occurrences[j].type == OCCURRENCE_TYPE_MT) {
                this.highlighting.focusMTTargetTokens(segmentIndex, occurrences[j].tokenIndexes);
            } else if(occurrences[j].type == OCCURRENCE_TYPE_TM) {
                this.highlighting.focusTMTargetTokens(segmentIndex, occurrences[j].match.matchIndex, occurrences[j].tokenIndexes);
            }
        }
    },

    highlightMatchByTargetTokens: function (segmentIndex, targetTokenIndexes, matchIndex) {
        var matches = this.TMCache.getMatches(segmentIndex);

        if(matchIndex < matches.length) {
            var sourceTokenIndexes = matches[matchIndex].getTMSourcePhraseByTMTargetPhrase(targetTokenIndexes);

            this.highlighting.highlightTMTargetTokens(segmentIndex, matchIndex, targetTokenIndexes);
            this.highlighting.highlightTMSourceTokens(segmentIndex, matchIndex, sourceTokenIndexes);
        }
    },

    /**
     * Indicate in the matches all tokens that correspond with the input
     * @param segmentIndex
     */
    correspondingAllTMMatches: function(segmentIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);

        // Select all input tokens
        if(translation != null) {
            var inputTokens = createArray(translation.inputTokens.length);

            for(var i = 0; i < matches.length; i++) {
                if(config.match_show_details) {
                    var TMSourcePhrases = matches[i].getTMSourcePhrasesByInput(inputTokens);
                    var TMTargetPhrases = matches[i].getTMTargetPhraseByTMSourcePhrase(TMSourcePhrases);

                    this.highlighting.correspondingTMSourceTokens(segmentIndex, matches[i].matchIndex, TMSourcePhrases);
                    this.highlighting.correspondingTMTargetTokens(segmentIndex, matches[i].matchIndex, TMTargetPhrases);
                } else {
                    var TMSourcePhrases = createArray(matches[i].sourceTokens.length);
                    var TMTargetPhrases = createArray(matches[i].targetTokens.length);

                    this.highlighting.correspondingTMSourceTokens(segmentIndex, matches[i].matchIndex, TMSourcePhrases);
                    this.highlighting.correspondingTMTargetTokens(segmentIndex, matches[i].matchIndex, TMTargetPhrases);
                }
            }
        }
    },

    highlightGrammaticalErrors: function() {
        // Vraag aan match welke tokens grammar fouten bevatten

    }
};