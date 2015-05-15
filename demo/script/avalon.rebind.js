/************************************************************************
 *               avalon.rebind node-avalon 绑定恢复                     *
 ************************************************************************/
avalon.rebind = function (bindings, vmodelIds) {
    var element = this,
            vmodels = vmodelIds.map(function (id) {
                return avalon.vmodels[id]
            })
    var getBindingCallback = function (elem, name, vmodels) {
        var callback = elem.getAttribute(elem)
        if (callback) {
            for (var i = 0, vm; vm = vmodels[i++]; ) {
                if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                    return vm[callback]
                }
            }
        }
    }
    for (var i = 0, data; data = bindings[i++]; ) {
        data.vmodels = vmodels
        if (data.type === 'text') {
            // 如果是插值表达式
            // 将 node-avalon 生成的 span 元素用文本节点替换
            var parent = element.parentNode,
                    textNode = element.childNodes[0].cloneNode(false)

            parent.replaceChild(textNode, element)
            data.element = textNode
            avalon.bindingHandlers[data.type](data, vmodels)
        } else if (data.type === 'include') {
            var elem = data.element = this
            data.includeRendered = getBindingCallback(elem, "data-include-rendered", vmodels)
            data.includeLoaded = getBindingCallback(elem, "data-include-loaded", vmodels)
            data.includeReplace = !!avalon(elem).data("includeReplace")
            if (avalon(elem).data("includeCache")) {
                data.templateCache = {}
            }
            data.startInclude = elem.firstChild
            data.endInclude = elem.lastChild
            data.handlerName = "attr"
            if (data.template) {
                var arr = data.template.split(" ")
                var key = arr.shift()
                var val = arr.join(' ')
                avalon.templateCache[key] = val
            }
            avalon.parseExprProxy(data.value, vmodels, data)
        } else {
            data.element = element
            avalon.bindingHandlers[data.type](data, vmodels)
        }

        // 重新渲染  data.type 绑定




    }
}