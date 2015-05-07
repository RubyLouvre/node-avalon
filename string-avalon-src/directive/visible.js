//这里提供了所有特殊display的元素 http://www.htmldog.com/reference/cssproperties/display/
var specialDisplay = {
    table: "table",
    td: "table-cell",
    th: "table-cell",
    tr: "table-row",
    li: "list-item",
    thead: "table-header-group",
    tfoot: "table-footer-group",
    tbody: "table-row-group",
    colgroup: "table-column-group",
    col: "table-column",
    caption: "caption"
}
var rdisplay = /display\s*\:\s*([\w-]+)\s*;?/
bindingHandlers.visible = function (data, vmodels) {
    var elem = data.element
    //http://stackoverflow.com/questions/8228980/reset-css-display-property-to-default-value
    var style = DOM.getAttribute(elem, "style")
    if (style) { //如果用户在元素上设置了display
        var array = style.match(rdisplay) || []
        if (array[1]) {
            data.display = array[1]
        }
    }
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors.visible = function (val, elem, data) {
    var style = DOM.getAttribute(elem, "style")
    if (val) { //如果要显示,如果在元素设置display:none,那么就去掉
        if (style && data.display) {
            var replaced = data.display === "none" ? "" : data.display
            DOM.setAttribute(elem, "style", style.replace(rdisplay, replaced))
        }
    } else {  //如果要隐藏
        var cssText = !style ? "style:none;" : style.replace(rdisplay, "display:none;")
        DOM.setAttribute(elem, "style", cssText)
    }
}