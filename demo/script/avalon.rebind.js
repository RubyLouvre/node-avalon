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
            resetData(data)
            var rebindFn = avalon.rebind[data.type]
            data.element = this
            if (typeof rebindFn === "function") {
                rebindFn(data, vmodels, this)
            }
        }
    }
    function noop() {
    }
    var priorityMap = {
        "if": 10,
        "repeat": 90,
        "data": 100,
        "widget": 110,
        "each": 1400,
        "with": 1500,
        "duplex": 2000,
        "on": 3000
    }
    function resetData(data) {
        if (data.a) {
            var arr = data.a.split("=")
            var name = arr.shift()
            var value = arr.join("=")
            arr = name.split("-")
            var type = arr.shift()
            var param = arr.join("-") || ""

            data.value = value
            data.name = "ms-" + name
            data.type = type
            data.param = param
            data.priority = type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
            delete data.a
        }
    }


    function injectBinding(name, data, vmodels) {
        var fn = bindingExecutors[name]
        bindingExecutors[name] = noop //防止刷新视图
        bindingHandlers[name](data, vmodels)
        bindingExecutors[name] = fn
        data.handler = bindingExecutors[data.handlerName || name]
    }
    avalon.mix(avalon.rebind, {
        attr: function (data, vmodels, elem) {
            injectBinding("attr", data, vmodels)
        },
        text: function (data, vmodels, elem) {
            if (data.isInText) {
                var node = elem.firstChild
                elem.parentNode.replaceChild(node, elem)
                data.element = node
                delete data.isInText
            }
            injectBinding("text", data, vmodels)
        },
        html: function(data, vmodels, elem) {
            injectBinding("html", data, vmodels)
        },
        data: function (data, vmodels, elem) {
            injectBinding("data", data, vmodels)
        },
        if: function (data, vmodels, elem) {
            var isInDom = data.isInDom
            delete data.isInDom
            if (!isInDom) {
                data.element = avalon.parseHTML(elem.text).firstChild
                elem.parentNode.replaceChild(data.element, elem)
            }
            bindingHandlers["if"](data, vmodels)
        },
        visible: function (data, vmodels, elem) {
            var inlineDisplay = data.inlineDisplay
            inlineDisplay = inlineDisplay === "none" ? "" : inlineDisplay
            var isShow = data.isShow
            delete data.inlineDisplay
            delete data.isShow
            injectBinding("visible", data, vmodels)
            if (inlineDisplay) {
                data.display = inlineDisplay
            }
            elem.style.display = isShow ? inlineDisplay : "none"
        },
        include: function (data, vmodels, elem) {

            if (data.template) {
                var arr = data.template.split(" ")
                var key = arr.shift()
                var val = arr.join(' ')
                avalon.templateCache[key] = val
                delete data.template
            }
            injectBinding("attr", data, vmodels)
            if (data.includeReplace) {
                var f = document.createDocumentFragment()
                while (elem.firstChild) {
                    f.appendChild(elem.firstChild)
                }
                f.removeChild(f.firstChild)
                f.removeChild(f.lastChild)
                var parent = elem.parentNode
                parent.replaceChild(f, elem)
            } else {
                elem.removeChild(elem.firstChild)
                elem.removeChild(elem.lastChild)
                data.startInclude = elem.firstChild
                data.endInclude = elem.lastChild
            }


        }
    })
    "title,alt,src,value,css,href".replace(avalon.rword, function (name) {
        avalon.rebind[name] = avalon.rebind.attr
    })
}