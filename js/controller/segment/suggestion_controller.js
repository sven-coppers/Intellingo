function SuggestionController(translationTools) {
    this.MTCache = translationTools.getMTCache();
    this.TMCache = translationTools.getTMCache();

    this.progress = translationTools.getProgressData();
    this.suggestionView = new SuggestionView(this, translationTools);

    this.userTranslationController = null; // Set by segment controller
}

SuggestionController.prototype = {
    bindBehaviour: function (segmentIndex) {
        this.suggestionView.bindBehaviour(segmentIndex);
    },

    useSuggestion: function(segmentIndex, matchIndex) {
        var translation = "";

        if(matchIndex == -1) {
            logger.log("Used machine translation", segmentIndex);
            var translationInfo = this.MTCache.getTranslation(segmentIndex);
            translation = translationInfo.targetSentence;
        } else {
            logger.log("Used match " + matchIndex, segmentIndex);
            var match = this.TMCache.getMatches(segmentIndex)[matchIndex];
            translation = match.targetSentence;
        }

        this.userTranslationController.setUserTranslation(segmentIndex, translation);
        this.userTranslationController.setFocus(segmentIndex, translation.length);
    }
};
