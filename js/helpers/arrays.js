/**
 * Merge all elements of two arrays into a new array;
 * @param firstArray
 * @param secondArray
 * @return a new array that contains all unique elements
 * @post
 */
function mergeWithoutDuplicates(firstArray, secondArray) {
    var result = firstArray.slice();

    for(var i = 0; i < secondArray.length; i++) {
        var newValue = secondArray[i];

        if($.inArray(newValue, result) == -1) {
            result.push(newValue);
        }
    }

    return result;
}

/**
 * Sort an array of integers
 * @param array
 */
function sort(array) {
    array.sort(function (a, b) { return a - b; });
}

/**
 * Create an array: 0, 1, 2, 3, 4, ... n
 * @param max
 * @returns {Array}
 */
function createArray(n) {
    var result = [];

    for(var i = 0; i < n; i++) {
        result.push(i);
    }

    return result;
}

function createArrayValue(n, value) {
    var result = [];

    for(var i = 0; i < n; i++) {
        result.push(value);
    }

    return result;
}

// Both start and end included
function createArrayRange(start, end) {
    var result = [];

    for(var i = start; i <= end; i++) {
        result.push(i);
    }

    return result;
}

/**
 * Check if two lists of tokens are equal to each other
 * @param tokenListA
 * @param tokenListB
 * @returns {boolean}
 */

function equalTokens(tokenListA, tokenListB) {
    if(tokenListA.length != tokenListB.length) return false;

    for(var i = 0; i < tokenListA.length; i++) {
        if(cleanToken(tokenListA[i], false) !== cleanToken(tokenListB[i], false)) {
            return false;
        }
    }

    return true;
}

function removeFromArray(element, array) {
    var index = array.indexOf(element);

    if(index > -1) {
        array.splice(index, 1);
    }
}

function innerJoin(array1, array2) {
    var result = [];

    for(var i = 0; i < array1.length; i++) {
        if(array2.indexOf(array1[i]) > -1) {
            result.push(array1[i]);
        }
    }

    return result;
}

// Check if all elements from B are also in A
function arrayContains(a, b) {
    for(var i = 0; i < b.length; i++) {
        if(a.indexOf(b[i]) == -1) {
            return false;
        }
    }

    return true;
}