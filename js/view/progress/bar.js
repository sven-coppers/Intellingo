function ProgressBar(progressBarController, translationTools, filters) {
    this.progressBarController = progressBarController;
    this.filters = filters;

    this.progress = translationTools.getProgressData();
    this.staff = translationTools.getStaffData();

    this.minScrollHeight = 0;
    this.maxScrollHeight = 0;

    config.observers.register(this);
    translationTools.observers.register(this);
    this.filters.observers.register(this);
    this.progress.observers.register(this);
}

ProgressBar.prototype = {
    /**
     * Observer: The translationTools have been loaded
     */
    translationToolsLoaded: function() {
        this.initTasks();
        this.initTooltip();
        this.initTaskSelection();
        this.initUserSelection();
        this.initZoom();
        this.updateSegmentVisibilityAll();
        this.updateVisibleFiltersAll();
        this.applyConfiguration();
    },

    /**
     * The configuration has been changed
     */
    configurationChanged: function() {
        this.applyConfiguration();
    },

    /**
     * The segment with this index has changed
     * @param segmentIndex
     */
    segmentChanged: function(segmentIndex) {
        this.updateSegment(segmentIndex);
        this.updateSegmentVisibility(segmentIndex);
        this.updateVisibleFiltersAll();
    },

    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        var taskID = this.progress.getSegment(newSegmentIndex)["segment_id"];
        $("#selected_tooltip").remove();
        $("#selected_working_line").remove();

        var element = $(".segment_translation:eq(" + newSegmentIndex + ")");

        element.append('<div class="active_line" id="selected_working_line"></div><div id="selected_tooltip"><h1>' + taskID + '</h1></div>');
        this.updateRelatedTasks(newSegmentIndex, true);
        this.scrollToSegment(newSegmentIndex);
    },

    /**
     * Observer: The preview changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    previewChanged: function(newSegmentIndex, oldSegmentIndex) {
        if(newSegmentIndex >= 0) {
            var segment = this.progress.getSegment(newSegmentIndex);
            var tooltipSpan = document.getElementById('tooltip');
            var taskElement = $(".segment:eq(" + newSegmentIndex + ")");

            var y = taskElement.position().top + (taskElement.height() / 2 ) + 12;
            tooltipSpan.style.top = y + 'px';
            tooltipSpan.style.left = (140) + 'px';

            $("#tooltip").removeClass("hidden");
            $("#tooltip_id").html(segment["segment_id"]);

            taskElement.find(".segment_hover").addClass("active");
        } else {
            $(".segment_hover").removeClass("active");
            $("#tooltip").addClass("hidden");
        }
    },

    initTasks: function() {
        for (var segmentIndex = 0; segmentIndex < this.progress.getNumTasks(); segmentIndex++) {
            $(".task_container").append(this.taskToHTML());
            this.updateSegment(segmentIndex);
        }

        $(".segment").height(100 / this.progress.getNumTasks() + "%");
    },

    /**
     * Generate all HTML that is used to represent a task in the progress bar
     * @returns {string}
     */
    taskToHTML: function() {
        var html = "";

        html += '<div class="segment">';
        html += '   <div class="segment_translation">';
        html += '       <div class="segment_responsibility"></div>';
        html += '       <div class="segment_difficulty"></div>';
        html += '       <div class="segment_progress"></div>';
        html += '       <div class="segment_hover"></div>';
        html += '       <div class="segment_empty">';
        html += '           <div class="segment_empty_filler"></div>';
        html += '       </div>';
        html += '    </div>';
        html += '   <div class="segment_revision">';
        html += '       <div class="segment_responsibility"></div>';
        html += '       <div class="segment_difficulty"></div>';
        html += '       <div class="segment_progress"></div>';
        html += '       <div class="segment_hover"></div>';
        html += '       <div class="segment_empty">';
        html += '           <div class="segment_empty_filler"></div>';
        html += '       </div>';
        html += '    </div>';
        html += '</div>';

        return html;
    },

    updateSegment: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);

        this.updateDifficulty(segmentIndex, segment["difficulty"]);
        this.updatePhase(segmentIndex, segment["phase"]);
        this.updateTranslators(segmentIndex, segment["translator"], segment["revisor"]);
    },

    updateDifficulty: function(segmentIndex, difficulty) {
        var parent = $(".segment:eq(" + segmentIndex + ")");
        var targets = parent.find(".segment_difficulty");

        // Remove old class
        targets.removeClass("difficulty_easy difficulty_moderate difficulty_hard");

        if(difficulty === DIFFICULTY_EASY) {
            targets.addClass("difficulty_easy");
        } else if(difficulty === DIFFICULTY_MODERATE) {
            targets.addClass("difficulty_moderate");
        } else if(difficulty === DIFFICULTY_HARD) {
            targets.addClass("difficulty_hard");
        }
    },

    updatePhase: function(segmentIndex, phase) {
        var parent = $(".segment:eq(" + segmentIndex + ")");
        var translationElement = parent.find(".segment_translation .segment_progress");
        var revisionElement = parent.find(".segment_revision .segment_progress");

        if(phase === PHASE_TRANSLATED) {
            translationElement.toggleClass("ready", true);
        } else if(phase === PHASE_REVISED) {
            translationElement.toggleClass("ready", true);
            revisionElement.toggleClass("ready", true);
        } else if(phase == PHASE_INITIALISED) {
            translationElement.toggleClass("ready", false);
            revisionElement.toggleClass("ready", false);
        }

        if(phase === PHASE_TRANSLATING) {
            // Show that someone is working here
            /*if(task.phase === "TRANSLATING" && translatorID != currentUserID) {
                html += '       <div class="working_line"></div>';
                html += '       <img class="user_translating_icon" src="img/icon-user' + translatorIndex + '.png" />';
            }*/
        }

        if(phase == PHASE_REVISING) {
            // Show that someone is working here
            /*if(task.phase === "REVISING" && revisorID != currentUserID) {
                html += '       <div class="working_line"></div>';
                html += '       <img class="user_revising_icon" src="img/icon-user' + revisorIndex + '.png" />';
            }*/
        }
    },

    updateTranslators: function(segmentIndex, translatorID, revisorID) {
        var parent = $(".segment:eq(" + segmentIndex + ")");
        var translationElement = parent.find(".segment_translation .segment_responsibility");
        var revisionElement = parent.find(".segment_revision .segment_responsibility");

        var translatorIndex = this.staff.getStaffIndexByID(translatorID);
        var revisorIndex = this.staff.getStaffIndexByID(revisorID);

        translationElement.removeClass("user0 user1 user2 user3 user4");
        translationElement.addClass("user" + translatorIndex);

        revisionElement.removeClass("user0 user1 user2 user3 user4");
        revisionElement.addClass("user" + revisorIndex);
    },

    /**
     * Enable selection functionality
     */
    initTaskSelection: function() {
        var thisObject = this; // 'this' will be overwritten

        $(".segment_translation").click(function() {
            if(!$(this).parent().hasClass("hidden")) {
                thisObject.progressBarController.segmentSelected($(this).parent().index(), EVENT_CANCEL);
            }

        });

        $(".segment_revision").click(function() {
            if(!$(this).parent().hasClass("hidden")) {
                thisObject.progressBarController.segmentSelected($(this).parent().index(), EVENT_CANCEL);
            }
        });
    },

    initUserSelection: function() {
        $("#progress_translators_stats .user_row").click(function() {
            var userclass = $(this).attr("class").split(' ')[1];
            $(".translate_task ." + userclass).toggleClass("hidden");
            $(this).toggleClass("user_selected");
        });

        $("#progress_revisors_stats .user_row").click(function() {
            var userclass = $(this).attr("class").split(' ')[1];
            $(".revise_task ." + userclass).toggleClass("hidden");
            $(this).toggleClass("user_selected");
        });
    },

    /**
     * Enable tooltips
     * @param tasks all loaded tasks
     */
    initTooltip: function() {
        var thisObject = this; // 'this' will be overwritten

        $(".segment").mousemove(function(event) {
            if(!$(this).hasClass("hidden")) {
                thisObject.progressBarController.segmentPreviewed($(this).index());
            }
        });

        $(".segment").hover(
            function(event) {
                if(!$(this).hasClass("hidden")) {
                    thisObject.progressBarController.segmentPreviewed($(this).index());
                }
            }, function() {
                thisObject.progressBarController.segmentPreviewed(-1);
            }
        );
    },

    updateRelatedTasks: function(taskIndex, isTranslationTask) {
        this.clearRelatedTasks();

        if(config.progress_show_related) {
            var relatedTasks = this.progress.getRelatedTasks(taskIndex, isTranslationTask);

            // Find related elements and visualise them
            for(var i = 0; i < relatedTasks.length; i++) {
                var relatedTaskID = relatedTasks[i];

                if(relatedTaskID > 250) {
                    return;
                }

                var segment = this.progress.getSegmentByID(relatedTaskID);

                var equal = segment.source === this.progress.getSegment(taskIndex).source;

                this.addRelatedTasks(relatedTaskID - 1, isTranslationTask, equal);
            }
        }
    },

    clearRelatedTasks: function() {
        $(".related_line").remove();
        $(".related_icon").remove();
    },

    addRelatedTasks: function(taskIndex, isTranslationTask, isEqual) {
        var element;

        if(isTranslationTask) {
            element = $(".translate_task:eq(" + taskIndex + ")");
        } else {
            element = $(".revise_task:eq(" + taskIndex + ")");
        }

        if(isEqual) {
            element.append('<div class="related_line"></div><img class="related_icon" src="img/icon-identical.png" />');
        } else {
            element.append('<div class="related_line"></div><img class="related_icon" src="img/icon-header-links-1.png" />');
        }
    },

    initZoom: function() {
        this.minScrollHeight = $(".task_container").height();
        this.maxScrollHeight = this.minScrollHeight * 128; // pixels

        this.initZoomButtons();
        this.updateZoomButtons();
    },

    initZoomButtons: function() {
        var thisObject = this;

        $("#zoom_in").click(function() {
            if(!$("#zoom_in").hasClass('disabled')) {
                $(".task_container").height($(".task_container").height() * 2);
                thisObject.updateZoomButtons();
            }
        });

        $("#zoom_out").click(function() {
            if(!$("#zoom_out").hasClass('disabled')) {
                $(".task_container").height($(".task_container").height() / 2);
                thisObject.updateZoomButtons();
            }
        });
    },

    updateZoomButtons: function() {
        $("#zoom_out").toggleClass('disabled', $(".task_container").height() <= this.minScrollHeight);
        $("#zoom_in").toggleClass('disabled', $(".task_container").height() >= this.maxScrollHeight);
    },

    updateSegmentVisibilityAll: function() {
        for (var segmentIndex = 0; segmentIndex < this.progress.tasks.length; segmentIndex++) {
            this.updateSegmentVisibility(segmentIndex);
        }
    },

    updateSegmentVisibility: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);
        var shouldBeVisible = this.filters.shouldBeVisible(this.progress.getSegment(segmentIndex));
        $(".segment:eq(" + segmentIndex + ")").toggleClass("hidden", !shouldBeVisible);
    },

    updateVisibleFiltersAll: function () {
        for (var segmentIndex = 0; segmentIndex < this.progress.tasks.length; segmentIndex++) {
            this.updateVisibleFilters(segmentIndex);
        }
    },

    updateVisibleFilters: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);

        var parent = $(".segment:eq(" + segmentIndex + ")");

        parent.find(".segment_difficulty").toggleClass("hidden", true);
        parent.find(".segment_progress").toggleClass("hidden", !this.filters.isProgressViewEnabled());
        parent.find(".segment_translation .segment_responsibility").toggleClass("hidden", !(this.filters.isResponsibilitiesViewEnabled() && this.filters.isUserEnabled(segment["translator"] - 1)));
        parent.find(".segment_revision .segment_responsibility").toggleClass("hidden", !(this.filters.isResponsibilitiesViewEnabled() && this.filters.isUserEnabled(segment["revisor"] - 1)));
    },

    /**
     * Observer: visible difficulty has changed
     */
    difficultyChanged: function () {
        this.updateSegmentVisibilityAll();
    },

    /**
     * Observer: visible phases have changed
     */
    phaseChanged: function () {
        this.updateSegmentVisibilityAll();

        //$(".segment_progress").toggleClass("hidden", !this.filters.isProgressViewEnabled());
    },

    /**
     * Observer: visible users have changed
     */
    userChanged: function() {
        this.updateSegmentVisibilityAll();
        this.updateVisibleFiltersAll();

        for(var i = 0; i < 5; i++) {
           // $(".segment_responsibility.user" + i).toggleClass("hidden", !this.filters.isResponsibilitiesViewEnabled() || !this.filters.isUserEnabled(i));
            //$(".revise_task .user" + i).toggleClass("hidden", !this.filters.isUserEnabled(i));
        }
    },

    scrollToSegment: function(newSegmentIndex) {
        /*var parentSegment = $('div.progress_container');
        var targetSegment = $(".segment:eq(" + newSegmentIndex + ")");

        parentSegment.animate({
            scrollTop: (parentSegment.scrollTop() + $(".task_header").height() + targetSegment.position().top
            - parentSegment.height()/2 + targetSegment.height()/2)
        }, 500); */
    },

    applyConfiguration: function() {
        $(".progress_bar").toggleClass("no_revision", !config.workflow[PHASE_TRANSLATED][ALLOW_START_REVISING]);
    }
};