function MainController() {
    this.translationTools = new TranslationTools();
    this.filters = new Filters();

    // Sub Controllers
    this.textController = new TextController(this.translationTools, this.filters);
    this.segmentListController = new SegmentListController(this.textController, this.translationTools, this.filters);
    this.progressBarController = new ProgressBarController(this.textController, this.translationTools, this.filters);
    this.configController = new ConfigController();

    // View
    this.mainView = new MainView(this);
}

MainController.prototype = {

};