/************************************************************************
 *               avalon.rebind node-avalon 绑定恢复                     *
 ************************************************************************/
new function () {
    var bindingExecutors = avalon.bindingExecutors
    var bindingHandlers = avalon.bindingHandlers
    avalon.rebind = function (bindings, vmodelIds) {
        var vmodels = vmodelIds.map(function (id) {
            return avalon.vmodels[id]
        })
        for (var i = 0, data; data = bindings[i++]; ) {
            var rebindFn = avalon.rebind[data.type]
            if (typeof rebindFn === "function") {
                rebindFn(data, vmodels, this)
            }
        }
    }
    function noop() {
    }
    function injectBinding(name, data, vmodels) {
        var fn = bindingExecutors[name]
        bindingExecutors[name] = noop //防止刷新视图
        bindingHandlers[name](data, vmodels)
        bindingExecutors[name] = fn
        data.handler = bindingExecutors[data.handlerName || name]
    }
    avalon.mix(avalon.rebind, {
        text: function (data, vmodels, elem) {
            // 如果是插值表达式
            // 将 node-avalon 生成的 span 元素用文本节点替换
            var parent = elem.parentNode
            var textNode = elem.childNodes[0].cloneNode(false)
            parent.replaceChild(textNode, elem)
            data.element = textNode
            injectBinding("text", data, vmodels)
        },
        include: function (data, vmodels, elem) {
            data.element = elem
            if (data.template) {
                var arr = data.template.split(" ")
                var key = arr.shift()
                var val = arr.join(' ')
                avalon.templateCache[key] = val
                delete data.template
            }
            injectBinding("attr", data, vmodels)
            elem.removeChild(elem.firstChild)
            elem.removeChild(elem.lastChild)
            data.startInclude = elem.firstChild
            data.endInclude = elem.lastChild
        }
    })
    "title,alt,src,value,css,href".replace(avalon.rword, function (name) {
        avalon.rebind[name] = avalon.rebind.attr
    })
}