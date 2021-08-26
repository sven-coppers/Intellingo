var MT_API_URL = "http://scate.ccl.kuleuven.be/demonstrator/json_wrapper.php";
var CACHE_MT_API = "api/save_mt_result.php";
var BOUNDARY = "";

function MachineTranslator(translationTools) {
    this.MTCache = translationTools.getMTCache();
}

MachineTranslator.prototype = {
    /**
     * Observers will be notified with the result
     */
    loadTranslation: function(segmentIndex) {
        if(this.MTCache.isTranslationCached(segmentIndex)) {
            // Do nothing
        } else if(config.cache_use_files_mt) {
            this.translateUsingFileCache(segmentIndex);
        } else {
            this.translateUsingService(segmentIndex);
        }
    },

    /**
     * Translate using a file cache, if the cache does not exist, use the service
     * @param segmentIndex
     */
    translateUsingFileCache: function(segmentIndex) {
        var thisObject = this;

        var fileName = "data/" + config.dataFolder + "/cache/machine_translation_" + segmentIndex + ".json";

        d3.json(fileName, function(json) {
            if(json == null) {
                // No file cached
                thisObject.translateUsingService(segmentIndex);
            } else {
                logger.log("Loaded translation from " + fileName, segmentIndex);
                thisObject.processTranslationJson(segmentIndex, json, false);
            }
        });
    },

    translateUsingService: function(segmentIndex) {
        var sourceTag = $(".translation_source:eq(" + segmentIndex + ")");
        var sourceSentence = sourceTag.text();
        var form_data = {"input": '{ \n "input": ["' + sourceSentence + '"], \n "srclang":"en", \n "trglang":"nl" \n }'};
        var thisObject = this;

        $.ajax({
            url:            MT_API_URL,
            type:           "POST",
            data:           form_data
        })
            .always(function (response) {
                var result = response.responseText.replace(/,\s([^,]+)$/, '}'); // Remove the last comma

                if(result.indexOf("Error") == 0) {
                    logger.log("Failed to translate", segmentIndex);
                    thisObject.MTCache.machineTranslationFailed(segmentIndex, result);
                } else {
                    logger.log("Loaded translation from service", segmentIndex);
                    thisObject.processTranslationJson(segmentIndex, JSON.parse(result), true);
                }
            });

      /*  $.post(, JSON.stringify(form_data))
            .done(function(jsonResponse) {
                logger.log("Loaded translation from service", segmentIndex);
                thisObject.processTranslationJson(segmentIndex, jsonResponse, true);
            })
            .fail(function(ts) {
                logger.log("Failed to translate", segmentIndex);
                thisObject.MTCache.machineTranslationFailed(segmentIndex, ts.responseText);
            }); */
    },

    cacheMachineTranslation: function(segmentIndex, json) {
        var thisObject = this;
        var data = {"data": config.dataFolder, "segment_index": segmentIndex, "result": json};

        $.post(CACHE_MT_API, JSON.stringify(data))
            .done(function(jsonResponse) {
                logger.log("Machine translation successfully cached", segmentIndex);
            })
            .fail(function(response) {
                logger.log("Machine translation failed to cache (" + response + ")", segmentIndex);
            });
    },

    processTranslationJson: function(segmentIndex, json, saveToCache) {
        if(saveToCache) {
            this.cacheMachineTranslation(segmentIndex, json);
        }

        var newMachineTranslation = new MachineTranslation(json);

        this.MTCache.setTranslation(segmentIndex, newMachineTranslation);
    }
};