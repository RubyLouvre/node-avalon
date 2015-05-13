bindingHandlers.text = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.text = function (val, elem) {
    val = val == null ? "" : val //不在页面上显示undefined null
    if (elem.nodeName === "#text") { //绑定在文本节点上
        console.log("++++++++++++++"+ val)
        elem.value = String(val)
     //   if(!elem.xxxx)
            elem.xxx = '22222222'
    } else { //绑定在特性节点上
        DOM.innerText(elem, val)
    }
}