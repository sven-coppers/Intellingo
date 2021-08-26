function Filters() {
    this.observers = new ObservableFilter();

    /* Sensible defaults */
    this.realTimeViewEnabled = true;
    this.responsibilitiesViewEnabled = false;
    this.progressViewEnabled = true;
    this.difficultyViewEnabled = true;
    this.showEmptySegments = true;
    this.showTranslatedSegments = true;
    this.showRevisedSegments = true;
    this.showEasySegments = true;
    this.showModerateSegments = true;
    this.showHardSegments = true;
    this.showUsers = [true, true, true, true, true];
}

Filters.prototype = {
    isProgressViewEnabled: function() {
        return this.progressViewEnabled;
    },

    isDifficultyViewEnabled: function() {
        return this.difficultyViewEnabled;
    },

    isRealTimeViewEnabled: function() {
        return this.realTimeViewEnabled;
    },

    isResponsibilitiesViewEnabled: function() {
        return this.responsibilitiesViewEnabled;
    },

    isInitialisedSegmentsViewEnabled: function() {
        return this.showEmptySegments;
    },

    isTranslatedSegmentsViewEnabled: function() {
        return this.showTranslatedSegments;
    },

    isRevisedSegmentsViewEnabled: function() {
        return this.showRevisedSegments;
    },

    isEasySegmentsViewEnabled: function() {
        return this.showEasySegments;
    },

    isModerateSegmentsViewEnabled: function() {
        return this.showModerateSegments;
    },

    isHardSegmentsViewEnabled: function() {
        return this.showHardSegments;
    },

    isUserEnabled: function(userIndex) {
        return this.showUsers[userIndex];
    },

    toggleEmptySegments: function(enabled) {
        this.showEmptySegments = enabled;
        this.observers.phaseChanged();
    },

    toggleTranslatedSegments: function(enabled) {
        this.showTranslatedSegments = enabled;
        this.observers.phaseChanged();
    },

    toggleRevisedSegments: function(enabled) {
        this.showRevisedSegments = enabled;
        this.observers.phaseChanged();
    },

    toggleEasySegments: function(enabled) {
        this.showEasySegments = enabled;
        this.observers.difficultyChanged();
    },

    toggleModerateSegments: function(enabled) {
        this.showModerateSegments = enabled;
        this.observers.difficultyChanged();
    },

    toggleHardSegments: function(enabled) {
        this.showHardSegments = enabled;
        this.observers.difficultyChanged();
    },

    toggleResponsibilitiesView: function(enabled) {
        this.responsibilitiesViewEnabled = enabled;
        this.observers.userChanged();
    },

    toggleRelatedView: function(enabled) {
        this.relatedViewEnabled = enabled;
        this.observers.relatedChanged(enabled);
    },

    toggleDifficultyView: function(enabled) {
        this.difficultyViewEnabled = enabled;
        this.observers.difficultyChanged();
    },

    toggleProgressView: function(enabled) {
        this.progressViewEnabled = enabled;
        this.observers.phaseChanged();
    },

    toggleUserEnabled: function(user, enabled) {
        this.showUsers[user] = enabled;
        this.observers.userChanged();
    },

    /**
     * Check if a segment should be shown
     * @param translationSegment
     * @returns {boolean|*}
     */
    shouldBeVisible: function(translationSegment) {
        var showDifficulty = this.shouldDifficultyBeVisible(translationSegment);
        var showPhase = this.shouldProgressBeVisible(translationSegment);
        var showUser = this.shouldResponsibilityBeVisible(translationSegment);

        return showDifficulty && showPhase && showUser;
    },

    shouldProgressBeVisible: function (translationSegment) {
        return ((translationSegment["phase"] === PHASE_INITIALISED || translationSegment["phase"] === PHASE_TRANSLATING) && this.isInitialisedSegmentsViewEnabled())
            || ((translationSegment["phase"] === PHASE_TRANSLATED || translationSegment["phase"] === PHASE_REVISING)&& this.isTranslatedSegmentsViewEnabled())
            || (translationSegment["phase"] === PHASE_REVISED && this.isRevisedSegmentsViewEnabled())
            || !this.isProgressViewEnabled();
    },

    shouldResponsibilityBeVisible: function (translationSegment) {
        return (this.isUserEnabled(translationSegment["translator"] - 1))
            || (this.isUserEnabled(translationSegment["revisor"] - 1))
            || !this.isResponsibilitiesViewEnabled();
    },

    shouldDifficultyBeVisible: function (translationSegment) {
        return (translationSegment["difficulty"] === "easy" && this.isEasySegmentsViewEnabled())
            || (translationSegment["difficulty"] ==="moderate" && this.isModerateSegmentsViewEnabled())
            || (translationSegment["difficulty"] === "hard" && this.isHardSegmentsViewEnabled())
            || !this.isDifficultyViewEnabled();
    }
};