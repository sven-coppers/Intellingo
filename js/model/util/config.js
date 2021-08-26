var MODE_INTELLIGIBLE = "intelligible";
var MODE_SIMPLE = "simple";

var ALLOW_START_TRANSLATING = "allow_start_translating";
var ALLOW_STOP_TRANSLATING = "allow_stop_translating";
var ALLOW_START_REVISING = "allow_start_revising";
var ALLOW_STOP_REVISING = "allow_stop_revising";
var ALLOW_REJECT = "allow_reject";

function Config(mode, data, user, group, restart, ready, changes) {
    this.initWorkFlow();
    this.initTMs();
    this.setMode(mode);
    this.dataFolder = data;
    this.user = user;
    this.group = group;
    this.restart = restart;
    this.max_num_segments = 250;

    this.allow_config_changes = changes;

    this.allow_uploading_files = false;

    this.observers = new ObservableConfig();
}

Config.prototype = {
    initWorkFlow: function() {
        this.workflowForced = true;

        /* workflow is used when workflowForced == true (can be changed at runtime) */
        this.workflow = {};

        this.workflow[PHASE_INITIALISED] = {};
        this.workflow[PHASE_INITIALISED][ALLOW_START_TRANSLATING] = true;
        this.workflow[PHASE_INITIALISED][ALLOW_STOP_TRANSLATING] = false;
        this.workflow[PHASE_INITIALISED][ALLOW_START_REVISING] = false;
        this.workflow[PHASE_INITIALISED][ALLOW_STOP_REVISING] = false;
        this.workflow[PHASE_INITIALISED][ALLOW_REJECT] = false;

        this.workflow[PHASE_TRANSLATING] = {};
        this.workflow[PHASE_TRANSLATING][ALLOW_START_TRANSLATING] = false;
        this.workflow[PHASE_TRANSLATING][ALLOW_STOP_TRANSLATING] = true;
        this.workflow[PHASE_TRANSLATING][ALLOW_START_REVISING] = false;
        this.workflow[PHASE_TRANSLATING][ALLOW_STOP_REVISING] = false;
        this.workflow[PHASE_TRANSLATING][ALLOW_REJECT] = false;

        this.workflow[PHASE_TRANSLATED] = {};
        this.workflow[PHASE_TRANSLATED][ALLOW_START_TRANSLATING] = true;
        this.workflow[PHASE_TRANSLATED][ALLOW_STOP_TRANSLATING] = false;
        this.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING] = false;
        this.workflow[PHASE_TRANSLATED][ALLOW_STOP_REVISING] = false;
        this.workflow[PHASE_TRANSLATED][ALLOW_REJECT] = false;

        this.workflow[PHASE_REVISING] = {};
        this.workflow[PHASE_REVISING][ALLOW_START_TRANSLATING] = false;
        this.workflow[PHASE_REVISING][ALLOW_STOP_TRANSLATING] = false;
        this.workflow[PHASE_REVISING][ALLOW_START_REVISING] = false;
        this.workflow[PHASE_REVISING][ALLOW_STOP_REVISING] = false;
        this.workflow[PHASE_REVISING][ALLOW_REJECT] = false;

        this.workflow[PHASE_REVISED] = {};
        this.workflow[PHASE_REVISED][ALLOW_START_TRANSLATING] = false;
        this.workflow[PHASE_REVISED][ALLOW_STOP_TRANSLATING] = false;
        this.workflow[PHASE_REVISED][ALLOW_START_REVISING] = false;
        this.workflow[PHASE_REVISED][ALLOW_STOP_REVISING] = false;
        this.workflow[PHASE_REVISED][ALLOW_REJECT] = false;

        /* workflow is used when workflowForced == false (can NOT be changed at runtime) */
        this.workflowDefault = {};

        this.workflowDefault[PHASE_INITIALISED] = {};
        this.workflowDefault[PHASE_INITIALISED][ALLOW_START_TRANSLATING] = true;
        this.workflowDefault[PHASE_INITIALISED][ALLOW_STOP_TRANSLATING] = false;
        this.workflowDefault[PHASE_INITIALISED][ALLOW_START_REVISING] = false;
        this.workflowDefault[PHASE_INITIALISED][ALLOW_STOP_REVISING] = false;
        this.workflowDefault[PHASE_INITIALISED][ALLOW_REJECT] = false;

        this.workflowDefault[PHASE_TRANSLATING] = {};
        this.workflowDefault[PHASE_TRANSLATING][ALLOW_START_TRANSLATING] = false;
        this.workflowDefault[PHASE_TRANSLATING][ALLOW_STOP_TRANSLATING] = true;
        this.workflowDefault[PHASE_TRANSLATING][ALLOW_START_REVISING] = false;
        this.workflowDefault[PHASE_TRANSLATING][ALLOW_STOP_REVISING] = false;
        this.workflowDefault[PHASE_TRANSLATING][ALLOW_REJECT] = false;

        this.workflowDefault[PHASE_TRANSLATED] = {};
        this.workflowDefault[PHASE_TRANSLATED][ALLOW_START_TRANSLATING] = false;
        this.workflowDefault[PHASE_TRANSLATED][ALLOW_STOP_TRANSLATING] = false;
        this.workflowDefault[PHASE_TRANSLATED][ALLOW_START_REVISING] = true;
        this.workflowDefault[PHASE_TRANSLATED][ALLOW_STOP_REVISING] = false;
        this.workflowDefault[PHASE_TRANSLATED][ALLOW_REJECT] = false;

        this.workflowDefault[PHASE_REVISING] = {};
        this.workflowDefault[PHASE_REVISING][ALLOW_START_TRANSLATING] = false;
        this.workflowDefault[PHASE_REVISING][ALLOW_STOP_TRANSLATING] = false;
        this.workflowDefault[PHASE_REVISING][ALLOW_START_REVISING] = false;
        this.workflowDefault[PHASE_REVISING][ALLOW_STOP_REVISING] = true;
        this.workflowDefault[PHASE_REVISING][ALLOW_REJECT] = false;

        this.workflowDefault[PHASE_REVISED] = {};
        this.workflowDefault[PHASE_REVISED][ALLOW_START_TRANSLATING] = false;
        this.workflowDefault[PHASE_REVISED][ALLOW_STOP_TRANSLATING] = false;
        this.workflowDefault[PHASE_REVISED][ALLOW_START_REVISING] = false;
        this.workflowDefault[PHASE_REVISED][ALLOW_STOP_REVISING] = false;
        this.workflowDefault[PHASE_REVISED][ALLOW_REJECT] = false;
    },

    initTMs: function() {
        // When hyrbid mode
        this.translation_mode = TRANSLATOR_MODE_HYBRID;
        this.match_tm_names = [];

        // When normal mode
        //this.translation_mode = TRANSLATOR_MODE_MT;
        //this.match_tm_names = ["default"];

        this.match_local = true;

        /* Show matches from these places */
        this.match_tm_metrics = {};
        this.match_tm_metrics[MATCH_ORIGIN_LOCAL] = true;
        this.match_tm_metrics[MATCH_ORIGIN_LEVENSHTEIN] = true;
        this.match_tm_metrics[MATCH_ORIGIN_SHAREDSUBPARTS] = false;

        /* Get synonyms from these places */
        this.synonym_tm_metrics = {};
        this.synonym_tm_metrics[MATCH_ORIGIN_LOCAL] = false;
        this.synonym_tm_metrics[MATCH_ORIGIN_LEVENSHTEIN] = true;
        this.synonym_tm_metrics[MATCH_ORIGIN_SHAREDSUBPARTS] = false;
    },

    setMode: function(mode) {
        this.mode = mode;

        if(mode === MODE_INTELLIGIBLE) {
            this.setModeIntelligible();
        } else if(mode === MODE_SIMPLE) {
            this.setModeSimple();
        } else {
            console.log("Invalid mode selected");
        }
    },

    setModeSimple: function() {
        this.match_show_replacements = false;
        this.match_show_details = false;
        this.match_show_pretrans = false;
        this.match_show_num = 10;

        this.segment_show_difficulty = false;
        this.segment_show_mt_icon = false;
        this.synonym_show_details = false;

        this.filter_show_responsibilities = false;
        this.filter_show_phase = false;
        this.filter_show_difficulty = false;
        this.filter_show_shortcuts = true;

        this.cache_use_files_mt = true;
        this.cache_use_memory_mt = true;
        this.cache_use_files_tm = true;
        this.cache_use_memory_tm = true;

        this.progress_show_related = false;

        this.highlight_navigable = false;
        this.highlight_selected = false;
        this.highlight_shortcuts = false;
        this.highlight_scroll = false;

        this.grammar_errors = false;
    },

    setModeIntelligible: function() {
        this.match_show_replacements = true;
        this.match_show_details = true;
        this.match_show_pretrans = true;

        this.segment_show_difficulty = true;
        this.segment_show_mt_icon = true;
        this.synonym_show_details = true;

        this.filter_show_responsibilities = true;
        this.filter_show_phase = true;
        this.filter_show_difficulty = true;
        this.filter_show_shortcuts = true;

        this.cache_use_files_mt = true;
        this.cache_use_memory_mt = true;
        this.cache_use_files_tm = true;
        this.cache_use_memory_tm = true;

        this.progress_show_related = true;

        this.highlight_navigable = true;
        this.highlight_selected = true;
        this.highlight_shortcuts = true;
        this.highlight_scroll = true;

        this.grammar_errors = true;
    },

    setFilterShowDifficulty: function(enabled) {
        logger.log("config;filter_difficulty;" + enabled);
        this.filter_show_difficulty = enabled;
        this.observers.configurationChanged();
    },

    setFilterShowResponsibilities: function(enabled) {
        logger.log("config;filter_responsibility;" + enabled);
        this.filter_show_responsibilities = enabled;
        this.observers.configurationChanged();
    },

    setFilterShowProgress: function(enabled) {
        logger.log("config;filter_progress;" + enabled);
        this.filter_show_phase = enabled;
        this.observers.configurationChanged();
    },

    setShowShortcuts: function(enabled) {
        logger.log("config;shortcuts;" + enabled);
        this.filter_show_shortcuts = enabled;
        this.observers.configurationChanged();
    },

    setWorkflowAllowTranslatingWhenTranslated: function(enabled) {
        logger.log("config;workflow_translating_when_translated;" + enabled);
        this.workflow[PHASE_TRANSLATED][ALLOW_START_TRANSLATING] = enabled;
        this.observers.configurationChanged();
    },

    setWorkflowAllowRevisingWhenTranslated: function(enabled) {
        logger.log("config;workflow_revising_when_translated;" + enabled);
        this.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING] = enabled;
        this.workflow[PHASE_REVISING][ALLOW_STOP_REVISING] = enabled;

        if(enabled == false) {
            this.workflow[PHASE_REVISING][ALLOW_REJECT] = false;
            this.workflow[PHASE_REVISED][ALLOW_START_REVISING] = false;
        }

        this.observers.configurationChanged();
    },

    setWorkflowAllowTranslatingWhenRevising: function(enabled) {
        logger.log("config;workflow_translating_when_revising;" + enabled);
        this.workflow[PHASE_REVISING][ALLOW_REJECT] = enabled;
        this.observers.configurationChanged();
    },

    setWorkflowAllowRevisingWhenRevised: function(enabled) {
        logger.log("config;workflow_revising_when_revising;" + enabled);
        this.workflow[PHASE_REVISED][ALLOW_START_REVISING] = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityShowDifficulty: function(enabled) {
        logger.log("config;difficulty;" + enabled);
        this.segment_show_difficulty = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityShowMatchContext: function(enabled) {
        logger.log("config;match_context;" + enabled);
        this.match_show_details = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityShowAltMetrics: function(enabled) {
        logger.log("config;alt_metrics;" + enabled);
        this.synonym_show_details = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityShowPretrans: function(enabled) {
        logger.log("config;pretrans;" + enabled);
        this.match_show_pretrans = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityHighlightExamples: function(enabled) {
        logger.log("config;highlight_examples;" + enabled);
        this.highlight_navigable = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityHighlightSelection: function(enabled) {
        logger.log("config;highlight_selection;" + enabled);
        this.highlight_selected = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityScroll: function(enabled) {
        logger.log("config;scroll;" + enabled);
        this.highlight_scroll = enabled;
        this.observers.configurationChanged();
    },

    setIntelligibilityGrammarErrors: function(enabled) {
        logger.log("config;grammar;" + enabled);
        this.grammar_errors = enabled;
        this.observers.configurationChanged();
    },

    setWorkflowForced: function (enabled) {
        logger.log("config;workflow;" + enabled);
        this.workflowForced = enabled;
        this.observers.configurationChanged();
    }
};