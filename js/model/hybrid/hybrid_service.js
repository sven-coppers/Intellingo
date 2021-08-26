var HYBRID_API_URL = "http://scate.ccl.kuleuven.be/demonstrator/json_wrapper.php";
var HYBRID_CACHE_URL = "api/save_hybrid_result.php";

function HybridTranslator(translationTools) {
    this.matchAggregator = translationTools.getMatchAggregator();

    this.MTCache = translationTools.getMTCache();
    this.tmName = "Hybrid Service";
}

HybridTranslator.prototype = {
    /**
     * Observers will be notified with the result
     */
    loadTranslation: function (segmentIndex) {
        if (this.MTCache.isTranslationCached(segmentIndex)) {
            // Do nothing
        } else if (config.cache_use_files_mt) {
            this.translateUsingFileCache(segmentIndex);
        } else {
            this.translateUsingService(segmentIndex);
        }
    },

    /**
     * Translate using a file cache, if the cache does not exist, use the service
     * @param segmentIndex
     */
    translateUsingFileCache: function (segmentIndex) {
        var thisObject = this;

        var fileName = "data/" + config.dataFolder + "/cache/hybrid_translation_" + segmentIndex + ".json";

        d3.json(fileName, function (json) {
            if (json == null) {
                // No file cached
                thisObject.translateUsingService(segmentIndex);
            } else {
                logger.log("Loaded hybrid translation from " + fileName, segmentIndex);
                thisObject.processJson(segmentIndex, json, false);
            }
        });
    },

    translateUsingService: function (segmentIndex) {
        var sourceTag = $(".translation_source:eq(" + segmentIndex + ")");
        var sourceSentence = sourceTag.text();
        var form_data = {"input": '{ "input": ["' + sourceSentence + '"], \n "srclang":"en", \n "trglang":"nl", \n "tmdir":"EMEA", \n "metric":"levenshtein", \n "minspan":"2", \n "nbestmatch": "10"}'};
        var thisObject = this;

        $.ajax({
            url:            HYBRID_API_URL,
            type:           "POST",
            data:           form_data
        })
        .always(function (response) {
            if(typeof response["input"] !== "undefined") {
                logger.log("Loaded hybrid translation + matches from service", segmentIndex);
                thisObject.processJson(segmentIndex, response, true);
            } else {
                logger.log("Failed to translate", segmentIndex);
                thisObject.MTCache.machineTranslationFailed(segmentIndex, response);
            }
        });
    },

    cacheMachineTranslation: function (segmentIndex, json) {
        var data = {"data": config.dataFolder, "segment_index": segmentIndex, "result": json};

        $.post(HYBRID_CACHE_URL, JSON.stringify(data))
            .done(function (jsonResponse) {
                logger.log("Machine translation successfully cached", segmentIndex);
            })
            .fail(function (response) {
                logger.log("Machine translation failed to cache (" + response + ")", segmentIndex);
            });
    },

    processJson: function(segmentIndex, json, saveToCache) {
        var newMachineTranslation = this.processTranslationJson(segmentIndex, json, saveToCache);
        var matches = this.processMatches(segmentIndex, json);
        this.processPreTrans(newMachineTranslation, matches, json);

        this.MTCache.setTranslation(segmentIndex, newMachineTranslation);
        this.matchAggregator.matcherCompleted(segmentIndex, matches, this.tmName);
    },

    processTranslationJson: function (segmentIndex, json, saveToCache) {
        if (saveToCache) {
            this.cacheMachineTranslation(segmentIndex, json);
        }

        return new MachineTranslation(json);
    },

    processMatches: function(segmentIndex, jsonResponse) {
        var tmMatches = jsonResponse["matches"];
        var inputSentence = jsonResponse["input"];
        var inputTokens = jsonResponse["intok"][0]["tokens"];

        var result = [];

        if(typeof jsonResponse["matches"] !== "undefined") {
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
        }

        return result;
    },

    processPreTrans: function(translation, matches, json) {
        var preTrans = json["pretraspans_matches"][0]["spaninfo"];
        var newPreTransGroupIndex = 0;
        var numPreTranGroups = 0;

        if(preTrans != null) {
            // For every PreTraGroup
            for(var i = 0; i < preTrans.length; i += 8) {
                var tmid = preTrans[i];
                var inputStart = parseInt(preTrans[i + 1]);
                var inputEnd = parseInt(preTrans[i + 2]);
                var tmSourceStart = parseInt(preTrans[i + 3]);
                var tmSourceEnd = parseInt(preTrans[i + 4]);
                var tmTargetStart = parseInt(preTrans[i + 5]);
                var tmTargetEnd = parseInt(preTrans[i + 6]);

                var match = this.findMatch(tmid, matches);
                var numTargetTokens = tmTargetEnd - tmTargetStart + 1; // End inclusive

                // Determine pretrans groupIndex
                var oldPreTransGroupIndex = translation.getPreTraGroupByInputToken(inputStart);

                if(oldPreTransGroupIndex == -1) {
                    newPreTransGroupIndex = numPreTranGroups;
                    numPreTranGroups++;
                } else {
                    newPreTransGroupIndex = oldPreTransGroupIndex;
                }

                // Apply it to all tokens in the translation
                var inputTokenIndexes = [];

                for(var inputTokenIndex = inputStart; inputTokenIndex <= inputEnd; inputTokenIndex++) {
                    translation.setPreTraGroupForInputToken(inputTokenIndex, newPreTransGroupIndex);
                    inputTokenIndexes.push(inputTokenIndex);
                }

                // Use local alignment to find relevant target tokens
                var correspondingTargetTokens = translation.getMTTokensByInput(inputTokenIndexes);
                var startMTTargetToken = correspondingTargetTokens[0];

                for(var j = 0 ; j < correspondingTargetTokens.length; j++) {
                    if(correspondingTargetTokens[j] < startMTTargetToken) {
                        startMTTargetToken = correspondingTargetTokens[j];
                    }
                }

                for(var j = startMTTargetToken; j < startMTTargetToken + numTargetTokens; j++) {
                    translation.setPreTraGroupForTargetToken(j, newPreTransGroupIndex);
                }

                // Assign the new group to the match
                for(var sourceTokenIndex = tmSourceStart; sourceTokenIndex <= tmSourceEnd; sourceTokenIndex++) {
                    match.setPreTraGroupForSourceToken(sourceTokenIndex, newPreTransGroupIndex);
                }

                for(var targetTokenIndex = tmTargetStart; targetTokenIndex <= tmTargetEnd; targetTokenIndex++) {
                    match.setPreTraGroupForTargetToken(targetTokenIndex, newPreTransGroupIndex);
                }
            }
        }
    },

    findMatch: function (tmid, matches) {
        for(var i = 0; i < matches.length; i++) {
            if(matches[i].tmid == tmid) {
                return matches[i];
            }
        }

        return null;
    }
};