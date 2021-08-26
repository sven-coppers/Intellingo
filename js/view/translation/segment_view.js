function SegmentView(segmentController, translationTools) {
    this.segmentController = segmentController;
    this.progress = translationTools.getProgressData();
    this.staffData = translationTools.getStaffData();

    config.observers.register(this);
    this.progress.observers.register(this);
}

SegmentView.prototype = {
    configurationChanged: function () {
        for(var i = 0; i < this.progress.getNumTasks(); i++) {
            this.updateActionsVisibility(i);
        }
    },

    /**
     * The segment with this index has changed
     * @param segmentIndex
     */
    segmentChanged: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);

        // Update collapsed translation
        if(segment["target"].length > 0) {
            var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
            parentTag.find(".segment_collapsed").html(segment["target"]);
        }

        this.setPhase(segmentIndex, segment["phase"]);
    },

    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        this.segmentController.loadSegmentContext(newSegmentIndex);

        var newSegment = this.progress.getSegment(newSegmentIndex);
        var oldSegment = this.progress.getSegment(oldSegmentIndex);
        this.setPhase(newSegmentIndex, newSegment["phase"]);

        if(oldSegmentIndex >= 0) {
            this.setPhase(oldSegmentIndex, oldSegment["phase"]);
        }
    },

    initSegment: function(segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);

        var isFirstInParagraph = this.progress.isFirstSegmentInTranslationUnit(segment["segment_id"], segment["translation_unit_id"]);
        var isLastInParagraph = this.progress.isLastSegmentInTranslationUnit(segment["segment_id"], segment["translation_unit_id"]);

        $(".segment_translator_boxes").append(this.taskToEditBox(segment, segmentIndex, isFirstInParagraph, isLastInParagraph));

        this.enableStartTranslating(segmentIndex);
        this.enableStopTranslating(segmentIndex);
        this.enableStartRevising(segmentIndex);
        this.enableStopRevising(segmentIndex);
        this.enableReject(segmentIndex);

        this.setPhase(segmentIndex, segment["phase"]);
    },

    taskToEditBox: function(segment, segmentIndex, isFirstSentenceInParagraph, isLastSentenceInParagraph) {
        var additionalClass = "";
        var html = "";

        if(isFirstSentenceInParagraph) {
            additionalClass += " first_in_unit";
        }

        if(isLastSentenceInParagraph) {
            additionalClass += " last_in_unit";
        }

        html += '<div class="segment_translator_box_separator' + additionalClass + '">';
        html += '    <div class="segment_translator_box_position">';
        html += '        <div class="segment_translator_box">';
        html += '           <div class="segment_icon_column">';
        html += '               <div class="segment_ID_container">';
        html += '                   <img class="segment_icon" src="img/difficulty_' + segment["difficulty"] + '.png" />';
        html += '                   <p class="segment_ID">' + segment["segment_id"] + '</p>';
        html += '               </div>';
        html += '           </div>';
        html += '           <div class="segment_translator">';
        html += '               <div class="segment_collapsed_view">';
        html += '                   <p class="segment_collapsed">' + segment["source"] + '</p>';
        html += '               </div>';
        html += '               <div class="segment_expanded_view">';
        html += '                  <p class="translation_source">' + segment["source"] + '</p>';
        html += '                  <div class="segment_translator_tools">';
        html += '                      <div class="translation_target_container">';
        html += '                          <div class="user_translation" id="textarea-' + segmentIndex + '" contentEditable="true">' + segment["target"] + '</div>';
        html += '                      </div>';
        html += '                      <div class="prediction_container">';
        html += '                          <img title="Use machine translation (ALT+M)" class="use_best_suggestion hidden" src="img/icon-state-takeoverB.png" />';
        html += '                          <div class="prediction_splitter">';
        html += '                               <p class="mt_meta">';
        html += '                               <img class="spinner" src="img/spinner.gif" title="Determining quality" />';
        html += '                               <img class="mt_quality hidden" src="img/quality.png" title="Quality" /> <span class="quality_score hidden"></span>';

        if(config.segment_show_mt_icon) {
            if(config.translation_mode = TRANSLATOR_MODE_HYBRID) {
                html += '                               <img class="mt_icon" src="img/pc.png" title="Hybrid machine translation" />';
            } else {
                html += '                               <img class="mt_icon" src="img/pc.png" title="Machine translation" />';
            }

        }

        html += '                          </p>';
        html += '                          <p class="best_prediction selectable_tokens"><img class="spinner" src="img/spinner.gif" /> Loading machine translation...</p>';

        html += '                          </div>';
  //      html += '                          <div class="other_predictions"></div>';
        html += '                      </div>';
        html += '                      <div class="recommendations">';
        html += '                           <div class="synonyms"><p class="no_synonyms">Select a word to view alternatives</p></div>';
        html += '                           <div class="matches"></div>';
        html += '                      </div>';
        html += '                  </div>';
        html += '               </div>';
        html += '           </div>';
        html += '           <div class="segment_buttons"></div>';
        html += '       </div>';
        html += '   </div>';
        html += '</div>';

        return html;
    },

    /**
     * Set the segmentView of this segment to the corresponding phase
     * @param segmentIndex
     * @param phase
     */
    setPhase: function(segmentIndex, phase) {
        var segment = this.progress.getSegment(segmentIndex);
        var segmentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        segmentTag.removeClass("initialised translating translated revising revised");
        segmentTag.addClass(phase.toLowerCase());

        // TODO: Is editing still allowed?
        /*if(config.workflow[phase][ALLOW_START_TRANSLATING]) {
            $(".segment_translator_box_separator:eq(" + segmentIndex + ")").find("textarea").attr("disabled","disabled");
        }*/

        this.updateActionsVisibility(segmentIndex);
    },

    updateActionsVisibility: function (segmentIndex) {
        var segment = this.progress.getSegment(segmentIndex);
        var phase = segment["phase"];
        var translator = segment["translator"];
        var revisor = segment["revisor"];
        var workflow = config.workflowDefault;

        // Override default workflow when it needs to be forced
        if(config.workflowForced) {
            workflow = config.workflow;
        }

        var startTranslatingEnabled = workflow[phase][ALLOW_START_TRANSLATING] && (!config.workflowForced || translator == this.staffData.currentUserID);
        var startRevisingEnabled = workflow[phase][ALLOW_START_REVISING] && (!config.workflowForced || revisor == this.staffData.currentUserID);
        var totalEnabled = startRevisingEnabled || startTranslatingEnabled;

        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        parentTag.find(".segment_start_translating").toggleClass("hidden", !(workflow[phase][ALLOW_START_TRANSLATING] && (!config.workflowForced || translator == this.staffData.currentUserID)));
        parentTag.find(".segment_stop_translating").toggleClass("hidden", !(workflow[phase][ALLOW_STOP_TRANSLATING] && (!config.workflowForced || translator == this.staffData.currentUserID)));
        parentTag.find(".segment_start_revising").toggleClass("hidden", !(workflow[phase][ALLOW_START_REVISING] && (!config.workflowForced || revisor == this.staffData.currentUserID)));
        parentTag.find(".segment_stop_revising").toggleClass("hidden", !(workflow[phase][ALLOW_STOP_REVISING] && (!config.workflowForced || revisor == this.staffData.currentUserID)));
        parentTag.find(".segment_reject").toggleClass("hidden", !(workflow[phase][ALLOW_REJECT] && (!config.workflowForced || revisor == this.staffData.currentUserID)));
        parentTag.find(".segment_collapsed").toggleClass("disabled", !totalEnabled);
    },

    enableStartTranslating: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var buttonsTag = parentTag.find(".segment_buttons");

        buttonsTag.append('<img class="segment_action segment_start_translating" src="img/icon-state-1.png" title="Start translating" />');
        buttonsTag.find(".segment_start_translating").click(function() {
            thisObject.segmentController.startTranslating(segmentIndex);

            return false; // Prevent propagation of the event, such as segment selection
        });
    },

    enableStopTranslating: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var buttonsTag = parentTag.find(".segment_buttons");

        buttonsTag.append('<img class="segment_action segment_stop_translating" src="img/icon-state-1B.png" title="Confirm translation (CTRL+ENTER)" />');
        buttonsTag.find(".segment_stop_translating").click(function() {
            thisObject.segmentController.finishTranslating(segmentIndex);

            return false; // Prevent propagation of the event, such as segment selection
        });

        this.segmentController.bindBehaviourWhenTranslating(segmentIndex);
    },

    enableStartRevising: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var buttonsTag = parentTag.find(".segment_buttons");

        buttonsTag.append('<img class="segment_action segment_start_revising" src="img/icon-state-2.png" title="Start revising" />');
        buttonsTag.find(".segment_start_revising").click(function() {
            thisObject.segmentController.startRevising(segmentIndex);

            return false; // Prevent propagation of the event, such as segment selection
        });
    },

    enableStopRevising: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var buttonsTag = parentTag.find(".segment_buttons");

        buttonsTag.append('<img class="segment_action segment_stop_revising" src="img/icon-state-2B.png" title="Confirm revision (CTRL+ENTER)" />');
        buttonsTag.find(".segment_stop_revising").click(function() {
            thisObject.segmentController.finishRevising(segmentIndex);

            return false; // Prevent propagation of the event, such as segment selection
        });

        this.segmentController.bindBehaviourWhenRevising(segmentIndex);
    },

    enableReject: function(segmentIndex) {
        var thisObject = this;
        var parentTag = $(".segment_translator_box_separator:eq(" + segmentIndex + ")");
        var buttonsTag = parentTag.find(".segment_buttons");

        buttonsTag.append('<img class="segment_action segment_reject" src="img/icon-state-backB.png" title="Reject translation (CTRL+BACKSPACE)" />');
        buttonsTag.find(".segment_reject").click(function() {
            thisObject.segmentController.rejectRevising(segmentIndex);

            return false; // Prevent propagation of the event, such as segment selection
        });

        this.segmentController.bindBehaviourWhenRevising(segmentIndex);
    },

    bindTranslatingBehaviour: function (segmentIndex) {
        this.initShortcutConfirmTranslation(segmentIndex);
    },

    bindRevisingBehaviour: function (segmentIndex) {
        this.initShortcutConfirmRevision(segmentIndex);
    },

    initShortcutConfirmTranslation: function (segmentIndex) {
        var thisObject = this;

       /* $("#textarea-" + segmentIndex).bind('keyup', 'ctrl+return', function() {
            logger.log("KEYBOARD: ctrl+enter");



            return false;
        }); */
    },

    initShortcutConfirmRevision: function (segmentIndex) {
        var thisObject = this;

        $("#textarea-" + segmentIndex).bind('keyup', 'ctrl+return', function() {
            logger.log("KEYBOARD: ctrl+enter");

            var segment = thisObject.progress.getSegment(segmentIndex);
            var phase = segment["phase"];

            if(segment["phase"] === PHASE_TRANSLATING) {
                thisObject.segmentController.finishTranslating(segmentIndex);
            } else if(segment["phase"] === PHASE_REVISING) {
                thisObject.segmentController.finishRevising(segmentIndex);
            }

            return false;
        });
    },

    removeAllBehaviour: function(segmentIndex) {
        $("#textarea-" + segmentIndex).unbind("keyup");
        $("#textarea-" + segmentIndex).unbind("keydown");
        $("#textarea-" + segmentIndex).unbind("mouseup");
        $("#textarea-" + segmentIndex).unbind("mousedown");
    }
};