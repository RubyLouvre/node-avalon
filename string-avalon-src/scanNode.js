function scanNodeArray(nodes, vmodels) {
    for (var i = 0, node; node = nodes[i++]; ) {
        scanNode(node, vmodels)
    }
}
function scanNode(node, vmodels) {
    switch (DOM.nodeType(node)) {
        case 3: //如果是文本节点
            node.nodeType = 3
            scanText(node, vmodels)
            break
        case 8://如果是注释节点
            node.nodeType = 8
            scanText(node, vmodels)
            break
        case 1://如果是元素节点
            node.nodeType = 1
            scanTag(node, vmodels)
            break
    }
}