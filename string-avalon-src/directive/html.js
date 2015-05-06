bindingHandlers.html = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.html = function (val, elem, data) {
    val = val == null ? "" : val
    var isHtmlFilter = "group" in data
    var parent = isHtmlFilter ? elem.parentNode : elem
    if (!parent)
        return
    if (DOM.nodeType(val) === 11) { //将val转换为文档碎片
        var fragment = val.childNodes
    } else if (DOM.nodeType(val) === 1) {
        fragment = val.childNodes
    } else {
        fragment = avalon.parseHTML(val).childNodes
    }
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    var comment = DOM.createComment("ms-html")
    if (isHtmlFilter) {
        var children = parent.childNodes
        var index = children.indexOf(elem)
        children.splice(index, data.group, comment)
        comment.parentNode = parent
        data.element = comment //防止被CG
    } else {
        comment.parentNode = parent
        parent.childNodes = [comment]
    }
    if (isHtmlFilter) {
        data.group = fragment.length || 1
    }
    nodes = avalon.slice(fragment)
    if (nodes[0]) {
        if (comment.parentNode)
            DOM.replaceChild(fragment, comment)
        if (isHtmlFilter) {
            data.element = nodes[0]
        }
    }
    scanNodeArray(nodes, data.vmodels)
}
