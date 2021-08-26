function MatchController(translationTools) {
    this.TMCache = translationTools.getTMCache();

    this.matchView = new MatchView(this, translationTools);

    this.userTranslationController = null; // Initialised by SegmentController
}

MatchController.prototype = {
    /**
     * Find the first occurence of a list of tokens
     * @param segmentIndex
     * @param tokenStrings
     * @return a list of jquery elements
     */
    getFirstOccurrence: function (segmentIndex, tokenStrings) {
        var parents = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .selectable_tokens");

        for(var i = 0; i < parents.length; i++) {
            var possibleTokens = parents.eq(i).find(".token");

            /* Check if all synonym tokens occur */
            for(var j = 0; j < possibleTokens.length; j++) {
                var possibleToken = possibleTokens.eq(j);
                var allFound = true;

                for(var k = 0; k < tokenStrings.length; k++) {
                    if(cleanToken(tokenStrings[k]) != cleanToken(possibleTokens.eq(j + k).text())) {
                        allFound = false;
                        break;
                    }
                }

                if(allFound) {
                    for(var k = 0; k < tokenStrings.length; k++) {
                        possibleTokens.eq(j + k).addClass("focus");
                    }
                }
            }
        }
    },

    scrollToToken: function (segmentIndex, tokenIndex, matchIndex) {
        this.matchView.scrollToToken(segmentIndex, tokenIndex, matchIndex);
    },

    useMatch: function(segmentIndex, matchIndex) {
        var match = this.TMCache.getMatch(segmentIndex, matchIndex);
        var translation = match.targetSentence;

        logger.log("Used fuzzy match", segmentIndex);
        this.userTranslationController.setUserTranslation(segmentIndex, translation);
        this.userTranslationController.setFocus(segmentIndex, translation.length);

    }
};
