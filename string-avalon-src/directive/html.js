bindingHandlers.html = function(data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.html = function(val, elem, data) {
    bindForBrowser(data)
    val = val == null ? "" : val
    var parent = data.element

    if (!parent) {
        return
    }
    if (typeof val === "string") {
        var nodes = avalon.parseHTML(val).childNodes
    } else if (val) {
        if (DOM.nodeType(val) === 11) { //将val转换为文档碎片
            nodes = val.childNodes
        } else if (DOM.nodeType(val) === 1) {
            nodes = val.childNodes
        } else {
            nodes = []
        }
    }

    if (!nodes.length) {
        nodes.push(DOM.createComment("ms-html"))
    }
    var args = nodes.map(function(node) {
        node.parentNode = parent
        return node
    })
    var children = parent.childNodes
    
    var index = children.indexOf(elem)
    args.unshift(index, children.length)
    Array.prototype.splice.apply(children, args)
    
    scanNodeArray(nodes, data.vmodels)
}