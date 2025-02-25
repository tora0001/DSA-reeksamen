import RedBlackTree from "/RedBlackTree.js";

// Lav objekt af RedBlackTree
const tree = new RedBlackTree();

// Function to log messages to the message div
function logMessage(message) {
  const messageDiv = document.getElementById("message");
  const p = document.createElement("p");
  p.textContent = message;
  messageDiv.appendChild(p);
  messageDiv.scrollTop = messageDiv.scrollHeight; // Scroll to the bottom
}

// Override console.log metoden for at få den vist på hjemmesiden
(function () {
  const originalLog = console.log;
  console.log = function (message) {
    logMessage(message);
    originalLog.apply(console, arguments);
  };
})();

// Insert and delete node functions for the buttons
window.insertNode = function insertNode() {
  const value = parseInt(document.getElementById("value").value);
  if (!isNaN(value)) {
    tree.insert(value);
    updateTree();
  }
};

window.deleteNode = function deleteNode() {
  const value = parseInt(document.getElementById("deleteValue").value);
  if (!isNaN(value)) {
    tree.delete(value);
    updateTree();
  }
};

// Function to update the tree visualization
// Bliver kaldt i insertNode og deleteNode
function updateTree() {
  const data = treeToHierarchy(tree.root);
  drawTree(data);
}

// Function to convert the tree to a hierarchy object
// Bliver kaldt i updateTree
function treeToHierarchy(node) {
  if (!node) return null;
  return {
    name: node.value,
    color: node.color,
    children: [treeToHierarchy(node.left), treeToHierarchy(node.right)].filter((child) => child !== null),
  };
}

function drawTree(data) {
  const width = 600;
  const height = 400;

  // Vælg SVG elementet eller opret det hvis det ikke findes
  let svg = d3.select("#tree").select("svg");
  if (svg.empty()) {
    svg = d3.select("#tree").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(0,40)"); // Juster translate-værderi for at centrere træet

    const defs = svg.append("defs");

    // Definer gradient for links
    const gradient = defs.append("linearGradient").attr("id", "link-gradient").attr("gradientUnits", "userSpaceOnUse").attr("x1", 0).attr("y1", 0).attr("x2", width).attr("y2", height);

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6FDCE3");

    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#5C88C4");

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#5C2FC2");
  } else {
    // Brug det eksisterende g element, hvis SVG allerede findes
    svg = svg.select("g");
  }

  // Opret heierarki fra data
  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([width, height - 160]);
  treeLayout(root);

  // Links mellem noder
  const link = svg.selectAll(".link").data(root.links(), (d) => `${d.source.data.name}-${d.target.data.name}`);

  link
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    )
    .attr("stroke", "url(#link-gradient)")
    .attr("stroke-opacity", 0)
    .transition()
    .duration(750)
    .attr("stroke-opacity", 1);

  link
    .transition()
    .duration(750)
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    );

  link.exit().transition().duration(750).attr("stroke-opacity", 0).remove();

  // Opret Noder
  const node = svg.selectAll(".node").data(root.descendants(), (d) => d.data.name);

  const nodeEnter = node
    .enter()
    .append("g")
    .attr("class", (d) => `node ${d.data.color.toLowerCase()}`)
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("opacity", 0);

  nodeEnter.append("circle").attr("r", 10);

  nodeEnter
    .append("text")
    .attr("dy", 3) // Centrer teksten lodret med cirklen
    .attr("x", (d) => (d.children ? -15 : 15)) // Juster posistion baseret på om den har børn
    .style("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => d.data.name);

  nodeEnter.transition().duration(750).attr("opacity", 1);

  const nodeUpdate = node
    .transition()
    .duration(750)
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  nodeUpdate.select("circle").attr("r", 10);

  nodeUpdate.attr("class", (d) => `node ${d.data.color.toLowerCase()}`);

  node.exit().transition().duration(750).attr("opacity", 0).remove();
}
