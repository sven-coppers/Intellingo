var EVENT_SAVE = "SAVE";
var EVENT_CANCEL = "CANCEL";

function TextController(translationTools, filters) {
    this.progress = translationTools.getProgressData();
    this.staffData = translationTools.getStaffData();
    this.filters = filters;
}

TextController.prototype = {
    previewSegment: function(newSegmentIndex) {
        var oldSegmentIndex = this.progress.getPreviewSegment();

        if(newSegmentIndex != oldSegmentIndex) {
            this.progress.previewSegment(newSegmentIndex);
        }
    },

    selectSegment: function(newSegmentIndex, event) {
        event = typeof event !== "undefined" ? event : EVENT_CANCEL;
        var oldSegmentIndex = this.progress.getSelectedSegment();

        var workflow = config.workflowDefault;

        // Override default workflow when it needs to be forced
        if(config.workflowForced) {
            workflow = config.workflow;
        }

        if(newSegmentIndex != oldSegmentIndex) {
            if(oldSegmentIndex >= 0) {
                this.stopEditingSegment(oldSegmentIndex, event);
            }

            this.progress.selectSegment(newSegmentIndex);

            logger.log("Moved from segment " + oldSegmentIndex + " to " + newSegmentIndex + " (USER CANCELLED)");

            // Set phase of the new segment
          // this.startEditingSegment(newSegmentIndex);

            var segment = this.progress.getSegment(newSegmentIndex);
            var phase = segment["phase"];

            if(workflow[phase][ALLOW_START_TRANSLATING]) {
                if(!config.workflowForced || segment["translator"] == this.staffData.currentUserID) {
                    this.startTranslating(newSegmentIndex);
                }
            } else if(workflow[phase][ALLOW_START_REVISING]) {
                if(!config.workflowForced || segment["revisor"] == this.staffData.currentUserID) {
                    this.startRevising(newSegmentIndex);
                }
            }
        }
    },

    startTranslating: function (segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);
        this.progress.setPhase(segmentIndex, PHASE_TRANSLATING);
    },

    stopTranslating: function (segmentIndex, event) {
        var segment = this.progress.getSegment(segmentIndex);

        if(event != EVENT_SAVE && typeof segment["previous_phase"] !== 'undefined' && segment["phase"] != PHASE_REVISED) {
            this.progress.setPhase(segmentIndex, segment["previous_phase"]);
        }
    },

    startRevising: function (segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);
        this.progress.setPhase(segmentIndex, PHASE_REVISING);
    },

    stopRevising: function (segmentIndex, event) {
        var segment = this.progress.getSegment(segmentIndex);

        if(event != EVENT_SAVE && typeof segment["previous_phase"] !== 'undefined' && segment["phase"] != PHASE_REVISED) {
            this.progress.setPhase(segmentIndex, segment["previous_phase"]);
        }
    },

    stopEditingSegment: function(segmentIndex, event) {
        var segment = this.progress.getSegment(segmentIndex);

        if(event != EVENT_SAVE && typeof segment["previous_phase"] !== 'undefined' && segment["phase"] != PHASE_REVISED) {
            this.progress.setPhase(segmentIndex, segment["previous_phase"]);
        }
    },

    startEditingSegment: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);

        if(segment["phase"] === PHASE_INITIALISED) {
            this.progress.setPhase(segmentIndex, PHASE_TRANSLATING);
        } else if(segment["phase"] === PHASE_TRANSLATED || segment["phase"] === PHASE_REVISED) {
            this.progress.setPhase(segmentIndex, PHASE_REVISING);
        }
    },

    selectNextSegment: function(event) {
        for(var i = this.progress.selectedSegmentIndex + 1; i < this.progress.getNumTasks(); i++) {
            if(this.filters.shouldBeVisible(this.progress.getSegment(i))) {
                this.selectSegment(i, event);
                return;
            }
        }
    },

    selectPreviousSegment: function (event) {
        for(var i = this.progress.selectedSegmentIndex - 1; i >= 0 ; i--) {
            if(this.filters.shouldBeVisible(this.progress.getSegment(i))) {
                this.selectSegment(i, event);
                return;
            }
        }
    }
};
