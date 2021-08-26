function FeedForwardController(translationTools) {
    this.translationTools = translationTools;
    this.feedForward = new FeedForward(this, translationTools);

    this.navigationController = null; // Initialised by segmentController
    this.userTranslationController = null; // Initialised by segmentController
}

FeedForwardController.prototype = {
    consumeFeedForward: function(segmentIndex) {
        var toAdd = this.feedForward.getFeedForward(segmentIndex);
        var oldText = this.userTranslationController.getUserTranslation(segmentIndex);
        var removeSpace = this.feedForward.isSpaceRemovalNeeded(segmentIndex);
        var feedForwardBounds = this.getFeedForwardBounds(segmentIndex);

        var frontText = (oldText).substring(0, feedForwardBounds.start);
        var backText = (oldText).substring(feedForwardBounds.start, oldText.length);
        var newStart = feedForwardBounds.start + toAdd.length;

        if(removeSpace && toAdd.length > 0) {
            frontText = frontText.substring(0, frontText.length - 1);
            newStart--;
        }

        if(backText.length > 0 && isSpace(backText.charAt(0))) {
            newStart++;
        }

        var newText = frontText + toAdd + backText;

        logger.log("Consumed feed forward", segmentIndex);
        this.userTranslationController.setUserTranslation(segmentIndex, newText);
        this.userTranslationController.setFocus(segmentIndex, newStart, newStart);
        this.navigationController.tokenUsed(segmentIndex);
    },

    createFeedForward: function(segmentIndex, feedForwardContent) {
        var oldFocus = this.userTranslationController.getFocus(segmentIndex);
        var oldText = this.userTranslationController.getUserTranslation(segmentIndex);
        var query = this.userTranslationController.getLastUnfinishedWord(segmentIndex);

        if(oldFocus.start != oldFocus.end) return;

        // The cursor will be after the space, instead of before
        if(this.feedForward.isSpaceRemovalNeeded(segmentIndex)) {
            oldFocus.start++;
            oldFocus.end = oldFocus.start;
            query = "";
        }

        var frontText = (oldText).substring(0, oldFocus.start);
        var backText = (oldText).substring(oldFocus.end, oldText.length);
        var previousCharacter = frontText.length > 0 ? frontText[frontText.length - 1] : " ";
        var newStart = frontText.length;
        var removeSpace = false;

        if(backText.length > 0 && !isSpace(backText.charAt(0))) {
            // Geen feed forward in het midden van een woord, tenzij er een spatie achter staat
            feedForwardContent = "";
        } else if(frontText.length > 0) {
            if (query.length > 0 && feedForwardContent.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                // If the remainder fits in the front
                feedForwardContent = feedForwardContent.toLowerCase().replace(query.toLowerCase(), "");
            } else {
                // The remainder doesn't fit
                frontText = frontText.substring(0, frontText.length - query.length);

                if (isSpace(previousCharacter) && !this.needsSpaceBefore(segmentIndex)) {
                    removeSpace = true;
                }
            }
        }

        if(frontText.length == 0) {
            feedForwardContent = capitalizeFirstLetter(feedForwardContent);
        }

        if(backText.length == 0) {
            feedForwardContent = feedForwardContent + "&#32;";
        }

        var classes = "feed_forward";

        if(removeSpace && frontText.length > 0) {
            classes += " negative_space";
            newStart--;
        }

        var newFeedForward = '<span class="' + classes + '" contenteditable="false">' + feedForwardContent + '</span>';
        var newText = frontText + newFeedForward + backText;

        logger.log("Created feed forward", segmentIndex);
        this.userTranslationController.setUserTranslation(segmentIndex, newText);
        this.userTranslationController.setFocus(segmentIndex, newStart, newStart);
    },

    removeFeedForward: function (segmentIndex) {
        this.feedForward.removeFeedForward(segmentIndex);
    },

    needsSpaceBefore: function(segmentIndex) {
        var selectedTokens = this.navigationController.getSelectedToken(segmentIndex);

        if(selectedTokens.length > 0) {
            // Check the selected token
            return selectedTokens.eq(0).hasClass("space_before");
        } else {
            // No selected token, use space by default
            return true;
        }
    },

    needsSpaceAfter: function(segmentIndex) {
        var selectedTokens = this.navigationController.getSelectedToken(segmentIndex);

        if(selectedTokens.length > 0) {
            // Check the selected token
            return selectedTokens.eq(0).hasClass("space_after");
        } else {
            // No selected token, use space by default
            return true;
        }
    },

    getFeedForwardBounds: function(segmentIndex) {
        var feedForwardStartHTML = '<span class="feed_forward"';

        var feedForward = this.feedForward.getFeedForward(segmentIndex);
        var translationHTML = this.userTranslationController.getUserTranslationHTML(segmentIndex);
        var translation = this.userTranslationController.getUserTranslation(segmentIndex);

        var bounds = {start: translation.length, end: translation.length};

        if(translationHTML.indexOf(feedForwardStartHTML) > -1) {
            bounds.start = translationHTML.indexOf(feedForwardStartHTML);
            bounds.end = bounds.start + feedForward.length;
        }

        return bounds;
    }
};