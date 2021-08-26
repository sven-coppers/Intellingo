function SynonymView(synonymController, translationTools) {
    this.synonymController = synonymController;
    this.translationTools = translationTools;

    this.progress = translationTools.getProgressData();
    this.TMCache = translationTools.getTMCache();
    this.glossaryManager = translationTools.getContextGlossaryManager();

    this.TMCache.observers.register(this);
}

SynonymView.prototype = {
    /**
     * Observer: the fuzzy matches have updated
     */
    matchesUpdated: function (segmentIndex, matches) {
        this.synonymController.updateGlossary(segmentIndex);
    },

    showAlternatives: function(segmentIndex, newSynonyms) {
        var targetTag = $(".synonyms:eq(" + segmentIndex + ")");
        var wasFocused = targetTag.hasClass("focus");

        targetTag.empty();

        for(var i = 0; i < newSynonyms.length; i++) {
            targetTag.append(this.termToHTML(segmentIndex, newSynonyms[i], i));
        }

        // Only the original word itself is found
        if(newSynonyms.length == 0) {
            targetTag.append('<p class="no_synonyms">No alternatives found</p>');
        } else {
            this.makeSynonymsPreviewable(segmentIndex);
            this.makeSynonymsSelectable(segmentIndex);
        }

        if(wasFocused) {
            targetTag.addClass("focus");
        }
    },

    selectAlternative: function(segmentIndex, globalGroupIndex, alternativeIndex, relativeIndex) {
        var thisObject = this;

        var parent = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var tokenElement = this.getTokenElementByID(segmentIndex, globalGroupIndex, alternativeIndex, relativeIndex);

        parent.find(".alternative_token").removeClass("selected");
        this.makeSynonymsSelectable(segmentIndex);

        tokenElement.addClass("selected");
        tokenElement.unbind("click");
        tokenElement.click(function() {
            logger.log("(USR) Confirmed alternative token", segmentIndex);

            thisObject.synonymController.tokenConfirmed(segmentIndex);
        });

        this.scrollToToken(segmentIndex, alternativeIndex);

        logger.log("(SYS) Selected alternative token: group," + globalGroupIndex + ",alternative," + alternativeIndex + ",relative," + relativeIndex, segmentIndex);
    },

    getTokenElementByID: function(segmentIndex, globalGroupIndex, alternativeIndex, relativeIndex) {
        return $("#" + segmentIndex + "-group-" + globalGroupIndex+ "-alt-" + alternativeIndex + "-token-" + relativeIndex);
    },

    getTokenIDByElement: function (element) {
        var segmentIndex = -1;
        var groupIndex = -1;
        var alternativeIndex = -1;
        var relativeIndex = -1;

        if(element != null && element.length > 0) {
            segmentIndex = parseInt(element.attr("id").split("-")[0]);
            groupIndex = parseInt(element.attr("id").split("-")[2]);
            alternativeIndex = parseInt(element.attr("id").split("-")[4]);
            relativeIndex = parseInt(element.attr("id").split("-")[6]);
        }

        return {segmentIndex: segmentIndex, groupIndex: groupIndex, alternativeIndex: alternativeIndex, relativeIndex: relativeIndex};
    },

    makeSynonymsSelectable: function(segmentIndex) {
        var thisObject = this;

        var tokenElements = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .alternative_token");

        tokenElements.unbind("click");
        tokenElements.click(function() {
            var id = thisObject.getTokenIDByElement($(this));

            logger.log("(USR) Selected alternative token", segmentIndex);

            thisObject.synonymController.alternativeSelected(id.segmentIndex, id.groupIndex, id.alternativeIndex, id.relativeIndex);
        });
    },

    makeSynonymsPreviewable: function(segmentIndex) {
        var thisObject = this;

        $(".segment_translator_box_separator:eq(" + segmentIndex + ") .alternative_token").mouseenter(function() {
            var id = thisObject.getTokenIDByElement($(this));

            thisObject.synonymController.alternativeHovered(id.segmentIndex, id.groupIndex, id.alternativeIndex, id.relativeIndex);
        });

        $(".segment_translator_box_separator:eq(" + segmentIndex + ") .alternative_token").mouseleave(function() {
            thisObject.synonymController.alternativeExited(segmentIndex);
        });
    },

    termToHTML: function(segmentIndex, term, alternativeIndex) {
        var TMOccurrences = term.getNumTMOccurrences() - term.getNumPreTrans();
        var MTOccurrences = term.getMTOccurrences();

        var totalOccurrences = TMOccurrences + MTOccurrences;

        var html = "";
        html += '<p class="synonym">';
        html += '    <span class="word_content">' + this.termTokensToHTML(segmentIndex, term, alternativeIndex) + '</span>';
        html += '    <span class="synonym_metrics">';


        html += '       <span class="tb_score" title="Frequency in Term Base">' + Math.round(term.getTermBaseScore()) + '%</span>';

        if(totalOccurrences > 0) {
            html += '        <span class="word_occurences" title="Occurrences in fuzzy matches">' + totalOccurrences + '</span>';
            html += '       <span class="word_occurences_extended" title="Occurrences in fuzzy matches">';

            if(TMOccurrences > 0) {

                //       html += '        <span>' + term.getTMOccurrencesByUser(-1) + '<img class="user_icon_inline" src="img/icon-user_grey_cropped.png" /></span>';
                       html += '            <span>' + TMOccurrences + '<img class="user_icon_inline" src="img/unused.png" /></span>';
            }

            for(var userIndex = 0; userIndex < 5; userIndex++) {
                var userOccurences = term.getTMOccurrencesByUser(userIndex);

                if(userOccurences > 0) {
                    html += '           <span class="user' + userIndex + '">' + userOccurences + '<img class="user_icon_inline" src="img/icon-user' + userIndex + '_cropped.png" /></span>';
                }
            }

            html += '        </span>';
        }

        if(term.getNumPreTrans() > 0) {
            html += '           <span  class="synonym_mt" title="Pretranslations from fuzzy matches">' + term.getNumPreTrans() + '<img class="user_icon_inline" src="img/used.png" /></span>';
        } else if(term.getMTOccurrences() > 0) {
            html += '        <span class="synonym_mt" title="Suggested by machine translation"><img class="user_icon_inline" src="img/pc.png" /></span>';
        }

        html += '    </span>';
        html += '</p>';

        return html;
    },

    termTokensToHTML: function(segmentIndex, term, alternativeIndex) {
        var html = "";

        var occurrence = term.getFirstOccurrence();
        var lastIndex = -1;

        for(var i = 0; i < term.tokens.length; i++) {
            if(occurrence != null) {
                var tokenIndex = occurrence.tokenIndexes[i];

                if(lastIndex < tokenIndex - 1 && lastIndex > -1) {
                    html += '<span class="dots">...</span>&#32;';
                }

                lastIndex = tokenIndex;
            }

            html += '<span class="alternative_token" id="' + segmentIndex + '-group-' + term.globalGroupIndex + "-alt-" + alternativeIndex + '-token-' + i + '">' + term.tokens[i] + '</span>&#32;';
        }

        return html;
    },

    getAlternativeSelection: function(segmentIndex) {
        var selectedTokenElement = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .alternative_token.selected");

        return this.getTokenIDByElement(selectedTokenElement);
    },

    leftAlternativeToken: function (segmentIndex) {
        var selection = this.getAlternativeSelection(segmentIndex);

        selection.relativeIndex--;

        if(selection.relativeIndex >= 0) {
            logger.log("navigation;right;alternative;accepted", segmentIndex);
            this.synonymController.alternativeSelected(segmentIndex, selection.groupIndex, selection.alternativeIndex, selection.relativeIndex);
        } else {
            this.synonymController.selectLeftToken(segmentIndex);
        }
    },

    rightAlternativeToken: function (segmentIndex) {
        var selection = this.getAlternativeSelection(segmentIndex);
        var synonymElement = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .synonym:eq(" + selection.alternativeIndex + ")");
        var numHorizontalTokens = synonymElement.find(".alternative_token").length;

        selection.relativeIndex++;

        if(selection.relativeIndex < numHorizontalTokens) {
            logger.log("navigation;left;alternative;accepted", segmentIndex);
            this.synonymController.alternativeSelected(segmentIndex, selection.groupIndex, selection.alternativeIndex, selection.relativeIndex);
        } else {
            this.synonymController.selectRightToken(segmentIndex);
        }
    },

    jumpRight: function (segmentIndex) {
        var selection = this.getAlternativeSelection(segmentIndex);
        var synonymElement = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .synonym:eq(" + selection.alternativeIndex + ")");
        var numHorizontalTokens = synonymElement.find(".alternative_token").length;

        var selectedTokenElement = this.getTokenElementByID(segmentIndex, selection.groupIndex, selection.alternativeIndex, selection.relativeIndex);
        var possibleDotsElement = selectedTokenElement.next(".dots");

        selection.relativeIndex++;

        if(selectedTokenElement.index() + 1 == possibleDotsElement.index()) {
            this.synonymController.selectRightToken(segmentIndex);
        } else if(selection.relativeIndex < numHorizontalTokens) {
            this.synonymController.alternativeSelected(segmentIndex, selection.groupIndex, selection.alternativeIndex, selection.relativeIndex);
        } else {
            this.synonymController.selectRightToken(segmentIndex);
        }
    },

    downAlternativeToken: function (segmentIndex) {
        var selection = this.getAlternativeSelection(segmentIndex);
        var synonymElements = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .synonym");

        selection.alternativeIndex++;

        if(selection.alternativeIndex < synonymElements.length) {
            logger.log("navigation;down;alternative;accepted", segmentIndex);
            this.synonymController.alternativeSelected(segmentIndex, selection.groupIndex, selection.alternativeIndex, 0);
        } else {
            logger.log("navigation;down;alternative;rejected", segmentIndex);
        }
    },

    upAlternativeToken: function (segmentIndex) {
        var selection = this.getAlternativeSelection(segmentIndex);

        selection.alternativeIndex--;

        if(selection.alternativeIndex >= 0) {
            logger.log("navigation;up;alternative;accepted", segmentIndex);
            this.synonymController.alternativeSelected(segmentIndex, selection.groupIndex, selection.alternativeIndex, 0);
        } else {
            logger.log("navigation;up;alternative;rejected", segmentIndex);
        }
    },

    /**
     * Requires container { position: relative; }
     */
    scrollToToken: function(segmentIndex, alternativeIndex) {
        var container = $(".synonyms:eq(" + segmentIndex + ")");
        var element = container.find(".synonym:eq(" + alternativeIndex + ")");
        var offset = 0;

        if(element.length != 0) {
            offset = container.scrollTop() + element.position().top - container.height() / 2 + element.height() / 2;
        }

        container.animate({scrollTop: offset}, 200);
    },

    startFocus: function(segmentIndex) {
        if(config.highlight_shortcuts) {
            var parent = $(".synonyms:eq(" + segmentIndex + ")");

            parent.addClass("focus");
        }
    },

    stopFocus: function (segmentIndex) {
        if(config.highlight_shortcuts) {
            var parent = $(".synonyms:eq(" + segmentIndex + ")");

            parent.removeClass("focus");
        }
    },

    bindBehaviour: function(segmentIndex) {
        var thisObject = this;

        $('#textarea-' + segmentIndex)
            .bind('keyup', 'shift', function() { thisObject.stopFocus(segmentIndex); })
            .bind('keydown', 'shift', function() { thisObject.startFocus(segmentIndex); })

            .bind('keydown', 'shift+up', function() { logger.log("KEYBOARD: shift+up", segmentIndex); thisObject.upAlternativeToken(segmentIndex); return false; })
            .bind('keydown', 'shift+down', function() { logger.log("KEYBOARD: shift+down", segmentIndex); thisObject.downAlternativeToken(segmentIndex); return false; })
            .bind('keydown', 'shift+left', function() { logger.log("KEYBOARD: shift+left", segmentIndex); thisObject.leftAlternativeToken(segmentIndex); return false; })
            .bind('keydown', 'shift+right', function() { logger.log("KEYBOARD: shift+right", segmentIndex); thisObject.rightAlternativeToken(segmentIndex); return false; });
    },

    applyConfiguration: function () {
        $(".synonym_metrics").toggleClass("hidden", !config.synonym_show_details);
    }
};