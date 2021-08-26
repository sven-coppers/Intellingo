function isArrowKey(keyCode) {
    if(keyCode == 37) {
        return true; // Left
    } else if(keyCode == 38) {
        return true; // Up
    } else if(keyCode == 39) {
        return true; // Right
    } else if(keyCode == 40) {
        return true; // Down
    }

    return false;
}

function isAlphaNumeric(keyCode) {
    if (event.keyCode >= 48 && event.keyCode <= 57) {
        return true; // Number
    } else if (event.keyCode >= 65 && event.keyCode <= 90) {
        return true; // Alphabet upper case
    } else if (event.keyCode >= 97 && event.keyCode <= 122) {
        return true;  // Alphabet lower case
    }

    return false;
}