var LOG_SAVE_URL = "api/save_log.php";

function Logger() {
    this.cache = [];
    setInterval(function() {
        this.logServerSide();
    }.bind(this), 10000);
}

Logger.prototype = {
    log: function(message, segmentIndex) {
        if(typeof segmentIndex !== "undefined") {
            message = "Segment " + segmentIndex + " - " + message;
        }

        message = new Date().toISOString() + " - " + message;

        console.log(message);
        this.cache.push(message);

        //console.log(new Error().stack);
    },

    logServerSide: function() {
        if(this.cache.length > 0) {
            var thisObject = this;
            var message = this.combineLogMessages();

            var data = {"user": config.user, "group": config.group, "mode": config.mode, "data": config.dataFolder, "log": message};

         /*   $.post(LOG_SAVE_URL, JSON.stringify(data))
                .done(function(jsonResponse) {
                    // Logging succeded
                    thisObject.cache = [];
                })
                .fail(function(response) {
                    alert("Log failed (Check your internet connection)");
                });*/
        }
    },

    combineLogMessages: function() {
        var result = "";

        for(var i = 0; i < this.cache.length; i++) {
            result += this.cache[i] + "\n";
        }

        return result;
    }
};