bindingHandlers.html = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.html = function (val, elem, data) {
    val = val == null ? "" : val
    var isHtmlFilter = "group" in data
    var parent = isHtmlFilter ? elem.parentNode : elem
    if (!parent)
        return
    if (typeof val === "string") {
        var fragment = avalon.parseHTML(val).childNodes
    } else if (val) {
        if (DOM.nodeType(val) === 11) { //将val转换为文档碎片
            fragment = val.childNodes
        } else if (DOM.nodeType(val) === 1) {
            fragment = val.childNodes
        } else {
            fragment = []
        }
    }

    if (!fragment.length) {
        fragment.push(DOM.createComment("ms-html"))
    }
    var args = fragment.map(function (el) {
        el.parentNode = parent
        return el
    })
    var children = parent.childNodes
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    if (isHtmlFilter) {
        var newGroup = fragment.length
        var newElement = fragment[0]
        var index = children.indexOf(elem)
        args.unshift(index, data.group)
        Array.prototype.splice.apply(children, args)
        data.group = newGroup
        data.element = newElement
    } else {
        args.unshift(index, children.length)
        Array.prototype.splice.apply(children, args)
    }
    scanNodeArray(fragment, data.vmodels)
}
