var QUALITY_API_URL = "https://www.lt3.ugent.be/scate-qe-demo/create/";
var CACHE_QUALITY_API = "api/save_quality_result.php";

function QualityService(translationTools) {
    this.TMCache = translationTools.getTMCache();
    this.MTCache = translationTools.getMTCache();

    this.TMCache.observers.register(this);
}

QualityService.prototype = {
    /**
     * Observer: the fuzzy matches have updated
     */
    matchesUpdated: function (segmentIndex, matches) {
        this.findQuality(segmentIndex);
    },

    /**
     * Observers will be notified with the result
     */
    findQuality: function(segmentIndex) {
        var translation = this.MTCache.getTranslation(segmentIndex);

        if(translation != null && typeof translation !== "undefined") {
            if(translation.qualityScore == null) {
                this.qualityUsingFileCache(segmentIndex);
            } else {
                // Cached in the client
            }

        } else {
            // The quality of what?
        }
    },

    /**
     * Find quality using a file cache, if the cache does not exist, use the service
     * @param segmentIndex
     */
    qualityUsingFileCache: function(segmentIndex) {
        var thisObject = this;

        var fileName = "data/" + config.dataFolder + "/cache/quality_" + segmentIndex + ".json";

        d3.json(fileName, function(json) {
            if(json == null) {
                // No file cached
                thisObject.qualityUsingService(segmentIndex);
            } else {
                logger.log("Loaded translation from " + fileName, segmentIndex);
                thisObject.processQualityJson(segmentIndex, json, false);
            }
        });
    },

    qualityUsingService: function(segmentIndex) {
        var sourceTag = $(".translation_source:eq(" + segmentIndex + ")");
        var sourceSentence = sourceTag.text();
        var pairs = [];

        var translation = this.MTCache.getTranslation(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);

        if(translation != null && typeof translation !== "undefined") {
            pairs.push({"source_sentence": translation.inputSentence, "target_sentence": translation.targetSentence, "context": "machine_translation", "qe_word": config.grammar_errors});

            for(var i = 0; i < matches.length; i++) {
                pairs.push({"source_sentence": translation.inputSentence, "target_sentence": matches[i].targetSentence, "context": "match_" + i, "qe_word": config.grammar_errors});
            }
        }

        var formData = {"input": JSON.stringify(pairs)};

        var thisObject = this;

        if(pairs.length > 0) {
            $.ajax({
                url:            QUALITY_API_URL,
                type:           "POST",
                data:           formData
            })
                .always(function (response) {
                    if(typeof response.error === "undefined") {
                        logger.log("Loaded quality from service", segmentIndex);
                        thisObject.processQualityJson(segmentIndex, response, true);
                    } else {
                        logger.log("Failed to load quality (" + response.responseText + ")", segmentIndex);
                    }
                });
        }
    },

    cacheQuality: function(segmentIndex, json) {
        var thisObject = this;
        var data = {"data": config.dataFolder, "segment_index": segmentIndex, "result": json};

        $.post(CACHE_QUALITY_API, JSON.stringify(data))
            .done(function(jsonResponse) {
                logger.log("Quality successfully cached", segmentIndex);
            })
            .fail(function(response) {
                logger.log("Quality failed to cache (" + response + ")", segmentIndex);
            });
    },

    processQualityJson: function(segmentIndex, json, saveToCache) {
        // TODO: Add grammatical errors
        if(saveToCache) {
            this.cacheQuality(segmentIndex, json);
        }

        var translation = this.MTCache.getTranslation(segmentIndex);
        var matches = this.TMCache.getMatches(segmentIndex);

        if(translation == null || typeof translation === "undefined") return;

        translation.qualityScore = this.normalizeScore(json[0]["quality_score"]);
        if (typeof json[0]["grammar_errors"] === "undefined" || json[0]["grammar_errors"] === "no_info")
            translation.grammarErrors = createArrayValue(translation.targetTokens.length, 0);
        else
            translation.grammarErrors = json[0]["grammar_errors"];

        for(var i = 0; i < matches.length; i++) {
            matches[i].qualityScore = this.normalizeScore(json[i + 1]["quality_score"]);
            if (typeof json[i + 1]["grammar_errors"] === "undefined" || json[i + 1]["grammar_errors"] === "no_info")
                matches[i].grammarErrors = createArrayValue(translation.targetTokens.length, 0);
            else
                matches[i].grammarErrors = json[i + 1]["grammar_errors"];
        }

        this.MTCache.observers.qualityUpdated(segmentIndex);
        this.TMCache.observers.qualityUpdated(segmentIndex);
    },

    normalizeScore: function(score) {
        score = 1 - score;

        if(score < 0) score = 0;

        return score;
    }
};