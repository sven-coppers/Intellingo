var TRANSLATOR_MODE_MT = "translator_mode_mt";              // Extra call to the fuzzy matcher needed
var TRANSLATOR_MODE_PRETRANS = "translator_mode_pretrans";  // Extra call to the fuzzy matcher needed
var TRANSLATOR_MODE_HYBRID = "translator_mode_hybrid";      // Already includes the fuzzy matches

function TranslationTools() {
    // Cache
    this.MTCache = new MachineTranslationCache();
    this.TMCache = new MatchCache();

    // Sub models
    this.progressData = new ProgressData(this);
    this.staffData = new StaffData();
    this.termBase = new TermBase(this);
    this.machineTranslator = new MachineTranslator(this);
    this.matchAggregator = new MatchAggregator(this);
    this.glossarymanager = new ContextGlossaryManager(this);
    this.hybridTranslator = new HybridTranslator(this);
    this.qualityService = new QualityService(this);

    this.termBaseFinished = false;
    this.progressFinished = false;

    this.observers = new ObservableTranslationTools();
}

TranslationTools.prototype = {
    loadSegmentContext: function (segmentIndex) {
        if(config.translation_mode == TRANSLATOR_MODE_MT) {
            this.machineTranslator.loadTranslation(segmentIndex);
            this.matchAggregator.loadMatches(segmentIndex);
        } else if(config.translation_mode == TRANSLATOR_MODE_HYBRID) {
            this.matchAggregator.loadMatches(segmentIndex);
            this.hybridTranslator.loadTranslation(segmentIndex);
        } else {
            logger.log(segmentIndex, "Unknown translation mode (" + config.translation_mode + ")");
        }

        this.qualityService.findQuality(segmentIndex);
    },

    getMTCache: function () {
        return this.MTCache;
    },

    getTMCache: function () {
        return this.TMCache;
    },

    getContextGlossaryManager: function () {
        return this.glossarymanager;
    },

    getProgressData: function() {
        return this.progressData;
    },

    getStaffData: function() {
        return this.staffData;
    },

    getTermBase: function() {
        return this.termBase;
    },

    getMachineTranslator: function() {
        return this.machineTranslator;
    },

    getMatchAggregator: function() {
        return this.matchAggregator;
    },

    getQualityService: function() {
        return this.qualityService;
    },

    getHybridTranslator: function () {
        return this.hybridTranslator;
    },

    getNumSegments: function() {
        return this.progressData.getNumTasks();
    },

    termBaseLoaded: function() {
        this.termBaseFinished = true;
        this.testFinishedLoading();
    },

    progressLoaded: function() {
        this.progressFinished = true;
        this.testFinishedLoading();
    },

    testFinishedLoading: function() {
        if(this.termBaseFinished && this.progressFinished) {
            this.observers.translationToolsLoaded();
        }
    },

    reset: function() {
        this.MTCache.reset();
        this.TMCache.reset();
    }
};