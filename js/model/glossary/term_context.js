function TermContext() {
    this.term = null;
    this.occurrence = null;
    this.relativeIndex = -1;
}

TermContext.prototype = {
    setTerm: function (term) {
        this.term = term;
    },

    getTerm: function () {
        return this.term;
    },

    setOccurrence: function (occurrence) {
        this.occurrence = occurrence;
    },

    getOccurrence: function () {
        return this.occurrence;
    },

    setRelativeIndex: function (relativeIndex) {
        this.relativeIndex = relativeIndex;
    },

    getRelativeIndex: function () {
        return this.relativeIndex;
    },

    print: function () {
        this.term.print();
    }
};