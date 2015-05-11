// bindingHandlers.data 定义在if.js
bindingExecutors.data = function(val, elem, data) {
    var key = "data-" + data.param
    if (val && typeof val === "object") {
        console.warn("ms-data对应的值必须是简单数据类型")
    } else {
        DOM.setAttribute(elem, key, String(val))
    }
}
