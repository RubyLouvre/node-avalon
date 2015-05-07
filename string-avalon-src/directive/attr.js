var bools = ["autofocus,autoplay,async,allowTransparency,checked,controls",
    "declare,disabled,defer,defaultChecked,defaultSelected",
    "contentEditable,isMap,loop,multiple,noHref,noResize,noShade",
    "open,readOnly,selected"
].join(",")
var boolMap = {}
bools.replace(rword, function (name) {
    boolMap[name.toLowerCase()] = name
})


var cacheTmpls = avalon.templateCache = {}

bindingHandlers.attr = function (data, vmodels) {
    var text = data.value.trim(),
            simple = true
    if (text.indexOf(openTag) > -1 && text.indexOf(closeTag) > 2) {
        simple = false
        if (rexpr.test(text) && RegExp.rightContext === "" && RegExp.leftContext === "") {
            simple = true
            text = RegExp.$1
        }
    }
    if (data.type === "include") {
        var elem = data.element
        data.includeRendered = getBindingCallback(elem, "data-include-rendered", vmodels)
        data.includeLoaded = getBindingCallback(elem, "data-include-loaded", vmodels)
        var outer = data.includeReplace = !!avalon(elem).data("includeReplace")
        if (avalon(elem).data("includeCache")) {
            data.templateCache = {}
        }
        data.startInclude = DOM.createComment("ms-include")
        data.endInclude = DOM.createComment("ms-include-end")
        DOM.removeAttribute(elem, data.name)
        if (outer) {
            var parent = elem.parentNode
            data.startInclude.parentNode = data.endInclude.parentNode = parent
            var children = parent.childNodes
            var index = children.indexOf(elem)
            data.element = data.startInclude
            children.splice(index, 1, data.startInclude, elem, data.endInclude)
        } else {
            data.startInclude.parentNode = data.endInclude.parentNode = elem
            var children = elem.childNodes
            children.unshift(data.startInclude)
            children.push(data.endInclude)
        }
    }
    data.handlerName = "attr" //handleName用于处理多种绑定共用同一种bindingExecutor的情况
    parseExprProxy(text, vmodels, data, (simple ? 0 : scanExpr(data.value)))
}
bindingExecutors.attr = function (val, elem, data) {
    var method = data.type
    var attrName = data.param
    if (method === "attr") {
        // ms-attr-class="xxx" vm.xxx="aaa bbb ccc"将元素的className设置为aaa bbb ccc
        // ms-attr-class="xxx" vm.xxx=false  清空元素的所有类名
        // ms-attr-name="yyy"  vm.yyy="ooo" 为元素设置name属性
        var toRemove = (val === false) || (val === null) || (val === void 0)
        if (boolMap[attrName]) {
            if (!val) {
                toRemove = true
            } else {
                return DOM.setAttribute(elem, attrName, attrName)
            }
        }
        if (toRemove) {
            return DOM.removeAttribute(elem, attrName)
        }
        DOM.setAttribute(elem, attrName, val)
    } else if (method === "include" && val) {
        return
        var vmodels = data.vmodels
        var rendered = data.includeRendered
        var loaded = data.includeLoaded
        var replace = data.includeReplace
        var target = replace ? elem.parentNode : elem
        var scanTemplate = function (text) {
            if (loaded) {
                var newText = loaded.apply(target, [text].concat(vmodels))
                if (typeof newText === "string")
                    text = newText
            }
            if (rendered) {
                console.log("不支持data-include-rendered")
            }
            var lastID = data.includeLastID
            if (data.templateCache && lastID && lastID !== val) {
                var lastTemplate = data.templateCache[lastID]
                if (!lastTemplate) {
                    lastTemplate = data.templateCache[lastID] = DOC.createElement("div")
                    ifGroup.appendChild(lastTemplate)
                }
            }
            while (true) {
                var node = data.startInclude.nextSibling
                if (node && node !== data.endInclude) {
                    target.removeChild(node)
                    if (lastTemplate)
                        lastTemplate.appendChild(node)
                } else {
                    break
                }
            }
            var dom = getTemplateNodes(data, val, text)
            var nodes = avalon.slice(dom.childNodes)
            target.insertBefore(dom, data.endInclude)
            scanNodeArray(nodes, vmodels)
        }
        var path = require("path")
        if (data.param === "src") {
            if (typeof cacheTmpls[val] === "string") {
                scanTemplate(cacheTmpls[val])
            } else {
                var text = path.resolve(__dirname, val)
                cacheTmpls[val] = text
                scanTemplate(text)
            }
        } else {
            //IE系列与够新的标准浏览器支持通过ID取得元素（firefox14+）
            //http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
            var el = val && val.nodeType == 1 ? val : DOC.getElementById(val)
            avalon.nextTick(function () {
                scanTemplate(el.value || el.innerText || el.innerHTML)
            })
        }
    } else {
        DOM.setAttribute(elem, method, val) //ms-href, ms-src
    }
}

function getTemplateNodes(data, id, text) {
    var div = data.templateCache && data.templateCache[id]
    if (div) {
        var dom = DOC.createDocumentFragment(),
                firstChild
        while (firstChild = div.firstChild) {
            dom.appendChild(firstChild)
        }
        return dom
    }
    return avalon.parseHTML(text)
}

//这几个指令都可以使用插值表达式，如ms-src="aaa/{{b}}/{{c}}.html"ms-src
"title,alt,src,value,include,href".replace(rword, function (name) {
    bindingHandlers[name] = bindingHandlers.attr
})