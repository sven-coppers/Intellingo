var TM_API = "http://scate.ccl.kuleuven.be/demonstrator/fuzzymatch/json_wrapper.php";
var TM_CACHE_API = "api/save_tm_result.php";
var TM_CACHE_STATUS_NOT_TRIED = "not_tried";

function TranslationMemory(matchAggregator, tmName) {
    this.matchAggregator = matchAggregator;
    this.tmName = tmName;

    this.initCache(config.max_num_segments);
}

TranslationMemory.prototype = {
    /**
     * Init the cache
     * @param numSegments
     */
    initCache: function(numSegments) {
        this.cache = [];

        for(var i = 0; i < numSegments; i++) {
            this.cache.push(TM_CACHE_STATUS_NOT_TRIED);
        }
    },

    /**
     * Load the matches
     * matchesUpdated() will be called on all observers with the results
     */
    loadMatches: function(segmentIndex) {
        if(this.cache[segmentIndex] === TM_CACHE_STATUS_NOT_TRIED) {
            if(config.cache_use_files_tm) {
                this.matchUsingFileCache(segmentIndex);
            } else {
                this.matchUsingService(segmentIndex);
            }
        } else {
            this.matchAggregator.matcherCompleted(segmentIndex, this.cache[segmentIndex], this.tmName);
        }
    },

    /**
     * Translate using a file cache, if the cache does not exist, use the service
     * @param segmentIndex
     */
    matchUsingFileCache: function(segmentIndex) {
        var thisObject = this;

        var fileName = "data/" + config.dataFolder + "/cache/translation_memory_" + segmentIndex + ".json";

        d3.json(fileName, function(json) {
            if(json == null) {
                // No file cached
                thisObject.matchUsingService(segmentIndex);
            } else {
                logger.log("Loaded fuzzy matches from " + fileName, segmentIndex);
                thisObject.processMatchJson(segmentIndex, json);
            }
        });
    },

    matchUsingService: function(segmentIndex) {
        var sourceTag = $(".translation_source:eq(" + segmentIndex + ")");
        var sourceSentence = sourceTag.text();
        var form_data = {"input" : '{ "input": ["' + sourceSentence + '"], "nbest":"10", "metrics": ["sharedpartsubs", "levenshtein"] }'};
        var thisObject = this;

        $.post(TM_API, form_data)
            .done(function(response) {
                try {
                    logger.log("Loaded fuzzy matches from service", segmentIndex);
                    thisObject.processMatchJson(segmentIndex, response, true);
                } catch (e) {
                    logger.log("Failed to load fuzzy matches from '" + thisObject.tmName + "' (" + response + ")", segmentIndex);
                    thisObject.matchAggregator.matcherFailed(segmentIndex, thisObject.tmName);
                }
            })
            .fail(function(ts) {
                logger.log("Failed to load fuzzy matches from '" + thisObject.tmName + "' (" + ts + ")", segmentIndex);
                thisObject.matchAggregator.matcherFailed(segmentIndex, thisObject.tmName);
            });
    },

    cacheTranslationMemoryResult: function(segmentIndex, json) {
        var thisObject = this;
        var data = {"data": config.dataFolder, "segment_index": segmentIndex, "result": json};

        $.post(TM_CACHE_API, JSON.stringify(data))
            .done(function(response) {
                logger.log("Translation memory result successfully cached", segmentIndex);
            })
            .fail(function(response) {
                logger.log("Tanslation memory result failed to cache (" + response + ")", segmentIndex);
            });
    },

    processMatchJson: function(segmentIndex, json, saveToCache) {
        if(saveToCache) {
            this.cacheTranslationMemoryResult(segmentIndex, json);
        }

        var matches = this.processMatches(segmentIndex, json);

        this.cache[segmentIndex] = matches;
        this.matchAggregator.matcherCompleted(segmentIndex, matches, this.tmName);
    },

    processMatches: function(segmentIndex, jsonResponse) {
        var tmMatches = jsonResponse["matches"];
        var inputSentence = jsonResponse["input"];
        var inputTokens = jsonResponse["intok"][0]["tokens"];

        var result = [];

        for(var i = 0; i < tmMatches.length; i++) {
            var matchJson = tmMatches[i]["match"][0];

            if(matchJson["metric"] === "sharedpartsubs" && matchJson["tmnontoktrgsent"].length > 0) {
                result.push(new SharedsubpartsMatch(matchJson,inputSentence, inputTokens));
            } else if(matchJson["metric"] === "levenshtein") {
                result.push(new LevenshteinMatch(matchJson, inputSentence, inputTokens));
            } else {
                // TODO: Other metrics
            }
        }

        return result;
    }
};