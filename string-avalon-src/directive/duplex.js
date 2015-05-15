//双工绑定
var duplexBinding = bindingHandlers.duplex = function (data, vmodels) {
    bindForBrowser(data);
    var elem = data.element,
            hasCast
    var params = []
    var tagName = elem.tagName.toUpperCase()
    parseExprProxy(data.value, vmodels, data, 0, 1)

    data.changed = getBindingCallback(elem, "data-duplex-changed", vmodels) || noop
    if (data.evaluator && data.args) {
        var casting = oneObject("string,number,boolean,checked")
        if (elem.type === "radio" && data.param === "") {
            data.param = "checked"
        }
        if (elem.msData) {
            elem.msData["ms-duplex"] = data.value
        }
        data.param.replace(/\w+/g, function (name) {
            if (/^(checkbox|radio)$/.test(DOM.getAttribute(elem, 'type')) && /^(radio|checked)$/.test(name)) {
                if (name === "radio")
                    log("ms-duplex-radio已经更名为ms-duplex-checked")
                name = "checked"
                data.isChecked = true
                
            }
            if (name === "bool") {
                name = "boolean"
                log("ms-duplex-bool已经更名为ms-duplex-boolean")
            } else if (name === "text") {
                name = "string"
                log("ms-duplex-text已经更名为ms-duplex-string")
            }
            if (casting[name]) {
                hasCast = true
            }
            avalon.Array.ensure(params, name)
        })
        if (!hasCast) {
            params.push("string")
        }
        data.param = params.join("-")
        data.pipe = pipe
        duplexBinding[tagName] && duplexBinding[tagName](elem, data.evaluator.apply(null, data.args), data)
    }
}
//不存在 bindingExecutors.duplex
function fixNull(val) {
    return val == null ? "" : val
}
avalon.duplexHooks = {
    checked: {
        get: function (val, data) {
            return !data.element.oldValue
        }
    },
    string: {
        get: function (val) { //同步到VM
            return val
        },
        set: fixNull
    },
    "boolean": {
        get: function (val) {
            return val === "true"
        },
        set: fixNull
    },
    number: {
        get: function (val, data) {
            var number = parseFloat(val)
            if (-val === -number) {
                return number
            }
            var arr = /strong|medium|weak/.exec(DOM.getAttribute(data.element, "data-duplex-number")) || ["medium"]
            switch (arr[0]) {
                case "strong":
                    return 0
                case "medium":
                    return val === "" ? "" : 0
                case "weak":
                    return val
            }
        },
        set: fixNull
    }
}

function pipe(val, data, action, e) {
    data.param.replace(/\w+/g, function (name) {
        var hook = avalon.duplexHooks[name]
        if (hook && typeof hook[action] === "function") {
            val = hook[action](val, data)
        }
    })
    return val
}



duplexBinding.INPUT = function (elem, evaluator, data) {
    var val = evaluator()
    var $type = DOM.getAttribute(elem, "type")
    var elemValue = DOM.getAttribute(elem, "value")
    if (data.isChecked || $type === "radio") {
        var checked = data.isChecked ? !!val : val + "" === elemValue
        DOM.setBoolAttribute(elem, "checked", checked)
        DOM.setAttribute(elem, "oldValue", String(checked))
        var needSet = true
    } else if ($type === "checkbox") {
        var array = [].concat(val) //强制转换为数组
        var checked = array.indexOf(data.pipe(elemValue, data, "get")) > -1
        DOM.setBoolAttribute(elem, "checked", checked)
    } else {
        val = data.pipe(val, data, "set")
        DOM.setAttribute(elem, "value", String(val))
    }
    // if (!needSet)
    //    DOM.setAttribute(elem, "oldValue", String(oldValue))
}
duplexBinding.TEXTAREA = function (elem, evaluator, data) {
    var val = evaluator()
    val = data.pipe(val, data, "set")
    elem.childNodes.splice(0, 1, {
        nodeName: "#text",
        value: val,
        nodeType: 1,
        parentNode: elem
    })
}
duplexBinding.SELECT = function (elem, evaluator, data) {
    var val = evaluator()
    val = Array.isArray(val) ? val.map(String) : val + ""
    DOM.setAttribute(elem, "oldValue", String(val))

    elem.msCallback = function () {
        avalon(elem).val(val)
        var $s = data.evaluator.apply(0, data.args || [])();
        var $events = $s.$events
        var $list = ($events || {})[subscribers]
        if ($list && avalon.Array.ensure($list, data)) {
            addSubscribers(data, $list)
        }
    }

    data.handler = function() {
        var val = evaluator();
        var isMultiple = DOM.hasAttribute(elem, "multiple");

        val = val && val.$model || val 
        if (Array.isArray(val)) {
            if (!isMultiple) {
                log("ms-duplex在<select multiple=true>上要求对应一个数组")
            }
        } else {
            if (isMultiple) {
                log("ms-duplex在<select multiple=false>不能对应一个数组")
            }
        }
        //必须变成字符串后才能比较
        val = Array.isArray(val) ? val.map(String) : val + ""
        if (val !== DOM.getAttribute(elem, "oldValue")) {
            avalon(elem).val(val);
            DOM.getAttribute(elem, "oldValue", val);
        }
    }
    // option 元素添加 selected 属性
//    elem.childNodes.some(function(item) {//optgroup
//        if (item.nodeName === 'option') {
//            if (DOM.getAttribute(item, 'value') == val) {
//                DOM.setAttribute(item, 'selected', 'selected')
//                return true
//            }
//        }
//    })
}
