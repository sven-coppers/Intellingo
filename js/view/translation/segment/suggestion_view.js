function SuggestionView(suggestionController, translationTools) {
    this.suggestionController = suggestionController;
    this.progress = translationTools.getProgressData();
    this.MTCache = translationTools.getMTCache();

    this.MTCache.observers.register(this);
}

SuggestionView.prototype = {
    /**
     * Observer: the quality cache has updated
     */
    qualityUpdated: function (segmentIndex) {
        this.machineTranslationUpdated(segmentIndex, this.MTCache.getTranslation(segmentIndex));
    },

    /**
     * Observer: visible difficulty has changed
     */
    machineTranslationUpdated: function (segmentIndex, machineTranslation) {
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");

        parentTag.find(".translation_source").html(this.tokensToHTML(segmentIndex, machineTranslation.inputTokens, machineTranslation.inputSentence, "source"));

        if(machineTranslation.qualityScore != null && typeof machineTranslation.qualityScore !== "undefined") {
            parentTag.find(".mt_meta .quality_score").html((Math.round(machineTranslation.qualityScore * 100) / 100).toFixed(2));
            parentTag.find(".quality_score").removeClass("hidden");
            parentTag.find(".mt_quality").removeClass("hidden");
            parentTag.find(".spinner").addClass("hidden");
        }

        parentTag.find(".best_prediction").html(this.tokensToHTML(segmentIndex, machineTranslation.targetTokens, machineTranslation.targetSentence, "target", machineTranslation));

        this.enableUseSuggestionButton(segmentIndex);
    },

    /**
     * Observer: visible difficulty has changed
     */
    machineTranslationFailed: function (segmentIndex) {
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        //parentTag.find(".best_prediction").html('Machine translation failed (contact tom@ccl.kuleuven.be)');
        parentTag.find(".best_prediction").html('No suggestion available');
    },

    /**
     * Convert a sentence to an interactive list of tokens
     * @param segmentIndex
     * @param tokens
     * @param sentence
     * @param type
     * @returns {string}
     */
    tokensToHTML: function(segmentIndex, tokens, sentence, type, machineTranslation) {
        var HTML = "";

        for(var i = 0; i < tokens.length; i++) {
            var classes = "token corresponding " + type;

            if(requiresSpaceBefore(sentence, tokens, i)) {
                HTML += ' ';
            }

            if(requiresSpaceBefore(sentence, tokens, i)) {
                classes += " space_before";
            }

            if(requiresSpaceAfter(sentence, tokens, i)) {
                classes += " space_after";
            }

            if(type === "target") {
                classes += " selectable mt";

                if(machineTranslation.getPreTraGroupByTargetToken(i) > -1) {
                    classes += ' pretrans" title="This token was already translated in the translation memory';

                }

                if(typeof machineTranslation.grammarErrors !== "undefined" && machineTranslation.grammarErrors[i] > 0 && config.grammar_errors) {
                    classes += " grammar_error";
                }
            }

            HTML += '<span class="' + classes + '" id="' + segmentIndex + '-' + type + '-' + i + '">' + tokens[i] + '</span>';
        }

        return HTML;
    },

    /**
     * Enable the button to use suggestions in this segment
     * @param segmentIndex
     */
    enableUseSuggestionButton: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");

        parentTag.find(".use_best_suggestion").removeClass("hidden");
        parentTag.find(".use_best_suggestion").unbind();
        parentTag.find(".use_best_suggestion").click(function() {
            thisObject.suggestionController.useSuggestion(segmentIndex, -1);
        });
    },

    /**
     * Bind Behaviour such as keyboard shortcuts
     */
    bindBehaviour: function(segmentIndex) {
        this.initShortcutUseMachineTranslation(segmentIndex);
    },

    initShortcutUseMachineTranslation: function (segmentIndex) {
        var thisObject = this;

        $('#textarea-' + segmentIndex).bind('keyup', 'ALT+M', function() {
            logger.log("KEYBOARD: alt+m (accepted)");
            thisObject.suggestionController.useSuggestion(segmentIndex, -1);
            return false;
        });
    }
};