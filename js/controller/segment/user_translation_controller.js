function UserTranslationController(translationTools) {
    this.translationTools = translationTools;

    this.userTranslationView = new UserTranslationView(this);

    this.progress = this.translationTools.getProgressData();

    this.feedForwardController = null; // Initialised by segmentController
    this.autoCompleteController = null; // Initialised by segmentController
}

UserTranslationController.prototype = {
    setUserTranslation: function(segmentIndex, translation) {
        this.userTranslationView.setUserTranslation(segmentIndex, translation);
    },

    getUserTranslation: function(segmentIndex) {
        return this.userTranslationView.getUserTranslation(segmentIndex);
    },

    getUserTranslationHTML: function (segmentIndex) {
        return this.userTranslationView.getUserTranslationHTML(segmentIndex);
    },

    getLastUnfinishedWord: function(segmentIndex) {
        return this.userTranslationView.getLastUnfinishedWord(segmentIndex);
    },

    getWordAroundCursor: function (segmentIndex) {
        return this.userTranslationView.getWordAroundCursor(segmentIndex);
    },

    getWordBoundsAroundCursor: function (segmentIndex) {
        return this.userTranslationView.getWordBoundsAroundCursor(segmentIndex);
    },

    userTranslationEmptyFeedback: function(segmentIndex) {
        this.userTranslationView.userTranslationEmptyFeedback(segmentIndex);
    },

    setFocus: function(segmentIndex, start, end) {
        this.userTranslationView.setFocus(segmentIndex, start, end);
    },

    getFocus: function(segmentIndex) {
        return this.userTranslationView.getFocus(segmentIndex);
    },

    bindBehaviour: function (segmentIndex) {
        this.userTranslationView.bindBehaviour(segmentIndex);
    },

    editStarted: function (segmentIndex, event) {
        if (event.keyCode == 13 && !event.shiftKey && !event.altKey && !event.ctrlKey) { // Only an enter
            logger.log("KEYBOARD: enter", segmentIndex);
            this.feedForwardController.consumeFeedForward(segmentIndex);
            return false;
        } else if(event.altKey || event.keyCode == 17 || event.shiftKey || event.key == "Shift" || event.key == "Alt") {// Navigating
            // Do Nothing
        } else {
            this.feedForwardController.removeFeedForward(segmentIndex);
        }
    },

    editStopped: function (segmentIndex, event) {
        if (event.keyCode == 13 && !event.shiftKey && !event.altKey && !event.ctrlKey) { // Only an enter
            // No Nothing
            return false;
        } else if(event.altKey || event.keyCode == 17 || event.shiftKey || event.key == "Shift" || event.key == "Alt") {// Navigating
            // Do Nothing
           // return true;
        } else {
            this.autoCompleteController.complete(segmentIndex);
        }
    }
};