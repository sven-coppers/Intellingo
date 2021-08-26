function SegmentListView(segmentListController, translationTools, filters) {
    this.segmentListController = segmentListController;
    this.filters = filters;

    this.progress = translationTools.getProgressData();

    config.observers.register(this);
    translationTools.observers.register(this);
    this.progress.observers.register(this);
    this.filters.observers.register(this);
}

SegmentListView.prototype = {
    /**
     * The configuration has been changed
     */
    configurationChanged: function() {
        this.applyConfiguration();
    },

    /**
     * Observer: The translation tools have been loaded
     */
    translationToolsLoaded: function() {
        this.segmentListController.initSegments();
        $(".segment_translator_box .segment_translator_tools").slideUp();

        this.makeSegmentsSelectable();
        this.makeSegmentsPreviewable();
        this.bindShortCuts();
        this.applyFilters();
        this.applyConfiguration();

        this.segmentListController.selectSegment(0);
    },

    /**
     * Observer: A different segment has been selected
     */
    selectionChanged: function (newSegmentIndex, oldSegmentIndex) {
        var thisObject = this;

        // Wait for the open/close animations to finish
        setTimeout(function() {
            thisObject.scrollToSegment(newSegmentIndex, oldSegmentIndex);
        }, 300);
    },

    /**
     * The segment with this index has changed
     * @param segmentIndex
     */
    segmentChanged: function(segmentIndex) {
        var thisObject = this;
        var segment = this.progress.getSegment(segmentIndex);

        if(segment["phase"] === PHASE_TRANSLATING || segment["phase"] === PHASE_REVISING) {
            $(".segment_translator_box_separator:eq(" + segmentIndex + ")").addClass("active");
            $(".segment_translator_box:eq(" + segmentIndex + ") .segment_translator_tools").slideDown();
        } else {
            $(".segment_translator_box:eq(" + segmentIndex + ") .segment_translator_tools").slideUp("normal", function() {
                $(".segment_translator_box_separator:eq(" + segmentIndex + ")").removeClass("active");
            });
        }
    },

    /**
     * Observer: visible difficulty has changed
     */
    difficultyChanged: function () {
        this.applyFilters();
    },

    /**
     * Observer: visible phases have changed
     */
    phaseChanged: function () {
        this.applyFilters();
    },

    /**
     * Observer: visible users have changed
     */
    userChanged: function() {
        this.applyFilters();
    },

    makeSegmentsSelectable: function() {
        var thisObject = this;

        $(".segment_translator_box_separator").click(function() {
            thisObject.segmentListController.selectSegment($(this).index(), EVENT_CANCEL);
        });
    },

    makeSegmentsPreviewable: function() {
        var thisObject = this;

        $(".segment_translator_box_separator").mousemove(function(event) {
            thisObject.segmentListController.previewSegment($(this).index());
        });

        $(".segment_translator_box_separator").hover(
            function(event) {
                thisObject.segmentListController.previewSegment($(this).index());
            }, function() {
                thisObject.segmentListController.previewSegment(-1);
            }
        );
    },

    scrollToSegment: function(newSegmentIndex, oldSegmentIndex) {
        var parentSegment = $('div.segment_translator_boxes');
        var targetSegment = $(".segment_translator_box:eq(" + newSegmentIndex + ")");

        parentSegment.animate({
            scrollTop: (parentSegment.scrollTop() + targetSegment.position().top
            - parentSegment.height()/2 + targetSegment.height()/2)
        }, 500);
    },

    applyFilters: function() {
        var allSegments = $(".segment_translator_boxes .segment_translator_box_separator");
        var thisObject = this;
        var segmentsFound = false;

        // What elements should be visible
        allSegments.each(function(i, d) {
            if (thisObject.filters.shouldBeVisible(thisObject.progress.getSegment(i))) {
                segmentsFound = true;

                $(this).slideDown(1000);
            } else {
                $(this).slideUp(1000);
            }
        });

        // Keep the opened sentence centered
        var thisObject = this;
        var newSegmentIndex = this.progress.getSelectedSegment();
        var parentSegment = $('div.segment_translator_boxes');
        var targetSegment = $(".segment_translator_box:eq(" + newSegmentIndex + ")");

        parentSegment.animate({
            scrollTop: (parentSegment.scrollTop() + targetSegment.position().top
            - parentSegment.height() / 2 + targetSegment.height() / 2)
        }, {
            duration: 1000,
            step: function(now, tween) {
                tween.end = (parentSegment.scrollTop() + targetSegment.position().top
                - parentSegment.height() / 2 + targetSegment.height() / 2)
            }
        });

        if(segmentsFound) {
            $('.no_segments').hide();
        } else {
            $('.no_segments').show();
        }
    },

    /**
     * Bind keyboard shortcuts
     */
    bindShortCuts: function() {
        this.initShortcutGoToNextSegment();
        this.initShortcutGoToPreviousSegment();
    },

    initShortcutGoToNextSegment: function () {
        var thisObject = this;

        $('textarea').bind('keyup', 'ctrl+down', function() {
            logger.log("KEYBOARD: ctrl+down");
            thisObject.segmentListController.selectNextSegment();
            return false;
        });
    },

    initShortcutGoToPreviousSegment: function () {
        var thisObject = this;

        $('textarea').bind('keyup', 'ctrl+up', function(){
            logger.log("KEYBOARD: ctrl+up");
            thisObject.segmentListController.selectPreviousSegment();
            return false;
        });
    },

    applyConfiguration: function() {
        $(".segment_translator_boxes").toggleClass("hide_match_details", !config.match_show_details);
        $(".segment_translator_boxes").toggleClass("hide_difficulty", !config.segment_show_difficulty);
        $(".segment_translator_boxes").toggleClass("hide_synonym_metrics", !config.synonym_show_details);
        $(".segment_translator_boxes").toggleClass("hide_pretrans", !config.match_show_pretrans);
        $(".segment_translator_boxes").toggleClass("show_grammar_errors", config.grammar_errors);
    }
};