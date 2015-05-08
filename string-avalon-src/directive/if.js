bindingHandlers["data"] = bindingHandlers["if"] = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors["if"] = function (val, elem, data) {
    if (val) { //插回DOM树
        if (elem.nodeName === "#comment") {
            var node = parser.parseFragment(elem.data).childNodes[0]
            var parent = elem.parentNode
            node.nodeType = 1
            node.parentNode = parent
            var children = elem.childNodes
            var index = children.indexOf(elem)
            children.splice(index, 1, node)
            elem = data.element = node
        }
        if (DOM.getAttribute(elem, data.name)) {
            DOM.removeAttribute(elem, data.name)
            scanAttr(elem, data.vmodels)
        }
    } else { //移出DOM树，并用注释节点占据原位置
        if (elem.tagName) {
            var parent = elem.parentNode
            var children = parent.childNodes
            var node = DOM.createComment(DOM.outerHTML(elem))
            node.nodeType = 8
            node.parentNode = parent
            var index = children.indexOf(elem)
            children.splice(index, 1, node)
            data.element = node
        }
    }
}
