// Color constants for tree nodes
const TreeColor = {
  RED: "RED",
  BLACK: "BLACK",
};

// Class representing a node in the red-black tree structure
class RBNode {
  constructor(data, ancestor = null) {
    this.data = data;
    this.leftChild = null;
    this.rightChild = null;
    this.ancestor = ancestor;
    this.shade = TreeColor.RED; // New nodes are always red initially
  }
}

class BalancedRBTree {
  constructor() {
    this.rootNode = null;
  }

  // Adds a new value to the tree, inserting it at the appropriate position and rebalancing to maintain red-black properties
  addValue(data) {
    const addRecursively = (node) => {
      const currentNode = node;
      // If value is less than current node's value, go left
      if (data < currentNode.data) {
        // If current node has a left child, continue traversing left
        if (currentNode.leftChild) {
          console.log(`Traversing left from node ${currentNode.data}`);
          // Recursive call with left child as new current node
          addRecursively(currentNode.leftChild);
        } else {
          // If current node has no left child, insert new node as left child
          console.log(`Inserting ${data} as the left child of ${currentNode.data}`);
          currentNode.leftChild = new RBNode(data);
          currentNode.leftChild.ancestor = currentNode;
          this._balanceAfterAdd(currentNode.leftChild);
        }
      }
      // If value is greater than current node's value, go right
      else if (data > currentNode.data) {
        if (currentNode.rightChild) {
          console.log(`Traversing right from node ${currentNode.data}`);
          addRecursively(currentNode.rightChild);
        } else {
          console.log(`Inserting ${data} as the right child of ${currentNode.data}`);
          currentNode.rightChild = new RBNode(data);
          currentNode.rightChild.ancestor = currentNode;
          this._balanceAfterAdd(currentNode.rightChild);
        }
      } else {
        // Handle duplicates
        console.log(`Value ${data} already exists in the tree. No duplicates allowed.`);
      }
    };

    // If tree is empty, insert as root node and color black
    if (!this.rootNode) {
      console.log(`Inserting ${data} as the root node.`);
      this.rootNode = new RBNode(data);
      this.rootNode.shade = TreeColor.BLACK; // Root must always be black
    } else {
      // If root exists, call helper function to insert new node
      console.log(`Starting insertion of ${data}`);
      addRecursively(this.rootNode);
    }
  }

  // Restores red-black tree properties after insertion by performing rotations and color changes as needed
  _balanceAfterAdd(node) {
    let currentNode = node;
    // Continue while parent is red and not null. Stop at root or when parent is no longer red
    while (this._isNodeRed(currentNode.ancestor) && currentNode.ancestor.ancestor) {
      const { ancestor } = currentNode;
      const grandAncestor = ancestor.ancestor;

      console.log(`Balancing at node ${currentNode.data}, parent ${ancestor.data}, grandparent ${grandAncestor.data}`);

      // If parent node is left child of grandparent
      if (ancestor === grandAncestor.leftChild) {
        const uncleNode = grandAncestor.rightChild;
        // If uncle is red, flip colors up to grandparent
        if (this._isNodeRed(uncleNode)) {
          console.log(`Uncle ${uncleNode.data} is red. Flipping colors of grandparent ${grandAncestor.data}.`);
          this._invertColors(grandAncestor);
        } else {
          // If current node is right child of parent, rotate left around parent
          if (currentNode === ancestor.rightChild) {
            console.log(`Current node ${currentNode.data} is right child of its parent ${ancestor.data}. Performing left rotation on parent.`);
            this._rotateLeft(ancestor);
            currentNode = ancestor;
          }
          // Rotate right around grandparent
          console.log(`Performing right rotation on grandparent ${grandAncestor.data}.`);
          this._rotateRight(grandAncestor);
        }
      } else {
        // If parent node is right child of grandparent
        const uncleNode = grandAncestor.leftChild;
        // If uncle is red, flip color
        if (this._isNodeRed(uncleNode)) {
          console.log(`Uncle ${uncleNode.data} is red. Flipping colors of grandparent ${grandAncestor.data}.`);
          this._invertColors(grandAncestor);
          currentNode = grandAncestor;
        } else {
          // If current node is left child of parent, rotate right around parent
          if (currentNode === ancestor.leftChild) {
            console.log(`Current node ${currentNode.data} is left child of its parent ${ancestor.data}. Performing right rotation on parent.`);
            this._rotateRight(ancestor);
            currentNode = ancestor;
          }
          // Rotate left around grandparent
          console.log(`Performing left rotation on grandparent ${grandAncestor.data}.`);
          this._rotateLeft(grandAncestor);
        }
      }
      // Update current node to grandparent to continue up the tree and fix additional issues
      currentNode = grandAncestor;
    }
    // Finally ensure root is always black
    if (this.rootNode.shade !== TreeColor.BLACK) {
      console.log(`Setting root color to black.`);
      this.rootNode.shade = TreeColor.BLACK;
    }
  }

