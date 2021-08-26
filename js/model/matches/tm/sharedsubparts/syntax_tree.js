function SyntaxTree(nodesData) {
    this.root = null;
    this.leaves = [];
    this.nodes = [];

    this.init(nodesData);
    this.initLeaveList();
    this.initNodeList();
}

SyntaxTree.prototype = {
    /**
     * Build the tree, based on the json from Leuven
     * @param nodesData [Object, parentID, Object, parentID, ...]
     */
    init: function(nodesData) {
        for(var i = 0; i < nodesData.length; i+= 2) {
            var node = nodesData[i];
            var parentID = nodesData[i + 1];

            if(parentID === null) {
                // This the root
                this.root = new SyntaxNode(node.nodeatts, null);
            } else {
                this.root.extendTree(node, parentID);
            }
        }
    },

    initLeaveList: function() {
        if(this.root !== null) {
            // Add all leaves to the list
            this.root.addLeaves(this.leaves);

            // Sort leaves list in order of occurence in the sentence
            this.leaves.sort(function(leaveA, leaveB) {
                var orderA = parseInt(leaveA.attributes["begin"]);
                var orderB = parseInt(leaveB.attributes["begin"]);

                if(orderA < orderB) {
                    return -1;
                } else if(orderA > orderB) {
                    return 1;
                } else {
                    return 0;
                }
            });

            // Let the leaves know what their index is
            for(var i = 0; i < this.leaves.length; i++) {
                this.leaves[i].setTokenIndex(i);
            }
        }
    },

    initNodeList: function() {
        if(this.root !== null) {
            this.root.addNodes(this.nodes);
        }
    },

    getTokens: function() {
        var result = [];

        for(var i = 0; i < this.leaves.length; i++) {
            result.push(this.leaves[i].attributes["word"]);
        }

        return result;
    },

    getIntraNodesIndexes: function(groupIndex) {
        var result = [];
        var nodes = [];

        if(this.root !== null) {
            this.root.collectIntraNodes(groupIndex, nodes);
        }

        for(var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].tokenIndex);
        }

        return result;
    },

    getInterNodesIndexes: function(groupIndex) {
        var result = [];
        var nodes = [];

        if(this.root !== null) {
            this.root.collectInterNodes(groupIndex, nodes);
        }

        for(var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].tokenIndex);
        }

        return result;
    },

    print: function() {
        if(this.root === null) {
            console.log("root: null");
        } else {
            this.root.printNode(0);
        }
    },

    printLeaves: function() {
        for(var i = 0; i < this.leaves.length; i++) {
            console.log(i + " " + this.leaves[i].attributes["word"]);
        }
    },

    toZoomableHTML: function() {
        if(this.root != null) {
            return this.root.toZoomableHTML("", 0);
        }
    }
};