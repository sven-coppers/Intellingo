function ProgressBarController(textController, translationTools, filters) {
    this.textController = textController;
    this.progressBar = new ProgressBar(this, translationTools, filters);
}

ProgressBarController.prototype = {
    /**
     * What has to happen when a segment is selected in the progressBar
     * @param segmentIndex
     */
    segmentSelected: function(segmentIndex) {
        this.textController.selectSegment(segmentIndex, EVENT_CANCEL);
    },

    /**
     * What has to happen when a segment is hovered in the progressBar
     * @param segmentIndex
     */
    segmentPreviewed: function(segmentIndex) {
        this.textController.previewSegment(segmentIndex);
    }
};