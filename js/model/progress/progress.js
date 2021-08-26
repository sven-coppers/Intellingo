var PHASE_INITIALISED   = "INITIALISED";
var PHASE_TRANSLATING   = "TRANSLATING";
var PHASE_TRANSLATED    = "TRANSLATED";
var PHASE_REVISING      = "REVISING";
var PHASE_REVISED       = "REVISED";

var DIFFICULTY_EASY     = "easy";
var DIFFICULTY_MODERATE = "moderate";
var DIFFICULTY_HARD     = "hard";

var PROGRESS_SAVE_URL = "api/save_progress.php";

function ProgressData(translationTools) {
    this.observers = new ObservableProgress();

    this.translationTools = translationTools;

    this.selectedSegmentIndex = -1; // Index = 0 is the first task
    this.previewSegmentIndex = -1;
    this.tasks = null;

    this.load();
}

ProgressData.prototype = {
    load: function() {
        if(config.restart) {
            this.loadProgress("data/" + config.dataFolder + "/progress.json");
        } else {
            this.loadProgress("users/" + config.group + "_" + config.user + "_" + config.dataFolder + "_" + config.mode + "_progress.json");
        }
    },

    loadProgress: function(file) {
        var thisObject = this;
        d3.json(file, function(json) {
            logger.log("Progress loaded from " + file);
            thisObject.processLoaded(json);
        });
    },

    processLoaded: function(json) {
        if(json == null) {
            $(".loading").html("<p>Could not load progress</p>");
            logger.log("Could not load progress");
            return;
        }

        this.tasks = json.slice(0, config.max_num_segments);

        for(var i = 0; i < this.tasks.length; i++) {
            if(this.tasks[i]["target"].length > 0) {
                this.tasks[i]["target"] += " ";
            }

            var length = this.tasks[i]["source"].length;

            if(length < 60) {
                this.tasks[i]["difficulty"] = DIFFICULTY_EASY;
            } else if(length < 100) {
                this.tasks[i]["difficulty"] = DIFFICULTY_MODERATE;
            } else {
                this.tasks[i]["difficulty"] = DIFFICULTY_HARD;
            }

            if(typeof this.tasks[i]["replaced_tokens"] === "undefined") {
                this.tasks[i]["replaced_tokens"] = {};
            }
        }

        if(this.tasks.length > 0) {
            this.selectedSegmentIndex = -1;
        }

        this.translationTools.progressLoaded();
    },

    getSelectedSegment: function() {
        return this.selectedSegmentIndex;
    },

    getPreviewSegment: function() {
        return this.previewSegmentIndex;
    },

    selectSegment: function(newSegmentIndex) {
        var oldSegmentIndex = this.selectedSegmentIndex;
        this.selectedSegmentIndex = newSegmentIndex;
        this.observers.selectionChanged(newSegmentIndex, oldSegmentIndex);
    },

    previewSegment: function(segmentIndex) {
        var oldPreviewIndex = this.previewSegmentIndex;
        this.previewSegmentIndex = segmentIndex;
        this.observers.previewChanged(segmentIndex, oldPreviewIndex);
    },

    getNumTasks: function() {
        return this.tasks.length;
    },

    getRelatedTasks: function(segmentIndex) {
        return this.tasks[segmentIndex]["related_segments"];
    },

    getSegment: function(segmentIndex) {
        return this.tasks[segmentIndex];
    },

    getSegmentByID: function(segmentIndex) {
        for(var i = 0; i < this.tasks.length; i++) {
            if(this.tasks[i].segment_id == segmentIndex) {
                return this.tasks[i];
            }
        }

        return null;
    },

    getSegmentsIDsInTranslationUnit: function(translationUnitID) {
        var result = [];

        for(var i = 0; i < this.tasks.length; i++) {
            if(this.tasks[i].translation_unit_id == translationUnitID) {
                result.push(this.tasks[i].segment_id);
            }
        }

        return result;
    },

    isFirstSegmentInTranslationUnit: function(segmentIndex, translationUnitID) {
        var segmentIDs = this.getSegmentsIDsInTranslationUnit(translationUnitID);

        return segmentIDs[0] == segmentIndex;
    },

    isLastSegmentInTranslationUnit: function(segmentIndex, translationUnitID) {
        var segmentIDs = this.getSegmentsIDsInTranslationUnit(translationUnitID);

        return segmentIDs[segmentIDs.length - 1] == segmentIndex;
    },

    setPhase: function(segmentIndex, phase) {
        logger.log("Changed phase from '" + this.tasks[segmentIndex]["phase"] + "' to '" + phase + "'", segmentIndex);
        this.tasks[segmentIndex]["previous_phase"] = this.tasks[segmentIndex]["phase"];
        this.tasks[segmentIndex]["phase"] = phase;

        this.observers.segmentChanged(segmentIndex);
    },

    setTranslation: function(segmentIndex, translation) {
        this.tasks[segmentIndex]["target"] = translation;

        this.observers.segmentChanged(segmentIndex);
        this.saveProgress();
    },

    machineSuggestionOverWritten: function(segmentIndex, destTokenIndex, oldContent, newContent) {
        logger.log("Used synonym '" + newContent + "' instead of '" + oldContent + "' (machine suggestion), tokenIndex =  " + destTokenIndex, segmentIndex);
        this.tasks[segmentIndex]["replaced_tokens"][destTokenIndex] = oldContent;
    },

    isUserReady: function() {
        if(this.getNumTasks() == 0) return false;

        for(var i = 0; i < this.getNumTasks(); i++) {
            if(this.getSegment(i)["phase"] == PHASE_INITIALISED ||
                this.getSegment(i)["phase"] == PHASE_TRANSLATING) {
                return false;
            }
        }

        return true;
    },

    saveProgress: function () {
        var data = {"user": config.user, "group": config.group, "mode": config.mode, "data": config.dataFolder, "progress": this.tasks};

      /* $.post(PROGRESS_SAVE_URL, JSON.stringify(data))
            .done(function(jsonResponse) {
                console.log("Progress saved successfully" + jsonResponse);
            })
            .fail(function(response) {
                console.log("Progress saving failed" + "(" + response + ")");
            });*/
    }
};