function HighLighting(highlightController, translationTools) {
    this.highlightController = highlightController;

    this.progress = translationTools.getProgressData();

    this.progress.observers.register(this);
}

HighLighting.prototype = {
    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        this.removeHighlights(oldSegmentIndex);
    },

    removeHighlights: function(segmentIndex) {
        var parent = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");

        parent.find(".navigable").removeClass("navigable");
        parent.find(".highlight").removeClass("highlight");
        parent.find(".focus").removeClass("focus");
        parent.find(".preview").removeClass("preview");
    },

    highlightTMSourceTokens: function(segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-match-" + matchIndex + "-source-" + tokenIndexes[i]).addClass("navigable");

            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-match-" + matchIndex + "-source-" + tokenIndexes[i]).addClass("highlight");
            }
        }
    },

    focusTMSourceTokens: function(segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-match-" + matchIndex + "-source-" + tokenIndexes[i]).addClass("focus");
            }
        }
    },

    highlightTMTargetTokens: function(segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-match-" + matchIndex + "-target-" + tokenIndexes[i]).addClass("navigable");

            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-match-" + matchIndex + "-target-" + tokenIndexes[i]).addClass("highlight");
            }
        }
    },

    focusTMTargetTokens: function(segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-match-" + matchIndex + "-target-" + tokenIndexes[i]).addClass("focus");
            }
        }
    },

    highlightInputTokens: function(segmentIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-source-" + tokenIndexes[i]).addClass("navigable");

            if(config.highlight_navigable || 1 == 1) {
                $("#" + segmentIndex + "-source-" + tokenIndexes[i]).addClass("highlight");
            }
        }
    },

    focusInputSourceTokens: function(segmentIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-source-" + tokenIndexes[i]).addClass("focus");
            }
        }
    },

    highlightMTTargetTokens: function(segmentIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-target-" + tokenIndexes[i]).addClass("navigable");

            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-target-" + tokenIndexes[i]).addClass("highlight");
            }
        }
    },

    focusMTTargetTokens: function(segmentIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            if(config.highlight_navigable) {
                $("#" + segmentIndex + "-target-" + tokenIndexes[i]).addClass("focus");
            }
        }
    },

    correspondingTMSourceTokens: function (segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-match-" + matchIndex + "-source-" + tokenIndexes[i]).addClass("corresponding");
        }
    },

    correspondingTMTargetTokens: function (segmentIndex, matchIndex, tokenIndexes) {
        for(var i = 0; i < tokenIndexes.length; i++) {
            $("#" + segmentIndex + "-match-" + matchIndex + "-target-" + tokenIndexes[i]).addClass("corresponding");
        }
    }
};