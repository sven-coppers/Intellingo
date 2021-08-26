function SegmentController(textController, translationTools, filters) {
    // Super controller
    this.textController = textController;

    // Models
    this.translationTools = translationTools;
    this.progress = translationTools.getProgressData();

    // Views
    this.segmentView = new SegmentView(this, translationTools);

    // Sub controllers
    this.matchController = new MatchController(translationTools);
    this.synonymController = new SynonymController(translationTools);
    this.suggestionController = new SuggestionController(translationTools);
    this.highlightController = new HighlightController(translationTools);
    this.userTranslationController = new UserTranslationController(translationTools);
    this.autoCompleteController = new AutoCompleteController(translationTools);
    this.feedForwardController = new FeedForwardController(translationTools);
    this.navigationController = new NavigationController(translationTools);

    this.initDependencies();
}

SegmentController.prototype = {
    initDependencies: function () {
        this.suggestionController.userTranslationController = this.userTranslationController;

        this.userTranslationController.feedForwardController = this.feedForwardController;
        this.userTranslationController.autoCompleteController = this.autoCompleteController;

        this.feedForwardController.navigationController = this.navigationController;
        this.feedForwardController.userTranslationController = this.userTranslationController;

        this.autoCompleteController.navigationController = this.navigationController;
        this.autoCompleteController.userTranslationController = this.userTranslationController;
        this.autoCompleteController.synonymController = this.synonymController;

        this.synonymController.navigationController = this.navigationController;

        this.navigationController.matchController =  this.matchController;
        this.navigationController.synonymController = this.synonymController;
        this.navigationController.highlightController =  this.highlightController;
        this.navigationController.feedForwardController = this.feedForwardController;
        this.navigationController.autoCompleteController = this.autoCompleteController;
        this.navigationController.userTranslationController = this.userTranslationController;

        this.matchController.userTranslationController = this.userTranslationController;
    },

    initSegment: function(segmentIndex) {
        this.segmentView.initSegment(segmentIndex);
    },

    /**
     * Called when a new segment is selected and context needs to be loaded
     */
    loadSegmentContext: function (segmentIndex) {
        this.translationTools.loadSegmentContext(segmentIndex);
    },

    startTranslating: function(segmentIndex) {
        this.textController.selectSegment(segmentIndex);
        //this.textController.startTranslating(segmentIndex);
    },

    finishTranslating: function(segmentIndex) {
        var translation = this.userTranslationController.getUserTranslation(segmentIndex);

        if(translation.length > 0) {
            this.progress.setTranslation(segmentIndex, translation);
            this.progress.setPhase(segmentIndex, PHASE_TRANSLATED);

            logger.log("Translation confirmed", segmentIndex);

            this.textController.selectNextSegment(EVENT_SAVE);
        } else {
            this.userTranslationController.userTranslationEmptyFeedback(segmentIndex);
        }
    },

    startRevising: function(segmentIndex) {
        //this.textController.startRevising(segmentIndex);
        this.textController.selectSegment(segmentIndex);
    },

    finishRevising: function(segmentIndex) {
        var translation = this.userTranslationController.getUserTranslation(segmentIndex);

        if(translation.length > 0) {
            this.progress.setTranslation(segmentIndex, translation);
            this.progress.setPhase(segmentIndex, PHASE_REVISED);

            logger.log("Revision confirmed", segmentIndex);

            this.textController.selectNextSegment(EVENT_SAVE);
        } else {
            this.userTranslationController.userTranslationEmptyFeedback(segmentIndex);
        }
    },

    rejectRevising: function(segmentIndex) {
        logger.log("Translation rejected", segmentIndex);
        this.progress.setPhase(segmentIndex, PHASE_INITIALISED);
        this.textController.selectNextSegment(EVENT_SAVE);
    },

    /**
     * Bind the behaviour when a segment is being translated.
     *
     * The order of the function calls is important!
     */
    bindBehaviourWhenTranslating: function (segmentIndex) {
        this.segmentView.removeAllBehaviour(segmentIndex);
        this.segmentView.bindTranslatingBehaviour(segmentIndex);
        this.suggestionController.bindBehaviour(segmentIndex);
        this.navigationController.bindBehaviour(segmentIndex);
        this.synonymController.bindBehaviour(segmentIndex);
        this.userTranslationController.bindBehaviour(segmentIndex);
    },

    /**
     * Bind the behaviour when a segment is being revised.
     *
     * The order of the function calls is important!
     */
    bindBehaviourWhenRevising: function (segmentIndex) {
        this.segmentView.removeAllBehaviour(segmentIndex);
        this.segmentView.bindRevisingBehaviour(segmentIndex);
        this.suggestionController.bindBehaviour(segmentIndex);
        this.navigationController.bindBehaviour(segmentIndex);
        this.synonymController.bindBehaviour(segmentIndex);
        this.userTranslationController.bindBehaviour(segmentIndex);
    }
};