TB_NOUN = "N";
TB_ADJ = "ADJ";
TB_PAPA = "v-papa";
TB_FIN = "v-fin";
TB_INF = "v-inf";

TB_WORD_ROLE = {};
TB_WORD_ROLE[TB_NOUN] = "NOUN";
TB_WORD_ROLE[TB_ADJ] = "ADJ";
TB_WORD_ROLE[TB_PAPA] = "PAPA";
TB_WORD_ROLE[TB_FIN] = "FIN";
TB_WORD_ROLE[TB_INF] = "INF";

function TermBase(translationTools) {
    this.translationTools = translationTools;
    this.termbase = [];
//    this.sourceFile = "data/EMEA EN-NL termbase.csv";
    this.sourceFile = "data/terms.csv";

    this.load();
}

TermBase.prototype = {
    load: function() {
        var thisObject = this;

        d3.tsv(this.sourceFile, function(data) {
            logger.log("Term base loaded from " + thisObject.sourceFile);
            thisObject.termbase = data;
            thisObject.translationTools.termBaseLoaded();
        });
    },

    /**
     * Return a list of translations and a raking
     * @param allTokens an array of all tokens in the sentence to translate
     * @param inputTokenIndexes an array of indexes of tokens in allTokens that we want to know about
     */
    translate: function(allTokens, usedTokenIndexes) {
        var maxNumTokens = 5;
        var translations = {};

       /* for(var begin = 0; begin < allTokens.length; begin++) { // StartIndex
            for(var end = begin; end < allTokens.length; end++) { // Possible tokenLengths
               if(begin - end < maxNumTokens) {
                   var subsetTokenIndexes = createArrayRange(begin, end);

                    if(arrayContains(subsetTokenIndexes, usedTokenIndexes)) {
                        var tokens = resolveTokens(subsetTokenIndexes, allTokens);
                        var testTerm = concatTokens(tokens, false);

                        for(var i = 0; i < this.termbase.length; i++) {
                            var term = this.termbase[i];

                            if(term["term_L1"] === testTerm) {
                                translations[term["term_L2"]] = parseInt(term["freq_L2"]);
                            }
                        }
                    }
                }

            }
        } */

        var tokens = resolveTokens(usedTokenIndexes, allTokens);
        var testTerm = concatTokens(tokens, false);

        for(var i = 0; i < this.termbase.length; i++) {
            var term = this.termbase[i];

            if(term["term_L1"] === testTerm) {
                translations[term["term_L2"]] = parseInt(term["freq_L2"]);
            }
        }

        this.resolveRelativeFrequency(translations);

        return translations;
    },

    resolveRelativeFrequency: function(translations) {
        var sum = 0;

        for(var translation in translations) {
            sum += translations[translation];
        }

        for(var translation in translations) {
            translations[translation] = translations[translation] / sum * 100;
        }
    }
};

