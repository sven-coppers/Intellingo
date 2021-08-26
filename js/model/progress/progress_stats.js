function ProgressStats(progress) {
    this.progress = progress;
}

ProgressStats.prototype = {
    getNumTranslateResponsibilities: function(staffID) {
        var segments = this.progress.tasks;
        var result = 0;

        for(var i = 0; i < segments.length; i++) {
            if(segments[i].translator == staffID) {
                result++;
            }
        }

        return result;
    },

    getNumReviseResponsibilities: function(staffID) {
        var segments = this.progress.tasks;
        var result = 0;

        for(var i = 0; i < segments.length; i++) {
            if(segments[i].revisor == staffID) {
                result++;
            }
        }

        return result;
    },

    getNumCompletedTranslations: function(staffID) {
        var segments = this.progress.tasks;
        var result = 0;

        for(var i = 0; i < segments.length; i++) {
            if(segments[i].translator == staffID
                && (segments[i].phase === PHASE_TRANSLATED
                || segments[i].phase === PHASE_REVISING
                || segments[i].phase === PHASE_REVISED)) {
                result++;
            }
        }

        return result;
    },

    getNumCompletedRevisions: function(staffID) {
        var segments = this.progress.tasks;
        var result = 0;

        for(var i = 0; i < segments.length; i++) {
            if(segments[i].revisor == staffID && segments[i].phase === PHASE_REVISED) {
                result++;
            }
        }

        return result;
    }
};