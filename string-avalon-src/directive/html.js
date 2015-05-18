bindingHandlers.html = function(data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.html = function(val, elem, data) {
    val = val == null ? "" : val
    var isHtmlFilter = "group" in data
    var parent = isHtmlFilter ? elem.parentNode : elem
    if (!parent)
        return
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
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    if (isHtmlFilter) {
        data.group = nodes.length
        data.element = nodes[0]

        var index = children.indexOf(elem)
        args.unshift(index, data.group)
        Array.prototype.splice.apply(children, args)
    } else {
        args.unshift(index, children.length)
        Array.prototype.splice.apply(children, args)
    }
    
    bindForBrowser(data)
    scanNodeArray(nodes, data.vmodels)
}