function Term(tokens, globalGroupIndex) {
    this.tokens = tokens; // array of String
    this.globalGroupIndex = globalGroupIndex;
    this.occurrences = [];
    this.termBaseScore = 0;
}

Term.prototype = {
    addOccurrence: function(occurrence) {
        this.occurrences.push(occurrence);
    },

    getTermBaseScore: function () {
        return this.termBaseScore;
    },

    setTermBaseScore: function (termBaseScore) {
        this.termBaseScore = termBaseScore;
    },

    getMTOccurrences: function() {
        for(var i = 0; i < this.occurrences.length; i++) {
            if(this.occurrences[i].type == OCCURRENCE_TYPE_MT) {
                return 1;
            }
        }

        return 0;
    },

    getNumTMOccurrences: function() {
        var result = 0;

        for(var i = 0; i < this.occurrences.length; i++) {
            if(this.occurrences[i].type == OCCURRENCE_TYPE_TM) {
                result++;
            }
        }

        return result;
    },

    getTMOccurrencesByUser: function (userIndex) {
        var result = 0;

        for(var i = 0; i < this.occurrences.length; i++) {
            if(this.occurrences[i].type == OCCURRENCE_TYPE_TM) {
                if(this.occurrences[i].match.user == userIndex) {
                    result++;
                }
            }
        }

        return result;
    },

    getFirstOccurrence: function () {
        if(this.occurrences.length > 0) {
            return this.occurrences[0];
        } else {
            return null;
        }
    },

    getNumPreTrans: function() {
        var result = 0;

        // If it occurs in the same group
        for(var i = 0; i < this.occurrences.length; i++) {
            if(this.occurrences[i].type == OCCURRENCE_TYPE_TM && this.occurrences[i].isPreTrans()) result++;
        }

        return result;
    },

    print: function() {
        console.log(this.tokens);
        console.log("\tscore: " + this.termBaseScore);

        // If it occurs in the same group
        for(var j = 0; j < this.occurrences.length; j++) {
            var occurrence = this.occurrences[j];

            console.log("\t(group: " + this.globalGroupIndex + ") " + occurrence.toString());
        }
    },

    /**
     * Check if the term is equal to this term
     * @param term
     * @returns {boolean}
     */
    equals: function(term) {
        if(this.tokens.length != term.tokens.length) return false;
        if(this.globalGroupIndex != term.globalGroupIndex) return false;

        for(var i = 0; i < this.tokens.length; i++) {
            if(this.tokens[i] != term.tokens[i]) return false;
        }

        return true;
    }
};

function compareTerms(a, b, groupIndex) {
    var aOccurredInGroup = 0;
    var bOccurredInGroup = 0;

    if(typeof groupIndex != "undefined") {
        if(a.globalGroupIndex == groupIndex) aOccurredInGroup++;
        if(b.globalGroupIndex == groupIndex) bOccurredInGroup++;
    }

    if(aOccurredInGroup > bOccurredInGroup) {
        return -1;
    } else if(aOccurredInGroup < bOccurredInGroup) {
        return 1;
    } else {
        if(a.getMTOccurrences() > b.getMTOccurrences()) {
            return -1;
        } else if(a.getMTOccurrences() < b.getMTOccurrences()) {
            return 1;
        } else {
            // Check op hoeveel matches
            var numMatchesA = a.getNumTMOccurrences();
            var numMatchesB = b.getNumTMOccurrences();

            if(numMatchesA > numMatchesB) {
                return -1;
            } else if(numMatchesA < numMatchesB) {
                return 1;
            } else {
                // Check op tb_frequency
                if (a.getTermBaseScore() > b.getTermBaseScore())
                    return -1;
                if (a.getTermBaseScore() < b.getTermBaseScore())
                    return 1;
                return 0;
            }
        }
    }
}