  // Removes a specified value from the tree and rebalances to maintain red-black properties
  removeValue(data, node = this.rootNode) {
    console.log(`Attempting to delete value ${data}`);

    // Search for the node to delete
    const targetNode = this.findNode(data, node);

    // If value doesn't exist in tree, return false
    if (!targetNode) {
      console.log(`Value ${data} not found in the tree.`);
      return false;
    }

    console.log(`Found node with value ${data}`);

    // If targetNode is a leaf (no children)
    if (!targetNode.leftChild && !targetNode.rightChild) {
      console.log(`Node ${data} is a leaf node.`);
      // If node is red, it can be removed without breaking red-black properties
      if (this._isNodeRed(targetNode)) {
        console.log(`Node ${data} is red, simply removing it.`);
        this._substituteParent(targetNode, null);
      } else {
        // If node is black, perform balancing to maintain red-black properties
        console.log(`Node ${data} is black, needs balancing after removal.`);
        this._balanceAfterRemove(targetNode);
        this._substituteParent(targetNode, null);
      }
    } else if (!targetNode.leftChild || !targetNode.rightChild) {
      // If targetNode has only one child
      if (targetNode.leftChild) {
        console.log(`Node ${data} has only left child.`);
        // Replace targetNode with its left child and color it black
        targetNode.leftChild.shade = TreeColor.BLACK;
        targetNode.leftChild.ancestor = targetNode.ancestor;
        this._substituteParent(targetNode, targetNode.leftChild);
      } else {
        console.log(`Node ${data} has only right child.`);
        // Replace targetNode with its right child and color it black
        targetNode.rightChild.shade = TreeColor.BLACK;
        targetNode.rightChild.ancestor = targetNode.ancestor;
        this._substituteParent(targetNode, targetNode.rightChild);
      }
    } else {
      // If targetNode has two children
      console.log(`Node ${data} has two children, finding in-order successor.`);
      // Find in-order successor (smallest value in right subtree)
      const successor = this.findMinNode(targetNode.rightChild);
      console.log(`In-order successor is ${successor.data}`);
      // Replace targetNode's value with successor's value
      targetNode.data = successor.data;
      // Delete successor from right subtree
      this.removeValue(successor.data, targetNode.rightChild);
    }

    console.log(`Deletion of value ${data} completed.`);
    return this.rootNode;
  }

  // Restores red-black tree properties after deletion by performing rotations and color changes as needed
  _balanceAfterRemove(node) {
    let currentNode = node;

    // Loop until currentNode is root or currentNode is red
    while (currentNode !== this.rootNode && !this._isNodeRed(currentNode)) {
      const { ancestor } = currentNode;
      let siblingNode;

      // Check if currentNode is left child of its parent
      if (currentNode === ancestor.leftChild) {
        // Sibling is right child of parent
        siblingNode = ancestor.rightChild;

        // If sibling is red, rotate left around parent
        if (this._isNodeRed(siblingNode)) {
          console.log(`Left rotation at parent ${ancestor.data} because sibling ${siblingNode.data} is red.`);
          this._rotateLeft(ancestor);
        }

        // If both children of sibling are black
        else if (!this._isNodeRed(siblingNode.leftChild) && !this._isNodeRed(siblingNode.rightChild)) {
          // If parent is red, set parent to black and sibling to red
          if (this._isNodeRed(ancestor)) {
            console.log(`Parent ${ancestor.data} is red, setting parent to black and sibling ${siblingNode.data} to red.`);
            ancestor.shade = TreeColor.BLACK;
            siblingNode.shade = TreeColor.RED;
            break;
          }
          // If parent and siblings are black, set sibling to red and continue up the tree
          console.log(`Sibling ${siblingNode.data} and parent ${ancestor.data} are black, moving up the tree.`);
          siblingNode.shade = TreeColor.RED;
          currentNode = ancestor;
        }

        // If sibling's left child is red and right child is black
        else if (this._isNodeRed(siblingNode.leftChild) && !this._isNodeRed(siblingNode.rightChild)) {
          // Rotate right around sibling
          console.log(`Right rotation at sibling ${siblingNode.data} because left child is red.`);
          this._rotateRight(siblingNode);
        } else {
          // Rotate left around parent, set parent to black and sibling's right child to black
          console.log(`Left rotation at parent ${ancestor.data}, setting parent to black and sibling's right child to black.`);
          this._rotateLeft(ancestor);
          ancestor.shade = TreeColor.BLACK;
          siblingNode.rightChild.shade = TreeColor.BLACK;
          break;
        }
      } else {
        // If currentNode is right child of its parent
        siblingNode = ancestor.leftChild;

        // If sibling is red, rotate right around parent
        if (this._isNodeRed(siblingNode)) {
          console.log(`Right rotation at parent ${ancestor.data} because sibling ${siblingNode.data} is red.`);
          this._rotateRight(ancestor);
        }

        // If both siblings are black
        else if (!this._isNodeRed(siblingNode.leftChild) && !this._isNodeRed(siblingNode.rightChild)) {
          // If parent is red, set parent to black and sibling to red
          if (this._isNodeRed(ancestor)) {
            console.log(`Parent ${ancestor.data} is red, setting parent to black and sibling ${siblingNode.data} to red.`);
            ancestor.shade = TreeColor.BLACK;
            siblingNode.shade = TreeColor.RED;
            break;
          }
          // If parent and siblings are black, set sibling to red and continue up the tree
          console.log(`Sibling ${siblingNode.data} and parent ${ancestor.data} are black, moving up the tree.`);
          siblingNode.shade = TreeColor.RED;
          currentNode = ancestor;
        }

        // If sibling's right child is red and left child is black
        else if (this._isNodeRed(siblingNode.rightChild) && !this._isNodeRed(siblingNode.leftChild)) {
          // Rotate left around sibling
          console.log(`Left rotation at sibling ${siblingNode.data} because right child is red.`);
          this._rotateLeft(siblingNode);
        } else {
          // Rotate right around parent, set parent to black and sibling's left child to black
          console.log(`Right rotation at parent ${ancestor.data}, setting parent to black and sibling's left child to black.`);
          this._rotateRight(ancestor);
          ancestor.shade = TreeColor.BLACK;
          siblingNode.leftChild.shade = TreeColor.BLACK;
          break;
        }
      }
    }
    console.log(`Finishing balancing with currentNode: ${currentNode.data}`);
  }

