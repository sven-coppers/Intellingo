/**
 * Check if a token should have a space before it
 * @param sentence The complete sentence, where all tokens are combined with the proper spaces
 * @param tokens The list of tokens that does not contain any spaces
 * @param tokenIndex The index of the token to be known
 */
function requiresSpaceBefore(sentence, tokens, tokenIndex) {
    var startIndex = tokens[0].length;

    if(tokenIndex == 0) {
        return false;
    }

    for(var i = 1; i < tokens.length; i++) {
        var position = sentence.indexOf(tokens[i], startIndex);

        if(i == tokenIndex) {
            return position > startIndex;
        }

        startIndex = position + tokens[i].length;
    }

    return false;
}

/**
 * Check if a token should have a space after it
 * @param sentence The complete sentence, where all tokens are combined with the proper spaces
 * @param tokens The list of tokens that does not contain any spaces
 * @param tokenIndex The index of the token to be known
 */
function requiresSpaceAfter(sentence, tokens, tokenIndex) {
    var startIndex = 0;

    // The last token does not require spaces
    if(tokenIndex == tokens.length - 1) {
        return false;
    }

    for(var i = 0; i < tokens.length; i++) {
        var position = sentence.indexOf(tokens[i], startIndex);

        if(i == tokenIndex + 1) {
            return position > startIndex;
        }

        startIndex = position + tokens[i].length;
    }

    return false;
}

/**
 * For every tokenIndex, get the token itself from the tokens-array
 * @param tokenIndexes the array of tokenIndexes
 * @param tokens the array of tokens
 */
function resolveTokens(tokenIndexes, tokens) {
    var result = [];

    for(var i = 0; i < tokenIndexes.length; i++) {
        result.push(tokens[tokenIndexes[i]]);
    }

    return result;
}

function splitSentenceInTokens(sentence) {
    return sentence.split(" ");
}

function removeDoubles(array) {
    return array.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    })
}

function cleanToken(token, keepUpperCase) {
    keepUpperCase = typeof keepUpperCase != "undefined" ? keepUpperCase : false;

    var newToken = token.replace(/[!;:]/g,"");

    if(!keepUpperCase) {
        newToken = newToken.toLowerCase();
    }

    if(newToken.length > 1 && (newToken.substr(newToken.length - 1) == '.' || newToken.substr(newToken.length - 1) == ',')) {
        newToken = newToken.substr(0, newToken.length - 2);
    }

    return newToken;
}

function isSpace(character) {
    var result = character === " "
        || character.charCodeAt(0) === 32 // Space
        || character.charCodeAt(0) === 160; // Non-breaking space

    //console.log("isSpace('" + character + "') = " + result);

    return result;
}

function startsWithCapital(token) {
    if(token.length == 0) return false;
    return token[0] === token[0].toUpperCase();
}

function capitalizeFirstLetter(string) {
    if(string.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
        return string;
    }
}

function lowercaseFirstLetter(string) {
    if(string.length > 0) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    } else {
        return string;
    }
}

function concatTokens(tokens, keepUpperCase) {
    var result = "";

    if(tokens.length > 0) {
        result = cleanToken(tokens[0], keepUpperCase);
    }

    for(var i = 1; i < tokens.length; i++) {
        result += " " + cleanToken(tokens[i], keepUpperCase);
    }

    return result;
}

/**
 * https://gist.github.com/andrei-m/982927
 * @param s
 * @param t
 * @returns {*}
 */
function levenshteinDistance (s, t) {
    if (!s.length) return t.length;
    if (!t.length) return s.length;

    return Math.min(
            levenshteinDistance(s.substr(1), t) + 1,
            levenshteinDistance(t.substr(1), s) + 1,
            levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        ) + 1;
}