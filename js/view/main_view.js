function MainView(mainController) {
    this.translationTools = mainController.translationTools;
    this.filters = mainController.filters;
    this.progress = this.translationTools.getProgressData();
    this.progressStats = new ProgressStats(this.progress);

    this.translationTools.observers.register(this);
    this.filters.observers.register(this);
    this.progress.observers.register(this);
    config.observers.register(this);

    this.initResizability();
    this.initButtons();
}

MainView.prototype = {
    /**
     * Observer: The translationTools have been loaded
     */
    translationToolsLoaded: function() {
        this.initUserHovers();

        $(".loading").remove();
    },

    /**
     * Observer: visible difficulty has changed
     */
    difficultyChanged: function () {
        this.updateDifficicultyState();
    },

    /**
     * Observer: visible phases have changed
     */
    phaseChanged: function () {
        this.updatePhaseState();
    },

    /**
     * The segment with this index has changed
     * @param segmentIndex
     */
    segmentChanged: function(segmentIndex) {
        if(this.progress.isUserReady()) {
            var target = $(".inner-center");

            target.empty();
            //target.append('<p class="finished">All sentences are translated. Continue the experiment by clicking "I am done!" and answering "' + config.readyWord + '" to the question.</p>');
            target.append('<p class="finished">All sentences are translated. Continue the experiment by clicking "I am done!"</p>');
        }
    },

    /**
     * Observer: visible users have changed
     */
    userChanged: function() {
        this.updateUserState();
    },

    /**
     * The configuration has been changed
     */
    configurationChanged: function() {
        this.applyConfiguration();
    },

    initResizability: function() {
        var thisObject = this; // 'this' will be overwritten

        // OUTER-LAYOUT
        this.outerLayout = $('body').layout({
            center__paneSelector:	".outer-center"

            ,	spacing_open:			8  // ALL panes
            ,	spacing_closed:			12 // ALL panes
            ,	north__spacing_open:	0
            ,	north__spacing_closed:	0
            ,	north__minHeight:	    40
            ,   west__initClosed:       false
            ,   enableCursorHotkey:     false
        });

        // INNER-LAYOUT (child of middle-center-pane)
        this.innerLayout = $('.outer-center').layout({
            center__paneSelector:	".inner-center"
            ,	spacing_open:			2  // ALL panes
            ,	spacing_closed:			8  // ALL panes
            ,   north__paneSelector:    ".tip_container"
            ,	north__spacing_open:	1
            ,	north__spacing_closed:  0
            ,	south__spacing_closed:	0
            ,	south__spacing_open:	8
            ,   enableCursorHotkey:     false
            ,	south__size:			200
            ,   south__initClosed:      true
            ,	west__paneSelector:		".outer-west"
            ,	west__size:				220
            ,	west__maxSize:			250
            ,	west__minSize:			100
            ,	west__spacing_open:	    0
            ,	west__spacing_closed:   8
            ,   onclose_start:          function(paneName) {
                if(paneName === "south") {
                    thisObject.filters.toggleRelatedView(false);
                }
            }
            ,   onopen_start:           function(paneName) {
                if(paneName === "south") {
                    thisObject.filters.toggleRelatedView(true);
                }
            }
        });
    },

    applyConfiguration: function () {
        $("#responsibilities_button_group").toggleClass("hidden", !config.filter_show_responsibilities);
        $("#difficulty_button_group").toggleClass("hidden", !config.filter_show_difficulty);
        $("#phase_button_group").toggleClass("hidden", !config.filter_show_phase);

        $("#settings_button_group").toggleClass("hidden", !config.allow_config_changes);

        if(config.filter_show_shortcuts) {
            this.innerLayout.show("north");
        } else {
            this.innerLayout.hide("north");
        }
    },

    initButtons: function() {
        this.initResponsibilitiesButtons();
        this.initPhaseButtons();
        this.initDifficultyButtons();
        this.initConfigButton();
        //this.initShortcutsView();
        if (config.allow_uploading_files)
            this.initUploadButton();

        this.initButtonBehaviour();
        this.applyConfiguration();
    },

    initResponsibilitiesButtons: function() {
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="responsibilities_button_group"></div>');
        var parent = target.find("#responsibilities_button_group");

        parent.append('<a href="#" class="img_link" id="responsibilities_button" title="Responsibilities" ></a>');

        for(var i = 0; i < this.translationTools.getStaffData().getNumStaffMembers(); i++) {
            parent.append('<a href="#" class="img_link user_button" id="user' + i + '"></a>');
        }

        this.updateUserState();
    },

    initPhaseButtons: function () {
        var filters = this.filters; // 'this' will be overwritten
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="phase_button_group"></div>');
        var parent = target.find("#phase_button_group");

        //parent.append('<a href="#" class="img_link" id="phase_button" title="Phase" ></a>');

        parent.append('<a href="#" class="img_link" id="empty_button" title="Initialised segments" ></a>');
        parent.append('<a href="#" class="img_link" id="translated_button" title="Translated segments" ></a>');
        parent.append('<a href="#" class="img_link" id="revised_button" title="Revised segments" ></a>');

        /*$("#phase_button").click(function() {
            filters.toggleProgressView(!$(this).hasClass("active"));
        }); */

        $("#empty_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleEmptySegments(!$(this).hasClass("active"));
            }
        });

        $("#translated_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleTranslatedSegments(!$(this).hasClass("active"));
            }
        });

        $("#revised_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleRevisedSegments(!$(this).hasClass("active"));
            }
        });

        this.updatePhaseState();
    },

    initDifficultyButtons: function() {
        var filters = this.filters; // 'this' will be overwritten
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="difficulty_button_group"></div>');
        var parent = target.find("#difficulty_button_group");

        //parent.append('<a href="#" class="img_link" id="difficulty_button" title="Difficulty" ></a>');

        parent.append('<a href="#" class="img_link" id="difficulty_easy_button" title="Easy to translate segments" ></a>');
        parent.append('<a href="#" class="img_link" id="difficulty_moderate_button" title="Moderate to translate segments" ></a>');
        parent.append('<a href="#" class="img_link" id="difficulty_hard_button" title="Hard to translate segments" ></a>');

        /*$("#difficulty_button").click(function() {
            filters.toggleDifficultyView(!$(this).hasClass("active"));
        }); */

        $("#difficulty_easy_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleEasySegments(!$(this).hasClass("active"));
            }
        });

        $("#difficulty_moderate_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleModerateSegments(!$(this).hasClass("active"));
            }
        });

        $("#difficulty_hard_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                filters.toggleHardSegments(!$(this).hasClass("active"));
            }
        });

        this.updateDifficicultyState();
    },

    initConfigButton: function() {
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="settings_button_group"></div>');
        var parent = target.find("#settings_button_group");

        parent.append('<a href="#" class="img_link" id="settings_button" title="Settings" ></a>');

        $("#settings_button").click(function() {
            $("#config_panel").toggleClass("hidden");
            $("#settings_button").toggleClass("active");
        });
    },

    initUploadButton: function () {
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="upload_button_group"></div>');
        target.append('<form action="api/upload_sdlxliff.php" method="post" id="upload_form" enctype="multipart/form-data"></form>');

        /* Create upload button */
        var parent = target.find("#upload_button_group");
        parent.append('<a href="#" class="img_link" id="upload_button" title="Upload file" ></a>');
        // On clicking the upload button open trigger a click for the hidden input dialog
        $("#upload_button").click(function() {
            $("#input_upload").trigger("click");
        });

        /* Create hidden form for the uploading of the selected file */
        var form = target.find("#upload_form");
        // Add hidden file input to the form, so we can programmatically trigger it to open a file dialog
        form.append('<input type="file" id="input_upload" name="input_upload" accept=".sdlxliff" style="display: none" />');

        // When a file is selected in the dialog, submit the hidden form to the
        $("#input_upload").change(function() {
            // Show processing overlay
            $(".overlay").css('visibility', 'visible');
            // Submit the form (and thus file) to api/upload_sdlxliff.php
            $("#upload_form").submit();
        });
    },

    initButtonBehaviour: function() {
        var filters = this.filters; // 'this' will be overwritten

        $("#responsibilities_button").click(function() {
            filters.toggleResponsibilitiesView(!$(this).hasClass("active"));
        });

        $(".user_button").click(function() {
            if(!$(this).hasClass("disabled")) {
                var user = $(this).attr("id").replace("user", "");
                var enabled = !$(this).hasClass("active");
                filters.toggleUserEnabled(user, enabled);
            }
        });

        $("#related_button").click(function() {
            filters.toggleRelatedView(!$(this).hasClass("active"));
        });
    },

    initUserHovers: function() {
        var thisObject = this;

        $(".user_button").mouseenter(function() {
            var userIndex = $(this).attr("id").replace("user", "");
            thisObject.updateProgressTooltip(userIndex);
            $(".progress_tooltip").removeClass("hidden");

            var leftPosition = $(this).position().left;

            $(".progress_tooltip").css({left: leftPosition});
        });

        $("#responsibilities_button").mouseenter(function() {
            $(".progress_tooltip").removeClass("hidden");
            $(".progress_tooltip").css({left: 15});
        });

        $(".user_button, #responsibilities_button").mouseleave(function() {
            $(".progress_tooltip").addClass("hidden");
        });
    },

    initShortcutsView: function(segmentIndex) {
        var target = $(".horizontal_button_container");
        target.append('<div class="horizontal_button_group" id="shortcuts"></div>');
        var parent = target.find("#shortcuts");

        parent.append('<a href="#" class="img_link" id="shortcut_info" ></a>');
        parent.append('<p><span class="shortcut">ENTER</span> : accept next suggested word</p>');

        parent.append('<p><span class="shortcut">SHIFT-ARROWS</span> : navigate in alternatives</p>');
        parent.append('<p><span class="shortcut">ALT-M</span> : copy machine translation</p>');

        parent.append('<p><span class="shortcut">CTRL-ENTER</span> : confirm translation</p>');
        parent.append('<p><span class="shortcut">ALT-ARROWS</span> : navigate in sentences</p>');
        // parent.append('<p><span class="source highlight focus">Yellow</span>: token in source language</p>');
        // parent.append('<p><span class="target highlight focus">Blue</span>: token in target language</p>');
        // parent.append('<p><span class="target pretrans">Bold</span>: token used for machine translation</p>');

    },

    updateProgressTooltip: function(userIndex) {
        var user = this.translationTools.getStaffData().getStaffByIndex(userIndex);
        var userName = user.first_name + " " + user.last_name;
        $(".user_name").html(userName);

        var numTranslationFinished = this.progressStats.getNumCompletedTranslations(user.id);
        var numTranslationResponsibilities = this.progressStats.getNumTranslateResponsibilities(user.id);
        var translationProgress = Math.round(100 * numTranslationFinished / numTranslationResponsibilities);

        if(numTranslationResponsibilities == 0) {
            translationProgress = 0;
        }

        $("#translation_finished").html(numTranslationFinished);
        $("#translation_responsibilities").html("/ " + numTranslationResponsibilities);
        $("#translation_progress").html(translationProgress + "%");

        var numRevisionFinished = this.progressStats.getNumCompletedRevisions(user.id);
        var numRevisionResponsibilities = this.progressStats.getNumReviseResponsibilities(user.id);
        var revisionProgress = Math.round(100 * numRevisionFinished / numRevisionResponsibilities);

        if(numRevisionResponsibilities == 0) {
            revisionProgress = 0;
        }

        $("#revision_finished").html(numRevisionFinished);
        $("#revision_responsibilities").html("/ " + numRevisionResponsibilities);
        $("#revision_progress").html(revisionProgress + "%");
    },

    toggleRelatedView: function(enabled) {
        $("#related_button").toggleClass("active", enabled);

        if(enabled) {
            this.innerLayout.open('south');
        } else {
            this.innerLayout.close('south');
        }
    },

    updateDifficicultyState: function() {
        $("#difficulty_button").toggleClass("active", this.filters.isDifficultyViewEnabled());

        $("#difficulty_easy_button").toggleClass("active", this.filters.isEasySegmentsViewEnabled());
        $("#difficulty_easy_button").toggleClass("disabled", !this.filters.isDifficultyViewEnabled());
        $("#difficulty_moderate_button").toggleClass("active", this.filters.isModerateSegmentsViewEnabled());
        $("#difficulty_moderate_button").toggleClass("disabled", !this.filters.isDifficultyViewEnabled());
        $("#difficulty_hard_button").toggleClass("active", this.filters.isHardSegmentsViewEnabled());
        $("#difficulty_hard_button").toggleClass("disabled", !this.filters.isDifficultyViewEnabled());
    },

    updatePhaseState: function() {
        $("#phase_button").toggleClass("active", this.filters.isProgressViewEnabled());

        $("#empty_button").toggleClass("active", this.filters.isInitialisedSegmentsViewEnabled());
        $("#empty_button").toggleClass("disabled", !this.filters.isProgressViewEnabled());
        $("#translated_button").toggleClass("active", this.filters.isTranslatedSegmentsViewEnabled());
        $("#translated_button").toggleClass("disabled", !this.filters.isProgressViewEnabled());
        $("#revised_button").toggleClass("active", this.filters.isRevisedSegmentsViewEnabled());
        $("#revised_button").toggleClass("disabled", !this.filters.isProgressViewEnabled());
    },

    updateUserState: function () {
        $("#responsibilities_button").toggleClass("active", this.filters.isResponsibilitiesViewEnabled());

        // User buttons
        for(var i = 0; i < 5; i++) {
            $("#user" + i).toggleClass("active", this.filters.isUserEnabled(i));
            $("#user" + i).toggleClass("disabled", !this.filters.isResponsibilitiesViewEnabled());
        }
    }
};