  // Searches for and returns the node containing the specified value, or false if not found
  findNode(data, node = this.rootNode) {
    // If node doesn't exist, return false
    if (!node) return false;
    // If value found, return the node
    if (data === node.data) return node;
    // If value is less than node's value, search left
    if (data < node.data) return this.findNode(data, node.leftChild);
    // If value is greater than node's value, search right
    return this.findNode(data, node.rightChild);
  }

  // Replaces a node with a new node in the tree structure, updating parent references accordingly
  _substituteParent(currentNode, newNode) {
    console.log(`Replacing parent of node ${currentNode.data} with node ${newNode ? newNode.data : null}.`);
    const { ancestor } = currentNode;
    if (!ancestor) {
      this.rootNode = newNode;
    } else if (currentNode === ancestor.leftChild) {
      ancestor.leftChild = newNode;
    } else {
      ancestor.rightChild = newNode;
    }
  }

  // Performs a left rotation around a node to maintain tree balance
  _rotateLeft(node) {
    console.log(`Left rotation on node ${node.data}.`);
    const pivotNode = node.rightChild;
    node.rightChild = pivotNode.leftChild;
    pivotNode.leftChild = node;
    pivotNode.shade = node.shade;
    node.shade = TreeColor.RED;
    // Replace parent node with pivotNode
    this._substituteParent(node, pivotNode);
    pivotNode.ancestor = node.ancestor;
    node.ancestor = pivotNode;
    if (node.rightChild) {
      node.rightChild.ancestor = node;
    }
  }

  // Performs a right rotation around a node to maintain tree balance
  _rotateRight(node) {
    console.log(`Rotating right on node ${node.data}.`);
    const pivotNode = node.leftChild;
    node.leftChild = pivotNode.rightChild;
    pivotNode.rightChild = node;
    pivotNode.shade = node.shade;
    node.shade = TreeColor.RED;
    this._substituteParent(node, pivotNode);
    pivotNode.ancestor = node.ancestor;
    node.ancestor = pivotNode;
    if (node.leftChild) {
      node.leftChild.ancestor = node;
    }
  }

  // Flips the colors of a node and its children to maintain red-black properties
  _invertColors(node) {
    console.log(`Flipping color of node ${node.data} to red and its children to black.`);
    node.shade = TreeColor.RED;
    // Making the children black
    node.leftChild.shade = TreeColor.BLACK;
    node.rightChild.shade = TreeColor.BLACK;
  }

  // Checks if a node has the red color property, handling null nodes gracefully
  _isNodeRed(node) {
    return node ? node.shade === TreeColor.RED : false;
  }

  // Finds the node with the minimum value in a subtree, used during delete operations
  findMinNode(node = this.rootNode) {
    let currentNode = node;
    while (currentNode && currentNode.leftChild) {
      currentNode = currentNode.leftChild;
    }
    return currentNode;
  }
}

export default BalancedRBTree;
