var OCCURRENCE_TYPE_TM = "OCCURRENCE_TYPE_TM";
var OCCURRENCE_TYPE_MT = "OCCURRENCE_TYPE_MT";
var OCCURRENCE_TYPE_NOT_INITIALISED = "OCCURRENCE_TYPE_NOT_INITIALISED";

/**
 * Keep track of where an alternative came from
 */
function Occurrence() {
    this.type = OCCURRENCE_TYPE_NOT_INITIALISED;
    this.relevantInputTokenIndexes = [];
}

Occurrence.prototype = {
    /**
     * Allow this class to be extended
     * @param obj
     */
    extendPrototype: function(obj){
        for(var p in obj)this[p] = obj[p];
    },

    /**
     * Get the indexes of the input tokens that are relevant to this occurrence
     * @returns {Array}
     */
    getRelevantInputTokenIndexes: function () {
        console.log("getRelevantInputTokenIndexes() not implemented for all extended classes");
    },

    /**
     * Return a string to represent this object
     */
    toString: function () {
        console.log("toString() not implemented for all extended classes");
    }
};