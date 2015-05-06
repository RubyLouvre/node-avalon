bindingHandlers.text = function(data, vmodels) {
	parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.text = function(val, elem) {
	val = val == null ? "" : val //不在页面上显示undefined null
	if (elem.nodeName === "#text") { //绑定在文本节点上
		elem.value = val
	} else { //绑定在特性节点上
		DOM.innerText(elem, val)
	}
}