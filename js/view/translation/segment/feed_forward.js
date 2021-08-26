function FeedForward(feedForwardController, translationTools) {
    this.feedForwardController = feedForwardController;

    this.progress = translationTools.getProgressData();

    // Register as observer
    this.progress.observers.register(this);
}

FeedForward.prototype = {
    /**
     * Observer: The selection changed from oldSegmentIndex to newSegmentIndex
     * @param newSegmentIndex
     * @param oldSegmentIndex
     */
    selectionChanged: function(newSegmentIndex, oldSegmentIndex) {
        this.removeFeedForward(newSegmentIndex);
    },

    getFeedForward: function(segmentIndex) {
        var feedForwardElements = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .feed_forward");

        if(feedForwardElements.length > 0) {
            return feedForwardElements.text();
        } else {
            return "";
        }
    },

    isSpaceRemovalNeeded: function (segmentIndex) {
        var element = $(".segment_translator_box_separator:eq(" + segmentIndex + ") .feed_forward");

        return element.hasClass("negative_space");
    },

    removeFeedForward: function(segmentIndex) {
        $(".segment_translator_box_separator:eq(" + segmentIndex + ") .feed_forward").remove();
    }
};