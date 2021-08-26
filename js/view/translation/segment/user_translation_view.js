function UserTranslationView(userTranslationController) {
    this.userTranslationController = userTranslationController;
    this.progress = userTranslationController.translationTools.getProgressData();

    // Register as observer
    this.progress.observers.register(this);
}

UserTranslationView.prototype = {
    bindBehaviour: function (segmentIndex) {
        this.initChangeLogger(segmentIndex);
        this.bindShortCuts(segmentIndex);
        this.bindMouse(segmentIndex);
    },

    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        this.setFocus(newSegmentIndex);
    },

    /**
     * Get the current user translation
     * @param segmentIndex
     * @returns the user translation, without feed forward
     */
    getUserTranslation: function(segmentIndex) {
        var copiedParent = $("#textarea-" + segmentIndex).clone();
        copiedParent.find(".feed_forward").remove();

        var result = copiedParent.text();

        return result;
    },

    getUserTranslationHTML: function (segmentIndex) {
        return $("#textarea-" + segmentIndex).html();
    },

    /**
     * Set a new user translation, can contain HTML
     * @param segmentIndex
     * @param translation
     */
    setUserTranslation: function(segmentIndex, translation) {
        $("#textarea-" + segmentIndex).html(translation);
        logger.log("New textarea value (SYS) = '" + translation + "'", segmentIndex);
    },

    /**
     * Indicate the user translation was empty
     */
    userTranslationEmptyFeedback: function(segmentIndex) {
        $("#textarea-" + segmentIndex).parent().effect("highlight", {}, 2000);
    },

    /**
     * Get the last unfinished word
     * @param segmentIndex
     * @returns "" when te last character was a whitespace
     */
    getLastUnfinishedWord: function(segmentIndex) {
        var oldRange = this.getFocus(segmentIndex);
        var userTranslation = this.getUserTranslation(segmentIndex); // Resets the text

        userTranslation = userTranslation.substring(0, oldRange.start);

        if(isSpace(userTranslation.charAt(userTranslation.length - 1))) {
            return "";
        }

        var firstPosition = userTranslation.lastIndexOf(" ") + 1;
        var lastPosition = oldRange.start;

        return userTranslation.substring(firstPosition, lastPosition);
    },

    getWordAroundCursor: function (segmentIndex) {
        var userTranslation = this.getUserTranslation(segmentIndex);
        var wordBounds = this.getWordBoundsAroundCursor(segmentIndex);

        var word = userTranslation.substring(wordBounds.start, wordBounds.end);

        return word;
    },

    /**
     * Get the startIndex and endIndex of the word that is located around the cursor
     * @param segmentIndex
     * @returns {{start: (Number|*), end: (Number|*)}}
     */
    getWordBoundsAroundCursor: function (segmentIndex) {
        var oldRange = this.getFocus(segmentIndex);
        var userTranslation = this.getUserTranslation(segmentIndex);

        var newStart = oldRange.start;
        var newEnd = oldRange.end;

        for(var i = newStart - 1; i >= 0; i--) {
            if(isSpace(userTranslation.charAt(i))) {
                newStart = i + 1;
                break;
            } else if(i == 0) {
                newStart = i;
            }
        }

        for(var i = newEnd; i < userTranslation.length; i++) {
            if(isSpace(userTranslation.charAt(i))) {
                newEnd = i;
                break;
            } else if(i == userTranslation.length - 1) {
                newEnd = i;
            }
        }

        return {start: newStart, end: newEnd};
    },

    /**
     * Set the position of the user selection
     */
    setFocus: function(segmentIndex, startPosition, endPosition) {
        var translation = this.getUserTranslation(segmentIndex);
        startPosition = typeof startPosition === "undefined" ? translation.length : Math.min(startPosition, translation.length);
        endPosition = typeof endPosition === "undefined" ? startPosition : Math.min(endPosition, translation.length);

        var textarea = document.querySelector("#textarea-" + segmentIndex);
        textarea.focus();
        var textNode = textarea.firstChild;

        if(textNode != null && textNode.nodeName == "#text") {
            var range = document.createRange();
            range.setStart(textNode, startPosition);
            range.setEnd(textNode, endPosition);

            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        setTimeout(function() {
            textarea.focus();
        }, 50);
    },

    /**
     * Get the position of the user selection
     * @returns {{start: number, end: number}}
     */
    getFocus: function(segmentIndex) {
        var element = document.getElementById("textarea-" + segmentIndex);

        var start = 0;
        var end = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                start = preCaretRange.toString().length;
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                end = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToStart", textRange);
            start = preCaretTextRange.text.length;
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            end = preCaretTextRange.text.length;
        }

        return { start: start, end: end };
    },

    initChangeLogger: function(segmentIndex) {
        var thisObject = this;

        $('.user_translation:eq(' + segmentIndex + ')').bind('copy', function(e) {
            var segmentIndex = thisObject.progress.getSelectedSegment();
            logger.log("COPY (textarea)", segmentIndex);
        });

        $('.user_translation:eq(' + segmentIndex + ')').bind('paste', function() {
            var segmentIndex = thisObject.progress.getSelectedSegment();
            logger.log("PASTE", segmentIndex);
        });

        $('.user_translation:eq(' + segmentIndex + ')').bind('cut', function() {
            var segmentIndex = thisObject.progress.getSelectedSegment();
            logger.log("CUT", segmentIndex);
        });

        $('.user_translation:eq(' + segmentIndex + ')').bind('input propertychange', function() {
            logger.log("New textarea value (USR) = '" + $(this).html() + "'", segmentIndex);
        });
    },

    bindShortCuts: function (segmentIndex) {
        var thisObject = this;

        $('#textarea-' + segmentIndex).on({
            'keydown': function (e) {
                return thisObject.userTranslationController.editStarted(segmentIndex, e);
            },

            'keyup': function (e) {
                return thisObject.userTranslationController.editStopped(segmentIndex, e);
            }
        });
    },

    bindMouse: function (segmentIndex) {
        var thisObject = this;

        $('#textarea-' + segmentIndex).on({
            'mousedown': function (e) {
                var res = thisObject.userTranslationController.editStarted(segmentIndex, e);
                return true;
            },

            'mouseup': function (e) {
                var res = thisObject.userTranslationController.editStopped(segmentIndex, e);
                return true;
            }
        });
    }
};