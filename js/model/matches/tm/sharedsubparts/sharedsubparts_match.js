/**
 * Constructor for matches made using sharedsubparts
 * @param jsonMatch Uses a jsonmatch from the fuzzy matcher to build a match
 */
function SharedsubpartsMatch(jsonMatch, inputSentence, inputTokens){
    this.tmid = jsonMatch["tmid"];
    this.replacedTokens = [];
    this.inputSentence = inputSentence;
    this.inputTokens = inputTokens;
    this.inputTree = new SyntaxTree(jsonMatch["testelts"]);
    this.sourceTree = new SyntaxTree(jsonMatch["tmsrcelts"]);
    this.destTree = new SyntaxTree(jsonMatch["tmtrgaln"]);
    this.sourceSentence = jsonMatch["tmnontoksrcsent"];
    this.targetSentence = jsonMatch["tmnontoktrgsent"];
    this.sourceTokens = jsonMatch["tmtoksrcsent"];
    this.targetTokens = this.destTree.getTokens();
    this.origin = MATCH_ORIGIN_SHAREDSUBPARTS;
    this.score = jsonMatch["score"] * 100;
    this.initInterAlignment(jsonMatch["monoaln"]);
    this.initIntraAlignment(jsonMatch["bialn"]);
    this.initGlobalAlignment();
    this.initPreTraAlignment();

    this.qualityScore = null;
}

SharedsubpartsMatch.prototype = new Match();

