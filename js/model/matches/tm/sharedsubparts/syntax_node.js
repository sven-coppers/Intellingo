function SyntaxNode(attributes, parentNode) {
    this.parentNode = parentNode;
    this.children = [];
    this.attributes = {};
    this.identifier = "";
    this.tokenIndex = -1;
    this.intraGroupIndex = -1;
    this.interGroupIndex = -1;

    for(var i = 0; i < attributes.length; i+= 2) {
        var key = attributes[i];
        var value = attributes[i + 1];

        if(key === "id") {
            this.identifier = value;
        } else {
            this.attributes[key] = value;
        }
    }
}

SyntaxNode.prototype = {
    /**
     * Add all leaves to a list, recursively
     * @param leaveList
     */
    addLeaves: function(leaveList) {
        if(this.attributes["word"]) {
            leaveList.push(this);
        }

        for(var i = 0; i < this.children.length; i++) {
            this.children[i].addLeaves(leaveList);
        }
    },

    /**
     * Add all nodes to a list, recursively
     * @param nodeList
     */
    addNodes: function(nodeList) {
        nodeList[this.identifier] = this;

        for(var i = 0; i < this.children.length; i++) {
            this.children[i].addNodes(nodeList);
        }
    },

    setTokenIndex: function(tokenIndex) {
        this.tokenIndex = tokenIndex;
    },

    addChild: function(child) {
        this.children.push(child);
    },

    getChildren: function() {
        return this.children;
    },

    isLeaf: function() {
        return this.children.length == 0;
    },

    extendTree: function(data, parentIdentifier) {
        if(this.identifier === parentIdentifier) {
            var newNode = new SyntaxNode(data.nodeatts, this);
            this.addChild(newNode);
        } else {
            for(var i = 0; i < this.children.length; i++) {
                this.children[i].extendTree(data, parentIdentifier);
            }
        }
    },

    setIntraGroupIndex: function(intraGroupIndex) {
        this.intraGroupIndex = intraGroupIndex;
    },

    collectIntraNodes: function(intraGroupIndex, nodes) {
        if(this.intraGroupIndex == intraGroupIndex) {
            this.addLeaves(nodes);
        } else {
            for(var i = 0; i < this.children.length; i++) {
                this.children[i].collectIntraNodes(intraGroupIndex, nodes);
            }
        }
    },

    setInterGroupIndex: function(interGroupIndex) {
        this.interGroupIndex = interGroupIndex;
    },

    collectInterNodes: function(interGroupIndex, nodes) {
        if(this.interGroupIndex == interGroupIndex) {
            this.addLeaves(nodes);
        } else {
            for(var i = 0; i < this.children.length; i++) {
                this.children[i].collectInterNodes(interGroupIndex, nodes);
            }
        }
    },

    printNode: function(depth) {
        var output = "";

        for(var i = 0; i < depth; i++) {
            output += "\t";
        }

        output += this.identifier + " (intra: " + this.intraGroupIndex + ")"+ " (inter: " + this.interGroupIndex + ")";

        if(this.attributes["word"]) {
            output += "(" + this.attributes["word"] + ")";
        }

        console.log(output);

        for(var i = 0; i < this.children.length; i++) {
            this.children[i].printNode(depth + 1);
        }
    }
};