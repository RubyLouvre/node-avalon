function scanNodeArray(nodes, vmodels) {
    for (var i = 0, node; node = nodes[i++]; ) {
        scanNode(node, vmodels)
    }
}
var scriptTypes = oneObject(["", "text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript"])

function scanNode(node, vmodels) {
    switch (DOM.nodeType(node)) {
        case 3: //如果是文本节点
            node.nodeType = 3
            scanText(node, vmodels)
            break
        case 8: //如果是注释节点
            if (kernel.commentInterpolate) {
                node.nodeType = 8
                scanText(node, vmodels)
            }
            break
        case 1: //如果是元素节点
            node.nodeType = 1
            var id = DOM.getAttribute(node, "id")
            if (id) {
                switch (node.nodeName) {
                    case "script":
                        var type = DOM.getAttribute(node, "type")
                        if (type && !scriptTypes[type]) {
                            DOM.ids[id] = node.childNodes[0].value
                        }
                        break
                    case "textarea":
                    case "noscript":
                        DOM.ids[id] = node.childNodes[0].value
                        break
                }
            }
            scanTag(node, vmodels)
            break
    }
}