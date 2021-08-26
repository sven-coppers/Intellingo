/**
 * Each sentence has an instance of this class, which contains all possible terms that could be suggested
 */
function ContextGlossary() {
    this.termList = [];
}

ContextGlossary.prototype = {
    addTerm: function(term) {
        this.termList.push(term);
    },

    getAllTerms: function () {
        return this.termList;
    },

    getTermsInGroup: function(globalGroupIndex) {
        var result = [];

        for(var i = 0; i < this.termList.length; i++) {
            var term = this.termList[i];

            if(term.globalGroupIndex == globalGroupIndex) {
                result.push(term);
            }
        }

        this.sort(result);

        return result;
    },

    /**
     * Get the term with the same tokens. If it does not exist yet, it will create a new one
     * @param tokenList the needle
     * @returns always returns a term.
     */
    getTerm: function(tokenList, globalGroupIndex) {
        for(var i = 0; i < this.termList.length; i++) {
            if(equalTokens(this.termList[i].tokens, tokenList) && this.termList[i].globalGroupIndex == globalGroupIndex) {
                return this.termList[i];
            }
        }

        // Not found, create a new one
        var newTerm = new Term(tokenList, globalGroupIndex);
        this.addTerm(newTerm);

        return newTerm;
    },

    getInputTokensInGroup: function(globalGroupIndex) {
        var result = [];

        for(var i = 0; i < this.termList.length; i++) {
            var term = this.termList[i];

            // If it occurs in the same group
            for(var j = 0; j < term.occurrences.length; j++) {
                var occurrence = term.occurrences[j];

                result = mergeWithoutDuplicates(result, occurrence.getRelevantInputTokenIndexes());
            }
        }

        return result;
    },

    getContextByTMToken: function (tokenIndex, matchIndex) {
        var context = new TermContext();

        for(var i = 0; i < this.termList.length; i++) {
            var term = this.termList[i];

            // If it occurs in the same group
            for(var j = 0; j < term.occurrences.length; j++) {
                var occurrence = term.occurrences[j];

                if(occurrence.type == OCCURRENCE_TYPE_TM && occurrence.match.matchIndex == matchIndex) {
                    var relativeIndex = occurrence.tokenIndexes.indexOf(tokenIndex);

                    if(relativeIndex > -1) {
                        context.setTerm(term);
                        context.setOccurrence(occurrence);
                        context.setRelativeIndex(relativeIndex);
                        return context;
                    }
                }
            }
        }

        return null;
    },

    getContextByMTToken: function (tokenIndex) {
        var context = new TermContext();

        for(var i = 0; i < this.termList.length; i++) {
            var term = this.termList[i];

            // If it occurs in the same group
            for(var j = 0; j < term.occurrences.length; j++) {
                var occurrence = term.occurrences[j];

                if(occurrence.type == OCCURRENCE_TYPE_MT) {
                    var relativeIndex = occurrence.tokenIndexes.indexOf(tokenIndex);

                    if(relativeIndex > -1) {
                        context.setTerm(term);
                        context.setOccurrence(occurrence);
                        context.setRelativeIndex(relativeIndex);
                        return context;
                    }
                }
            }
        }

        return null;
    },

    sort: function (terms) {
        terms.sort(compareTerms);
    },

    /**
     * Prints the whole glossary when no argument is given, in the other case, it will print the argument
     * @param termlist
     */
    printTerms: function(termList) {
        for(var i = 0; i < termList.length; i++) {
            termList[i].print();
        }
    },

    printContexts: function (contexts) {
        for(var i = 0; i < contexts.length; i++) {
            contexts[i].print();
        }
    }
};