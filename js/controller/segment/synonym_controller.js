function SynonymController(translationTools)  {
    this.synonymView = new SynonymView(this, translationTools);

    this.MT = translationTools.getMachineTranslator();
    this.matcher = translationTools.getMatchAggregator();
    this.glossaryManager = translationTools.getContextGlossaryManager();

    this.navigationController = null; // Initialised by segmentController
}

SynonymController.prototype = {
    bindBehaviour: function (segmentIndex) {
        this.synonymView.bindBehaviour(segmentIndex);
    },

    updateGlossary: function (segmentIndex) {
        this.glossaryManager.updateContextGlossary(segmentIndex);
    },

    /**
     * Replace all alternatives with this new list
     * @param segmentIndex
     * @param alternatives
     */
    showAlternatives: function (segmentIndex, alternatives) {
        this.synonymView.showAlternatives(segmentIndex, alternatives);
    },

    /**
     * Select a new alternative token in the UI
     * @param segmentIndex
     * @param globalGroupIndex
     * @param alternativeIndex
     * @param relativeIndex
     */
    selectAlternative: function (segmentIndex, globalGroupIndex, alternativeIndex, relativeIndex) {
        this.synonymView.selectAlternative(segmentIndex, globalGroupIndex, alternativeIndex, relativeIndex);
    },

    /**
     * The user clicked an alternative token, or used the keyboard
     * @param segmentIndex
     * @param groupIndex
     * @param alternativeIndex
     * @param tokenIndex
     */
    alternativeSelected: function (segmentIndex, groupIndex, alternativeIndex, tokenIndex) {
        this.navigationController.alternativeSelected(segmentIndex, groupIndex, alternativeIndex, tokenIndex);
    },

    /**
     * The user hovered a synonym
     */
    alternativeHovered: function (segmentIndex, groupIndex, alternativeIndex, tokenIndex) {
        this.navigationController.previewSynonym(segmentIndex, groupIndex, alternativeIndex, tokenIndex);
    },

    /**
     * The user left a synonym
     */
    alternativeExited: function (segmentIndex, groupIndex, alternativeIndex, tokenIndex) {
        this.navigationController.stopPreviewSynonym(segmentIndex);
    },

    /**
     * Get the selected alternative token
     * @param segmentIndex
     * @returns {*}
     */
    getAlternativeSelection: function (segmentIndex) {
        return this.synonymView.getAlternativeSelection(segmentIndex);
    },

    /**
     * Only called by SynonymController
     * @param segmentIndex
     */
    selectLeftToken: function (segmentIndex) {
        this.navigationController.selectLeftToken(segmentIndex);
    },

    /**
     * Only called by SynonymController
     * @param segmentIndex
     */
    selectRightToken: function (segmentIndex) {
        this.navigationController.selectRightToken(segmentIndex);
    },

    /**
     * Called when by navigationController
     * @param segmentIndex
     */
    jumpRight: function (segmentIndex) {
        this.synonymView.jumpRight(segmentIndex);
    },

    /**
     * When a token is clicked that is already underlined
     * @param segmentIndex
     */
    tokenConfirmed: function (segmentIndex) {
        this.navigationController.tokenConfirmed(segmentIndex);
    }
};