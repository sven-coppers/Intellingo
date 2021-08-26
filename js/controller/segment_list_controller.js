function SegmentListController(textController, translationTools, filters) {
    // Super controllers
    this.textController = textController;

    // Models
    this.progress = translationTools.getProgressData();

    // Sub Controllers
    this.segmentController = new SegmentController(textController, translationTools, filters);

    // Views
    this.segmentListView = new SegmentListView(this, translationTools, filters);
}

SegmentListController.prototype = {
    initSegments: function () {
        for (var segmentIndex = 0; segmentIndex < this.progress.tasks.length; segmentIndex++) {
            this.segmentController.initSegment(segmentIndex);
        }
    },

    selectSegment: function(segmentIndex) {
        this.textController.selectSegment(segmentIndex);
    },

    previewSegment: function(segmentIndex) {
        this.textController.previewSegment(segmentIndex);
    },

    selectNextSegment: function() {
        this.textController.selectNextSegment();
    },

    selectPreviousSegment: function () {
        this.textController.selectPreviousSegment();
    }
};