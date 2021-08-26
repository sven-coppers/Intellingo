function Navigation(navigationController, translationTools)  {
    this.navigationController = navigationController;
    this.translationTools = translationTools;

    this.progress = translationTools.getProgressData();
    this.TMCache = translationTools.getTMCache();
    this.MTCache = translationTools.getMTCache();

    this.progress.observers.register(this);
    this.TMCache.observers.register(this);
    this.MTCache.observers.register(this);
}

Navigation.prototype = {
    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        this.navigationController.restart(newSegmentIndex);
    },

    /**
     * Observer: the machine translation is updated
     */
    machineTranslationUpdated: function (segmentIndex, machineTranslation) {
        this.navigationController.restart(segmentIndex);
    },

    /**
     * Observer: the fuzzy matches have updated
     */
    matchesUpdated: function (segmentIndex, matches) {
        this.navigationController.restart(segmentIndex);
    },

    qualityUpdated: function(segmentIndex) {
        this.navigationController.restart(segmentIndex);
    },

    /**
     * Select the first token
     * @param segmentIndex
     */
    makeTokensSelectable: function (segmentIndex) {
        var thisObject = this;
        var options = $(".segment_translator_box_separator:eq(" + segmentIndex + ")").find(".selectable");

        options.unbind("click");
        options.click(function () {
            logger.log("(USR) Selected token", segmentIndex);

            thisObject.tokenElementSelected(segmentIndex, $(this));
        });
    },

    /**
     * Enable the hover effects for highlightable tokens/segments in source sentence and best suggestion
     */
    enableMTHovers: function(segmentIndex) {
        var parent = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var thisObject = this;

        parent.find(".translation_source .token")
            .unbind("mouseenter")
            .mouseenter(function() {
                var tokenIndex = $(this).attr('id').split("-")[2];
                logger.log("Hovered token: input;" + tokenIndex, segmentIndex);
                thisObject.navigationController.inputSourceHovered(segmentIndex, tokenIndex);
            })
            .unbind("mouseleave")
            .mouseleave(function () {
                var tokenIndex = $(this).attr('id').split("-")[2];
                thisObject.navigationController.inputSourceExited(segmentIndex, tokenIndex);
            });
        parent.find(".best_prediction .token")
            .unbind("mouseenter")
            .mouseenter(function() {
                var tokenIndex = $(this).attr('id').split("-")[2];
                logger.log("Hovered token: mt;" + tokenIndex, segmentIndex);
                thisObject.navigationController.mtTargetHovered(segmentIndex, tokenIndex);
            })
            .unbind("mouseleave")
            .mouseleave(function () {
                var tokenIndex = $(this).attr('id').split("-")[2];
                thisObject.navigationController.mtTargetExited(segmentIndex, tokenIndex);
            });
    },

    /**
     * Enable the hover effects for highlightable tokens/segments in fuzzy matches
     */
    enableTMHovers: function(segmentIndex) {
        var parent = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var thisObject = this;

        parent.find(".match .token.source")
            .unbind("mouseenter")
            .mouseenter(function() {
                var matchIndex = $(this).attr('id').split("-")[2];
                var tokenIndex = $(this).attr('id').split("-")[4];
                logger.log("Hovered token: tm;" + matchIndex + ";source;" + tokenIndex, segmentIndex);
                thisObject.navigationController.tmSourceHovered(segmentIndex, tokenIndex, matchIndex);
            })
            .unbind("mouseleave")
            .mouseleave(function () {
                var matchIndex = $(this).attr('id').split("-")[2];
                var tokenIndex = $(this).attr('id').split("-")[4];
                thisObject.navigationController.tmSourceExited(segmentIndex, tokenIndex, matchIndex);
            });
        parent.find(".match .token.target")
            .unbind("mouseenter")
            .mouseenter(function() {
                var matchIndex = $(this).attr('id').split("-")[2];
                var tokenIndex = $(this).attr('id').split("-")[4];
                logger.log("Hovered token: tm;" + matchIndex + ";target;" + tokenIndex, segmentIndex);
                thisObject.navigationController.tmTargetHovered(segmentIndex, tokenIndex, matchIndex);
            })
            .unbind("mouseleave")
            .mouseleave(function () {
                var matchIndex = $(this).attr('id').split("-")[2];
                var tokenIndex = $(this).attr('id').split("-")[4];
                thisObject.navigationController.tmTargetExited(segmentIndex, tokenIndex, matchIndex);
            });
    },

    deselectToken: function(segmentIndex) {
        //logger.log("Token deselected", segmentIndex);
        $(".segment_translator_box_separator:eq(" + segmentIndex + ")").find(".token.selected").removeClass("selected underlined");
    },

    getSelection: function (segmentIndex) {
        var parent = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var elements = parent.find(".token.selected");

     /*   if(elements.length == 0) {
            elements = parent.find(".token.target.highlight");
        } */

        var result = {matchIndex: -1, tokenIndex: -1};

        if(elements.length > 0) {
            var element = elements.eq(0);

            if(element.attr('id').split("-").length == 3) {
                result.tokenIndex = parseInt(element.attr('id').split("-")[2]);
            } else {
                result.matchIndex = parseInt(element.attr('id').split("-")[2]);
                result.tokenIndex = parseInt(element.attr('id').split("-")[4]);
            }
        }

        return result;
    },

    getTokenElement: function(segmentIndex, tokenIndex, matchIndex) {
        if(typeof matchIndex == "undefined" || matchIndex == -1) {
            return $("#" + segmentIndex + "-target-" + tokenIndex);
        } else {
            return $("#" + segmentIndex + "-match-" + matchIndex + "-target-" + tokenIndex);
        }
    },

    selectToken: function(segmentIndex, tokenIndex, matchIndex) {
        matchIndex = typeof matchIndex !== "undefined" ? matchIndex : -1;

        var thisObject = this;
        var selection = this.getSelection(segmentIndex);

        this.makeTokensSelectable(segmentIndex);

        var oldSelectedElement = this.getTokenElement(segmentIndex, selection.tokenIndex, selection.matchIndex);
        var newSelectedElement = this.getTokenElement(segmentIndex, tokenIndex, matchIndex);

        oldSelectedElement.removeClass("selected focus underlined");
        newSelectedElement.addClass("selected");

        if(config.highlight_selected) {
            newSelectedElement.addClass("focus underlined");
        }

        newSelectedElement.unbind("click");
        newSelectedElement.click(function() {
            logger.log("(USR) Confirmed token", segmentIndex);
            thisObject.navigationController.tokenConfirmed(segmentIndex);
        });

        logger.log("(SYS) Selected token: matchIndex;" + matchIndex + ";tokenIndex;" + tokenIndex + ";content;" + newSelectedElement.text(), segmentIndex);
    },

    selectLeft: function(segmentIndex) {
        var segment = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var tokenElement = segment.find(".token.selected");

        if(tokenElement.length == 0) {
            tokenElement = segment.find(".token.target.navigable");
        }

        var selectIndex = tokenElement.index() - 1;

        if(selectIndex >= 0) {
            var parent = tokenElement.parent();
            var newToken = parent.find(".token").eq(selectIndex);

            logger.log("navigation;left;token;accepted", segmentIndex);
            this.tokenElementSelected(segmentIndex, newToken);
            return;
        }

        logger.log("navigation;left;token;rejected", segmentIndex);
    },

    selectRight: function(segmentIndex) {
        var segment = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var tokenElement = segment.find(".token.selected");

        if(tokenElement.length == 0) {
            tokenElement = segment.find(".token.target.navigable");
        }

        var maxNum = tokenElement.parent().find(".token").length;
        var selectIndex = tokenElement.index() + 1;

        if(selectIndex < maxNum) {
            var parent = tokenElement.parent();
            var newToken = parent.find(".token").eq(selectIndex);

            logger.log("navigation;right;token;accepted", segmentIndex);
            this.tokenElementSelected(segmentIndex, newToken);
            return;
        }

        logger.log("navigation;right;token;rejected", segmentIndex);
    },

    selectUp: function(segmentIndex) {
        var segment = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var parentsWithHighlights = segment.find(".selectable_tokens").has(".navigable");

        for(var i = parentsWithHighlights.length - 1; i > 0; i--) {
            var tokenElement = parentsWithHighlights.eq(i).find(".token.selected");

            if(tokenElement.length > 0) {
                if(i - 1 >= 0) {
                    logger.log("navigation;up;token;accepted", segmentIndex);
                    this.tokenElementSelected(segmentIndex, parentsWithHighlights.eq(i - 1).find(".navigable").first());
                    return;
                }
            }
        }

        logger.log("navigation;up;token;rejected", segmentIndex);
    },

    selectDown: function(segmentIndex) {
        var segment = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var parentsWithHighlights = segment.find(".selectable_tokens").has(".navigable");

        for(var i = 0; i < parentsWithHighlights.length; i++) {
            var tokenElement = parentsWithHighlights.eq(i).find(".token.selected");

            if(tokenElement.length > 0) {
                if(i + 1 < parentsWithHighlights.length) {
                    logger.log("navigation;down;token;accepted", segmentIndex);
                    this.tokenElementSelected(segmentIndex, parentsWithHighlights.eq(i + 1).find(".navigable").first());
                    return;
                }
            }
        }

        logger.log("navigation;down;token;rejected", segmentIndex);
    },

    /**
     * Convert a HTML token to the appropriate call to the controller
     * @param segmentIndex
     * @param tokenElement
     */
    tokenElementSelected: function(segmentIndex, tokenElement) {
        if(tokenElement.attr('id').split("-").length == 3) {
            var tokenIndex = parseInt(tokenElement.attr('id').split("-")[2]);

            this.navigationController.selectByMTToken(segmentIndex, tokenIndex, false);
        } else {
            var matchIndex = parseInt(tokenElement.attr('id').split("-")[2]);
            var tokenIndex = parseInt(tokenElement.attr('id').split("-")[4]);

            this.navigationController.selectByTMToken(segmentIndex, tokenIndex, matchIndex, false);
        }
    },

    startFocus: function(segmentIndex) {
        if(config.highlight_shortcuts) {
            var parent = $(".matches:eq(" + segmentIndex + ")");

            parent.addClass("focus");
        }
    },

    stopFocus: function (segmentIndex) {
        if(config.highlight_shortcuts) {
            var parent = $(".matches:eq(" + segmentIndex + ")");

            parent.removeClass("focus");
        }
    },

    bindBehaviour: function(segmentIndex) {
        var thisObject = this;

        $('#textarea-' + segmentIndex)
            .bind('keydown', 'alt', function() { thisObject.startFocus(segmentIndex);  })
            .bind('keyup', 'alt', function() { thisObject.stopFocus(segmentIndex); })

            .bind('keydown', 'alt+up', function() { logger.log("KEYBOARD: alt+up", segmentIndex); thisObject.selectUp(segmentIndex); return false; })
            .bind('keydown', 'alt+down', function() { logger.log("KEYBOARD: alt+down", segmentIndex); thisObject.selectDown(segmentIndex); return false; })
            .bind('keydown', 'alt+left', function() { logger.log("KEYBOARD: alt+left", segmentIndex); thisObject.selectLeft(segmentIndex); return false; })
            .bind('keydown', 'alt+right', function() { logger.log("KEYBOARD: alt+right", segmentIndex); thisObject.selectRight(segmentIndex); return false; });
    }
};