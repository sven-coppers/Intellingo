function MatchView(matchController, translationTools) {
    this.matchController = matchController;
    this.translationTools = translationTools;

    this.progress = translationTools.getProgressData();
    this.TMCache = translationTools.getTMCache();

    this.progress.observers.register(this);
    this.TMCache.observers.register(this);
}

MatchView.prototype = {
    /**
     * Observer: the quality cache has updated
     */
    qualityUpdated: function (segmentIndex) {
        this.showMatches(segmentIndex, this.TMCache.getMatches(segmentIndex));
    },

    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {

    },

    /**
     * Observer: the fuzzy matches have updated
     */
    matchesUpdated: function (segmentIndex, matches) {
        this.showMatches(segmentIndex, matches);
    },

    showMatches: function(segmentIndex, matches) {
        var thisObject = this;
        var target = $(".matches:eq(" + segmentIndex + ")");
        target.empty();

        // Show all matches
        for(var i = 0; i < matches.length; i++) {
            if(config.match_tm_metrics[matches[i].origin]) {
                target.append(this.matchToHTML(segmentIndex, matches[i]));
            }
        }

        target.find(".use_match").click(function() {
            var matchIndex = $(this).closest(".match").attr("id").split("-")[2];
            thisObject.matchController.useMatch(segmentIndex, matchIndex);
        });

        if(!this.TMCache.isSegmentFullyMatched(segmentIndex)) {
            this.showLoading(segmentIndex);
        } else if(matches.length == 0) {
            this.showNoResults(segmentIndex);
        }
    },

    /**
     * Generate the HTML for 1 match
     * @param segmentIndex
     * @param match
     * @returns {string}
     */
    matchToHTML: function(segmentIndex, match) {
        var html = "";

        html += '<div class="match" id="' + segmentIndex + '-match-' + match.matchIndex + '">';
        html += '    <div class="example_source">';
        html += '        <div class="example_source_content">' + this.tokensToSentence(segmentIndex, match.matchIndex, match.sourceTokens, match.sourceSentence, "source", {}, match) + '</div>';
        html += '        <div class="example_source_characteristics">';

        // Disabled for the experiment
        var title = "Match from translation memory";

        if(match.origin === MATCH_ORIGIN_LOCAL) {
            title = "Match within this document"
        } else if(match.origin === MATCH_ORIGIN_LEVENSHTEIN) {
            title = "Levenshtein match from translation memory";
        }

        html += '        <img class="tm_origin" src="img/' + match.origin + '.png" title="' + title + '"/> ';
        html += '<span title="Match score" class="tm_meta">' + Math.round(match.score) + '%</span>';

        if(match.qualityScore != null && typeof match.qualityScore !== "undefined") {
            html += '        <img class="tm_origin score" src="img/quality.png" title="Quality score"/> ';
            html += '<span title="Quality score" class="tm_meta">' + (Math.round(match.qualityScore * 100) / 100).toFixed(2) + '</span>';
        }

        if(match.isUsedInHybridTranslation()) {
            html += '        <img class="tm_origin" src="img/used.png" title="Parts of this sentence are used to enhance the machine translation"/> ';
        } else {
            html += '        <img class="tm_origin" src="img/unused.png" title="This sentence does not contain improvements for the machine translation"/>';
        }

      /*  if(match.user != -1) {
            html += '        <img class="user_icon_inline" src="img/icon-user' + (match.user - 1) + '_cropped.png"/>';
        } else {
            html += '        <img class="user_icon_inline" src="img/icon-user_grey_cropped.png" title="Translator unknown" />';
        } */

        html += '        </div>';
        html += '    </div>';
        html += '    <div class="example_destination">';
        html += '        <div class="example_destination_content selectable_tokens">' + this.tokensToSentence(segmentIndex, match.matchIndex , match.targetTokens, match.targetSentence, "target", match.replacedTokens, match) + '</div>';
        html += '        <div class="example_destination_actions">';

        if(match.segmentIndex != -1) {
            html += '        <img class="edit_match" src="img/goto.png"/>';
        }

        html += '            <img class="use_match" src="img/use_match.png" title="Use this translation" />';
        html += '        </div>';
        html += '    </div>';
        html += '</div>';

        return html;
    },

    /**
     * Generate the HTML for a sentence
     * @param segmentIndex
     * @param matchIndex
     * @param tokens
     * @param sentence
     * @param type
     * @param replacedTokens
     * @returns {string}
     */
    tokensToSentence: function(segmentIndex, matchIndex, tokens, sentence, type, replacedTokens, match) {
        var HTML = "";

        for(var i = 0; i < tokens.length; i++) {
            var classes = "token " + type;

            if(requiresSpaceBefore(sentence, tokens, i)) {
                HTML += ' ';
                classes += " space_before";
            }

            if(requiresSpaceAfter(sentence, tokens, i)) {
                classes += " space_after";
            }

            if(type === "dest" && config.match_show_replacements && typeof replacedTokens["" + i] !== "undefined") {
                HTML += '<span class="replaced" title="This word in the machine translation was replaced by <' + tokens[i] + '>">' + replacedTokens["" + i] + '</span> ';
            }

            if(type == "target") {
                classes += " selectable";

                if(match.getPreTraGroupForTargetToken(i) > -1 && config.match_show_pretrans) {
                    classes += ' pretrans" title="This token was used to improve the machine translation';
                }

                if(typeof match.grammarErrors !== "undefined" && match.grammarErrors[i] > 0 && config.grammar_errors) {
                    classes += " grammar_error";
                }
            }

            HTML += '<span class="' + classes + '" id="' + segmentIndex + '-match-' + matchIndex + '-' + type + '-' + i + '">' + tokens[i] +'</span>';
        }

        return HTML;
    },

    showLoading: function(segmentIndex) {
        var target = $(".matches:eq(" + segmentIndex + ")");
        target.append('<p class="loading_matches"><img class="spinner" src="img/spinner.gif" /> Loading matches...</p>');
    },

    showNoResults: function(segmentIndex) {
        var target = $(".matches:eq(" + segmentIndex + ")");
        target.append('<p class="no_matches">No matches found</p>');
    },

    /**
     * Requires container { position: relative; }
     * @param segmentIndex
     * @param tokenIndex
     * @param matchIndex
     */
    scrollToToken: function(segmentIndex, tokenIndex, matchIndex) {
        var container = $(".matches:eq(" + segmentIndex + ")");
        var element = $("#" + segmentIndex + "-match-" + matchIndex);
        var offset = 0;

        if(element.length != 0) {
            offset = container.scrollTop() + element.position().top - container.height() / 2 + element.height() / 2;
            container.animate({scrollTop: offset}, 300);
        }
    }
};