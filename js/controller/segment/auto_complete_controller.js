function AutoCompleteController(translationTools) {
    // Model
    this.glossaryManager = translationTools.getContextGlossaryManager();

    // View
    this.autoComplete = new AutoComplete(this);

    this.userTranslationController = null; // Initialised by segmentController
    this.navigationController = null; // Initialised by segmentController
    this.synonymController = null; // Initialised by segmentController
}

AutoCompleteController.prototype = {
    complete: function(segmentIndex) {
        var userTranslation = this.userTranslationController.getUserTranslation(segmentIndex);
        var word = this.userTranslationController.getWordAroundCursor(segmentIndex);
        var glossary = this.glossaryManager.getCachedContextGlossary(segmentIndex);
        var completionContext = null;

        if(glossary != null) {
            if(userTranslation.length == 0) {
                completionContext = this.getFirstTermContext(glossary);
            } else {
                if(word != null && word.length > 0) {
                    word = word.toLowerCase();

                    var compatibleContexts = this.getCompatibleAlternatives(glossary, word);
                    completionContext = this.getBestAlternative(segmentIndex, compatibleContexts);
                }
            }
        }

        if(completionContext != null) {
            this.navigationController.selectByAutoComplete(segmentIndex, completionContext);
        } else if(word.length > 0) {
            this.navigationController.removeRelations(segmentIndex);
        }
    },

    getFirstTermContext: function (glossary) {
        var terms = glossary.getAllTerms();
        var termContext = null;

        for(var i = 0; i < terms.length; i++) {
            var term = terms[i];

            for(var j = 0; j < term.occurrences.length; j++) {
                var occurrence = term.occurrences[j];

                if(occurrence.type == OCCURRENCE_TYPE_MT && term.tokens.length > 0) {
                    if(termContext == null) {
                        termContext = new TermContext();

                        termContext.setTerm(term);
                        termContext.setOccurrence(occurrence);
                        termContext.setRelativeIndex(0);
                    } else if(occurrence.tokenIndexes[0] < termContext.occurrence.tokenIndexes[0]) {
                        // This token occurs earlier
                        termContext.setTerm(term);
                        termContext.setOccurrence(occurrence);
                        termContext.setRelativeIndex(0);
                    }
                }
            }
        }

        return termContext;
    },

    getCompatibleAlternatives: function (glossary, query) {
        var allTerms = glossary.getAllTerms();
        var compatibleTerms = [];

        // Only alternatives that have tokens that start with the query
        for(var i = 0; i < allTerms.length; i++) {
            var hayStackTokens = allTerms[i].tokens;

            for(var j = 0; j < hayStackTokens.length; j++) {
                // Als 1 van de tokens begint met
                if(cleanToken(hayStackTokens[j]).indexOf(query) == 0) {
                    var newContext = new TermContext();
                    newContext.setTerm(allTerms[i]);

                    // TODO: nadenken over newContext.setOccurrence()

                    newContext.setRelativeIndex(this.relativeIndexOfQuery(hayStackTokens, query));

                    compatibleTerms.push(newContext);
                    break;
                }
            }
        }

        return compatibleTerms;
    },

    relativeIndexOfQuery: function(tokens, query) {
        for(var i = 0; i < tokens.length; i++) {
            // Als 1 van de tokens begint met
            if(cleanToken(tokens[i]).indexOf(query) == 0) {
                return i;
            }
        }

        return -1;
    },
    //var context = {term: null, occurrence: null, relativeIndex: -1};
    getBestAlternative: function(segmentIndex, compatibleContexts) {
        var selectedContext = this.navigationController.getSelectedContext(segmentIndex);

        if(selectedContext != null) {
            for(var i = 0; i < compatibleContexts.length; i++) {
                if(compatibleContexts[i].getTerm().equals(selectedContext.getTerm()) && compatibleContexts[i].relativeIndex == selectedContext.relativeIndex) {
                    return selectedContext;
                }
            }
        }

        if(compatibleContexts.length == 0) {
            return null;
        } else {
            var preferredGroupIndex = this.synonymController.getAlternativeSelection(segmentIndex).groupIndex;

            compatibleContexts.sort(function(a, b) {
                return compareTerms(a.getTerm(), b.getTerm(), preferredGroupIndex);
            });

            // Still need to determine context
            var bestContext = compatibleContexts[0];
            bestContext.occurrence = bestContext.getTerm().getFirstOccurrence();

            return bestContext;
        }
    }
};