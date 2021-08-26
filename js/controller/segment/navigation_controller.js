function NavigationController(translationTools) {
    this.MTCache = translationTools.getMTCache();
    this.TMCache = translationTools.getTMCache();

    this.glossaryManager = translationTools.getContextGlossaryManager();

    this.navigation = new Navigation(this, translationTools);

    this.matchController = null; // Initialised by segmentController
    this.feedForwardController = null; // Initialised by segmentController
    this.highlightController = null; // Initialised by segmentController
    this.synonymController = null; // Initialised by segmentController
    this.autoCompleteController = null; // Initialised by segmentController
    this.userTranslationController = null; // Initialised by segmentController
}

NavigationController.prototype = {
    bindBehaviour: function (segmentIndex) {
        this.navigation.bindBehaviour(segmentIndex);
    },

    /**
     * Reinitialise the segment (visualise new matches and select the first token)
     * @param segmentIndex
     */
    restart: function (segmentIndex) {
        this.navigation.makeTokensSelectable(segmentIndex);
        this.navigation.enableMTHovers(segmentIndex);
        this.navigation.enableTMHovers(segmentIndex);
        this.highlightController.correspondingAllTMMatches(segmentIndex);

        var userTranslation = this.userTranslationController.getUserTranslation(segmentIndex);

        if(userTranslation.length == 0) {
            this.selectFirstToken(segmentIndex);
            this.autoCompleteController.complete(segmentIndex);
        }
    },

    /**
     * Called by view
     * @param segmentIndex
     * @param tokenIndex
     * @param matchIndex
     */
    selectByTMToken: function(segmentIndex, tokenIndex, matchIndex, alreadySelected) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

        if(glossary == null) return;

        var context = glossary.getContextByTMToken(tokenIndex, matchIndex);
        if(context == null) return;


        this.showTermRelations(segmentIndex, context.getTerm(), context.getRelativeIndex());

        if(!alreadySelected) {
            this.selectToken(segmentIndex, tokenIndex, matchIndex);
            this.showAlternatives(segmentIndex, context.getTerm(), context.getRelativeIndex());
        }
    },

    /**
     * Called by view
     * @param segmentIndex
     * @param tokenIndex
     */
    selectByMTToken: function (segmentIndex, tokenIndex, alreadySelected) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

        if(glossary == null) return;

        var context = glossary.getContextByMTToken(tokenIndex);

        if(context == null) return;

        this.showTermRelations(segmentIndex, context.getTerm(), context.getRelativeIndex());

        if(!alreadySelected) {
            this.selectToken(segmentIndex, tokenIndex);
            this.showAlternatives(segmentIndex, context.getTerm(), context.getRelativeIndex());
        }
    },

    /**
     * Called by auto complete
     * @param segmentIndex
     * @param term
     * @param relativeIndex
     */
    selectByAutoComplete: function(segmentIndex, termContext) {
        var matchIndex = -1;
        var tokenIndex = -1;
        var term = termContext.getTerm();
        var relativeIndex = termContext.getRelativeIndex();
        var occurrence = termContext.getOccurrence();

        this.showTermRelations(segmentIndex, term, relativeIndex);

        if(occurrence != null) {
            tokenIndex = occurrence.tokenIndexes[relativeIndex];

            if(occurrence.type == OCCURRENCE_TYPE_TM) {
                matchIndex = occurrence.match.matchIndex;
            }
        }


        logger.log("Auto completion", segmentIndex);

        this.selectToken(segmentIndex, tokenIndex, matchIndex);
        this.showAlternatives(segmentIndex, term, relativeIndex);

        // Scroll to the most relevant token if the term came from the TB
        if(occurrence == null) {
            occurrence = this.guessTokenOccurrenceForTBTerm(segmentIndex, term);

            if(occurrence != null) {
                if(occurrence.type == OCCURRENCE_TYPE_TM) {
                    matchIndex = occurrence.match.matchIndex;
                }

                if(!config.highlight_scroll) {
                    this.matchController.scrollToToken(segmentIndex, occurrence.tokenIndexes[0], matchIndex);
                }
            }
        }
    },

    removeRelations: function (segmentIndex) {
        this.highlightController.removeHighlights(segmentIndex);
        this.synonymController.showAlternatives(segmentIndex, []);
        this.navigation.deselectToken(segmentIndex);
        this.feedForwardController.removeFeedForward(segmentIndex);
    },

    /**
     * Find the term for which this TB term is a synonym
     * @param segmentIndex
     * @param term
     * @returns {*}
     */
    guessTokenOccurrenceForTBTerm: function (segmentIndex, term) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);
        if(glossary == null) return null;

        var globalGroupIndex = term.globalGroupIndex;
        var terms = glossary.getTermsInGroup(globalGroupIndex);

        // The first one with a tokenOccurrence
        for(var i = 0; i < terms.length; i++) {
            for(var j = 0; j < terms[i].occurrences.length; j++) {
                if(terms[i].occurrences[j].type == OCCURRENCE_TYPE_TM || terms[i].occurrences[j].type == OCCURRENCE_TYPE_MT) {
                    return terms[i].occurrences[j];
                }
            }
        }

        return null;
    },

    /**
     * Update the UI to show everything related to the term (highlighting, synonyms, ...)
     * @param segmentIndex
     * @param tokenIndex
     * @param matchIndex
     */
    showTermRelations: function (segmentIndex, term, relativeTokenIndex) {
        if (term == null) return;

        this.highlightController.removeHighlights(segmentIndex);
        this.highlightController.highlightGlobalGroup(segmentIndex, term.globalGroupIndex);
        this.highlightController.focusTerm(segmentIndex, term);
    },

    showAlternatives: function (segmentIndex, term, relativeTokenIndex) {
        if (term == null) return;

        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);
        var globalGroupIndex = term.globalGroupIndex;
        var alternatives = glossary.getTermsInGroup(globalGroupIndex);
        var alternativeIndex = -1; // TODO

        for(var i = 0; i < alternatives.length; i++) {
            if(alternatives[i].equals(term)) {
                alternativeIndex = i;
                break;
            }
        }

        this.synonymController.showAlternatives(segmentIndex, alternatives);
        this.synonymController.selectAlternative(segmentIndex, globalGroupIndex, alternativeIndex, relativeTokenIndex);
        this.feedForwardController.createFeedForward(segmentIndex, term.tokens[relativeTokenIndex]);
    },

    /**
     * Select the token in the navigation view
     * @param segmentIndex
     * @param tokenIndex
     * @param matchIndex (optional)
     */
    selectToken: function (segmentIndex, tokenIndex, matchIndex) {
        this.navigation.deselectToken(segmentIndex);
        this.navigation.selectToken(segmentIndex, tokenIndex, matchIndex);

        if(config.highlight_scroll) {
            this.matchController.scrollToToken(segmentIndex, tokenIndex, matchIndex);
        }
    },

    selectFirstToken: function (segmentIndex) {
        this.selectByMTToken(segmentIndex, 0, false);
    },

    getSelection: function (segmentIndex) {
        return this.navigation.getSelection(segmentIndex);
    },

    getSelectedToken: function(segmentIndex) {
        var selection = this.navigation.getSelection(segmentIndex);
        return this.navigation.getTokenElement(segmentIndex, selection.tokenIndex, selection.matchIndex);
    },

    getSelectedContext: function (segmentIndex) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);
        var selection = this.getSelection(segmentIndex);

        if(selection.matchIndex == -1) {
            return glossary.getContextByMTToken(selection.tokenIndex);
        } else {
            return glossary.getContextByTMToken(selection.tokenIndex, selection.matchIndex);
        }
    },

    /* Called by view when an item is used (clicked for the second time) */
    tokenConfirmed: function(segmentIndex) {
        this.feedForwardController.consumeFeedForward(segmentIndex);
    },

    /* Called by feed forward when consumed */
    tokenUsed: function (segmentIndex) {
        logger.log("Moving to next token", segmentIndex);
        this.synonymController.jumpRight(segmentIndex);
    },

    inputSourceHovered: function(segmentIndex, sourceTokenIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var newGlobalGroup = translation.getGlobalGroupByInputToken(sourceTokenIndex);

        this.highlightController.highlightGlobalGroup(segmentIndex, newGlobalGroup);
    },

    inputSourceExited: function(segmentIndex, tokenIndex) {
        this.resetRelationships(segmentIndex);
    },

    mtTargetHovered: function(segmentIndex, targetTokenIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);
        var newGlobalGroup = translation.getGlobalGroupByTargetToken(targetTokenIndex);

        this.highlightController.highlightGlobalGroup(segmentIndex, newGlobalGroup);
    },

    mtTargetExited: function(segmentIndex, tokenIndex, matchIndex) {
        this.resetRelationships(segmentIndex);
    },

    tmSourceHovered: function(segmentIndex, tokenIndex, matchIndex) {
        var matches = this.TMCache.getMatches(segmentIndex);

        if(matchIndex <= matches.length) {
            var match = matches[matchIndex];
            var newGlobalGroup = match.getGlobalGroupBySourceToken(tokenIndex);

            this.highlightController.highlightGlobalGroup(segmentIndex, newGlobalGroup);
        }
    },

    tmSourceExited: function(segmentIndex, tokenIndex, matchIndex) {
        this.resetRelationships(segmentIndex);
    },

    tmTargetHovered: function(segmentIndex, tokenIndex, matchIndex) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);

        if(matchIndex <= matches.length) {
            var match = matches[matchIndex];
            var newGlobalGroup = match.getGlobalGroupByTargetToken(tokenIndex);
            var term = glossary.getContextByTMToken(tokenIndex, matchIndex);

            this.highlightController.highlightGlobalGroup(segmentIndex, newGlobalGroup);
            this.highlightController.focusTerm(segmentIndex, term);
        }
    },

    tmTargetExited: function(segmentIndex, tokenIndex) {
        this.resetRelationships(segmentIndex);
    },

    resetRelationships: function(segmentIndex) {
        var tokenSelection = this.navigation.getSelection(segmentIndex);
        var alternativeSelection = this.synonymController.getAlternativeSelection(segmentIndex);

        if(tokenSelection.tokenIndex == -1 && alternativeSelection.groupIndex != -1) {
            // There was no token selected (happens for TB terms) -> do a best guess for best occurrence
            var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

            if(glossary == null) return;

            var alternatives = glossary.getTermsInGroup(alternativeSelection.groupIndex);

            if(alternativeSelection.alternativeIndex >= alternatives.length) return;
            var term = alternatives[alternativeSelection.alternativeIndex];
            var occurrence = this.guessTokenOccurrenceForTBTerm(segmentIndex, term);

            if (occurrence.type == OCCURRENCE_TYPE_TM) {
                tokenSelection.matchIndex = occurrence.matchIndex;
            }

            tokenSelection.tokenIndex = occurrence.tokenIndexes[alternativeSelection.relativeIndex];
        }

        if(tokenSelection.tokenIndex != -1) {
            if(tokenSelection.matchIndex != -1 && typeof tokenSelection.matchIndex != "undefined") {
                this.selectByTMToken(segmentIndex, tokenSelection.tokenIndex, tokenSelection.matchIndex, true);
            } else {
                this.selectByMTToken(segmentIndex, tokenSelection.tokenIndex, true);
            }
        } else {
            this.removeRelations(segmentIndex);
        }
    },

    previewSynonym: function(segmentIndex, groupIndex, alternativeIndex, tokenIndex) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

        if(glossary != null) {
            var alternativeTerms = glossary.getTermsInGroup(groupIndex);
            var focusedTerm = alternativeTerms[alternativeIndex];

            this.highlightController.removeHighlights(segmentIndex);
            this.highlightController.highlightGlobalGroup(segmentIndex, groupIndex);
            this.highlightController.focusTerm(segmentIndex, focusedTerm);
        }
    },

    stopPreviewSynonym: function (segmentIndex) {
        this.resetRelationships(segmentIndex);
    },

    /**
     * Called by UI when a new alternative token is selected
     * @param segmentIndex
     * @param groupIndex
     * @param alternativeIndex
     * @param relativeIndex
     */
    alternativeSelected: function (segmentIndex, groupIndex, alternativeIndex, relativeIndex) {
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);

        if(glossary != null) {
            var alternativeTerms = glossary.getTermsInGroup(groupIndex);
            var selectedTerm = alternativeTerms[alternativeIndex];
            var firstOccurrence = selectedTerm.getFirstOccurrence();

            if(firstOccurrence == null) {
                // select the pure TB synonym without an occurrence
                this.navigation.deselectToken(segmentIndex);
                this.synonymController.selectAlternative(segmentIndex, groupIndex, alternativeIndex, relativeIndex);
                this.feedForwardController.createFeedForward(segmentIndex, selectedTerm.tokens[relativeIndex]);
            } else {
                if(firstOccurrence.type == OCCURRENCE_TYPE_MT) {
                    this.selectByMTToken(segmentIndex, firstOccurrence.tokenIndexes[relativeIndex], false);
                } else if(firstOccurrence.type == OCCURRENCE_TYPE_TM) {
                    this.selectByTMToken(segmentIndex, firstOccurrence.tokenIndexes[relativeIndex], firstOccurrence.match.matchIndex, false);
                }
            }
        }
    },

    /**
     * Only called by SynonymController
     * @param segmentIndex
     */
    selectLeftToken: function (segmentIndex) {
        this.navigation.selectLeft(segmentIndex);
    },

    /**
     * Only called by SynonymController
     * @param segmentIndex
     */
    selectRightToken: function (segmentIndex) {
        this.navigation.selectRight(segmentIndex);
    }
};