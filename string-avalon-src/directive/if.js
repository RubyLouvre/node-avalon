bindingHandlers["data"] = bindingHandlers["if"] = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors["if"] = function (val, elem, data) {
    if (val) {
        if (DOM.getAttribute(elem, data.name)) {
            DOM.removeAttribute(elem, data.name)
            scanAttr(elem, data.vmodels) //继续往下扫描
        }
    } else {
        //生成一个<script type="avalon">xxxx</script>占据原来的位置
        var node = DOM.createElement("script")
        DOM.setAttribute(node, "type", "avalon")
         DOM.removeAttribute(elem, data.name)
        DOM.innerText(node, DOM.outerHTML(elem))
        DOM.replaceChild(node, elem)
        data.element = node
    }
    data.isInDom = !!val
    bindForBrowser(data)
}