SharedsubpartsMatch.prototype.extendPrototype({
    initIntraAlignment: function(jsonMatches) {
        for(var i = 0; i < jsonMatches.length; i += 3) {
            var tmSourceNodeID = jsonMatches[i]["spans"][0];
            var tmTargetNodeID = jsonMatches[i + 1]["spans"][0];
            var tmMatchScore = jsonMatches[i + 2];
            var groupIndex = i / 3;

            this.sourceTree.nodes[tmSourceNodeID].setIntraGroupIndex(groupIndex);
            this.destTree.nodes[tmTargetNodeID].setIntraGroupIndex(groupIndex);
        }
    },

    initInterAlignment: function(jsonMatches) {
        var newGroupIndex = 0;

        // For every group of matching nodes
        for(var i = 0; i < jsonMatches.length; i+= 3) {
            // These lists of nodes are equally long
            var matchinginputNodes = jsonMatches[i]["spans"];
            var matchingSourceNodes = jsonMatches[i + 1]["spans"];
            var score = parseFloat(jsonMatches[i + 2]);

            // For every node in this group
            for(var j = 0; j < matchingSourceNodes.length; j++) {
                var tmInputNodeID = matchinginputNodes[j];
                var tmSourceNodeID = matchingSourceNodes[j];

                //Optioneel: alleen overeenkomsten op leaves
                if(this.sourceTree.nodes[tmSourceNodeID].isLeaf()) {
                    this.inputTree.nodes[tmInputNodeID].setInterGroupIndex(newGroupIndex);
                    this.sourceTree.nodes[tmSourceNodeID].setInterGroupIndex(newGroupIndex);
                    newGroupIndex++;
                }
            }
        }

        // format: <span(s) van testzin>, <span(s) van TM-bronzin>, score, <span(s) van testzin>, ...; score is altijd 1 in voorbeeld-JSON in
        // <span(s)> bestaat uit een enkele woordpositie (woordalignering) of uit een enkele knoop-ID (boomalignering), een knoop komt overeen met een andere knoop (niet noodzakelijk een leaf)
    },

    getIntraGroupIndexFromSourceToken: function(sourceTokenIndex) {
        var leave = this.sourceTree.leaves[sourceTokenIndex];
        var intraGroupIndex = leave.intraGroupIndex;

        while(intraGroupIndex == -1 && leave.parentNode != null) {
            leave = leave.parentNode;
            intraGroupIndex = leave.intraGroupIndex;
        }

        return intraGroupIndex;
    },

    getInterGroupIndexFromSourceToken: function(sourceTokenIndex) {
        var leave = this.sourceTree.leaves[sourceTokenIndex];
        var interGroupIndex = leave.interGroupIndex;

        while(interGroupIndex == -1 && leave.parentNode != null) {
            leave = leave.parentNode;
            interGroupIndex = leave.interGroupIndex;
        }

        return interGroupIndex;
    },

    getIntraGroupIndexFromTargetToken: function(sourceTokenIndex) {
        var leave = this.destTree.leaves[sourceTokenIndex];
        var intraGroupIndex = leave.intraGroupIndex;

        while(intraGroupIndex == -1 && leave.parentNode != null) {
            leave = leave.parentNode;
            intraGroupIndex = leave.intraGroupIndex;
        }

        return intraGroupIndex;
    },

    getInterGroupIndexFromInputToken: function(sourceTokenIndex) {
        var leave = this.inputTree.leaves[sourceTokenIndex];
        var interGroupIndex = leave.interGroupIndex;

        while(interGroupIndex == -1 && leave.parentNode != null) {
            leave = leave.parentNode;
            interGroupIndex = leave.interGroupIndex;
        }

        return interGroupIndex;
    },

    getIntraSourceTokens: function(groupIndex) {
        return this.sourceTree.getIntraNodesIndexes(groupIndex);
    },

    getIntraTargetTokens: function(groupIndex) {
        return this.destTree.getIntraNodesIndexes(groupIndex);
    },

    getInterSourceTokens: function(groupIndex) {
        return this.sourceTree.getInterNodesIndexes(groupIndex);
    },

    getInterInputTokens: function(groupIndex) {
        return this.inputTree.getInterNodesIndexes(groupIndex);
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMSourceTokens: function (TMSourceTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMSourceTokenIndexes.length; i++) {
            var intraGroupIndex = this.getIntraGroupIndexFromSourceToken(TMSourceTokenIndexes[i]);
            var intraSourceTokens = this.getIntraSourceTokens(intraGroupIndex);

            result = mergeWithoutDuplicates(result, intraSourceTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get TM Source Phrases, given by (a smaller set of) TM source tokens
     * @param TMTargetTokenIndexes
     * @returns {Array}
     */
    getTMTargetPhraseByTMTargetTokens: function (TMTargetTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMTargetTokenIndexes.length; i++) {
            var intraGroupIndex = this.getIntraGroupIndexFromTargetToken(TMTargetTokenIndexes[i]);
            var intraTargetTokens = this.getIntraTargetTokens(intraGroupIndex);

            result = mergeWithoutDuplicates(result, intraTargetTokens);
        }

        sort(result);

        return result;
    },

    /**
     * Get TM Source Phrases, given TM target tokens

     * @param TMSourceTokenIndexes
     * @returns {Array}
     */
    getTMSourcePhraseByTMTargetPhrase: function (TMTargetTokenIndexes) {
        var result = [];

        for(var i = 0; i < TMTargetTokenIndexes.length; i++) {
            var intraGroupIndex = this.getIntraGroupIndexFromTargetToken(TMTargetTokenIndexes[i]);
            var intraSourceTokens = this.getIntraSourceTokens(intraGroupIndex);

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
            var intraGroupIndex = this.getIntraGroupIndexFromSourceToken(TMSourceTokenIndexes[i]);
            var intraDestTokens = this.getIntraTargetTokens(intraGroupIndex);

            result = mergeWithoutDuplicates(result, intraDestTokens);
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

        for (var i = 0; i < TMSourceTokenIndexes.length; i++) {
            var interGroupIndex = this.getInterGroupIndexFromSourceToken(TMSourceTokenIndexes[i]);

            if (interGroupIndex != -1) {
                var inputSourceTokens = this.getInterInputTokens(interGroupIndex);

                result = mergeWithoutDuplicates(result, inputSourceTokens);
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

        for (var i = 0; i < inputTokenIndexes.length; i++) {
            var interGroupIndex = this.getInterGroupIndexFromInputToken(inputTokenIndexes[i]);

            if (interGroupIndex != -1) {
                var TMSourceTokens = this.getInterSourceTokens(interGroupIndex);

                result = mergeWithoutDuplicates(result, TMSourceTokens);
            }
        }

        sort(result);

        return result;
    }
});