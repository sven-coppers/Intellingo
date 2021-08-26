function ConfigView() {
    this.updateState();
    this.initButtons();

    config.observers.register(this);
}

ConfigView.prototype = {
    /**
     * The configuration has been changed
     */
    configurationChanged: function() {
        this.updateState();
    },

    initButtons: function () {
        this.initGeneralButtons();
        this.initFilterButtons();
        this.initWorkflowButtons();
        this.initIntelligibilityButtons();
    },

    initGeneralButtons: function() {
        $("#config_show_shortcuts").change(function () {
            config.setShowShortcuts(this.checked);
        });

        $("#close_settings").click(function () {
            $("#config_panel").toggleClass("hidden");
            $("#settings_button").toggleClass("active");
        });
    },

    initFilterButtons: function() {
        $("#config_filter_difficulty").change(function () {
            config.setFilterShowDifficulty(this.checked);
        });

        $("#config_filter_responsibilities").change(function () {
            config.setFilterShowResponsibilities(this.checked);
        });

        $("#config_filter_progress").change(function () {
            config.setFilterShowProgress(this.checked);
        });
    },

    initWorkflowButtons: function () {
        $("#config_workflow_forced").change(function () {
            config.setWorkflowForced(this.checked);
        });

        $("#config_workflow_translation_start_translating").change(function () {
            config.setWorkflowAllowTranslatingWhenTranslated(this.checked);
        });

        $("#config_workflow_translation_start_revising").change(function () {
            config.setWorkflowAllowRevisingWhenTranslated(this.checked);
        });

        $("#config_workflow_revised_start_translating").change(function () {
            config.setWorkflowAllowTranslatingWhenRevising(this.checked);
        });

        $("#config_workflow_revised_start_revising").change(function () {
            config.setWorkflowAllowRevisingWhenRevised(this.checked);
        });
    },

    initIntelligibilityButtons: function () {
        $("#config_intelligibility_sentence_difficulty").change(function () {
            config.setIntelligibilityShowDifficulty(this.checked);
        });

        $("#config_intelligibility_match_details").change(function () {
            config.setIntelligibilityShowMatchContext(this.checked);
        });

        $("#config_intelligibility_alt_metrics").change(function () {
            config.setIntelligibilityShowAltMetrics(this.checked);
        });

        $("#config_intelligibility_mt_pretrans").change(function () {
            config.setIntelligibilityShowPretrans(this.checked);
        });

        $("#config_intelligibility_highlight_examples").change(function () {
            config.setIntelligibilityHighlightExamples(this.checked);
        });

        $("#config_intelligibility_highlight_selection").change(function () {
            config.setIntelligibilityHighlightSelection(this.checked);
        });

        $("#config_intelligibility_scroll").change(function () {
            config.setIntelligibilityScroll(this.checked);
        });

        $("#config_intelligibility_grammar_errors").change(function () {
            config.setIntelligibilityGrammarErrors(this.checked);
        })
    },

    updateState: function() {
        this.updateGeneralState();
        this.updateFilterState();
        this.updateWorkflowState();
        this.updateIntelligibilityState();
    },

    updateGeneralState: function () {
        $("#config_show_shortcuts").prop("checked", config.filter_show_shortcuts);
    },

    updateFilterState: function() {
        $("#config_filter_difficulty").prop("checked", config.filter_show_difficulty);
        $("#config_filter_progress").prop("checked", config.filter_show_phase);
        $("#config_filter_responsibilities").prop("checked", config.filter_show_responsibilities);
    },

    updateWorkflowState: function () {
        var selector = ".workflow#";

        selector += config.workflow[PHASE_TRANSLATED][ALLOW_START_TRANSLATING]  ? "1" : "0";
        selector += config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]     ? "1" : "0";

        if(config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]) {
            selector += config.workflow[PHASE_REVISING][ALLOW_REJECT]     ? "1" : "0";
            selector += config.workflow[PHASE_REVISED][ALLOW_START_REVISING]        ? "1" : "0";
        } else {
            selector += "00";
        }

        $(".workflow").addClass("hidden");
        $(selector).removeClass("hidden");

        $("#config_workflow_translation_start_translating").prop("checked", config.workflow[PHASE_TRANSLATED][ALLOW_START_TRANSLATING]);
        $("#config_workflow_translation_start_revising").prop("checked", config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]);
        $("#config_workflow_revised_start_translating").prop("checked", config.workflow[PHASE_REVISING][ALLOW_REJECT]);
        $("#config_workflow_revised_start_revising").prop("checked", config.workflow[PHASE_REVISED][ALLOW_START_REVISING]);

        $("#config_workflow_translation_start_translating").prop("disabled", !config.workflowForced);
        $("#config_workflow_translation_start_revising").prop("disabled", !config.workflowForced);
        $("#config_workflow_revised_start_translating").attr("disabled", !config.workflowForced || !config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]);
        $("#config_workflow_revised_start_revising").attr("disabled", !config.workflowForced || !config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]);
    },

    updateIntelligibilityState: function() {
        $("#config_intelligibility_sentence_difficulty").prop("checked", config.segment_show_difficulty);
        $("#config_intelligibility_match_details").prop("checked", config.match_show_details);
        $("#config_intelligibility_alt_metrics").prop("checked", config.synonym_show_details);
        $("#config_intelligibility_mt_pretrans").prop("checked", config.match_show_pretrans);
        $("#config_intelligibility_highlight_examples").prop("checked", config.highlight_navigable);
        $("#config_intelligibility_highlight_selection").prop("checked", config.highlight_selected);
        $("#config_intelligibility_scroll").prop("checked", config.highlight_scroll);
        $("#config_intelligibility_grammar_errors").prop("checked", config.grammar_errors);
    }
};