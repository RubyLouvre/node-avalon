/*********************************************************************
 *                        avalon的原型方法定义区                        *
 **********************************************************************/

function hyphen(target) {
    //转换为连字符线风格
    return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
}

function camelize(target) {
    //转换为驼峰风格
    if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
        return target //提前判断，提高getStyle等的效率
    }
    return target.replace(/[-_][^-_]/g, function (match) {
        return match.charAt(1).toUpperCase()
    })
}

avalon.fn.mix({
    hasClass: function (cls) {
        var array = this.attr("class") || ""
        array = array.split(/\s+/)
        return array.indexOf(cls) !== -1
    },
    toggleClass: function (value, stateVal) {
        var className, i = 0
        var classNames = String(value).split(/\s+/)
        var isBool = typeof stateVal === "boolean"
        while ((className = classNames[i++])) {
            var state = isBool ? stateVal : !this.hasClass(className)
            this[state ? "addClass" : "removeClass"](className)
        }
        return this
    },
    addClass: function (cls) {
        var array = this.attr("class") || ""
        array = array.split(/\s+/)
        if (array.indexOf(cls) !== -1) {
            array.push(cls)
            this.attr("class", array.join(" ").trim())
        }
        return this
    },
    removeClass: function (cls) {
        var classes = this.attr("class") || ""
        classes = (" " + classes + " ").replace(" " + cls + " ", " ").trim()
        this.attr("class", classes)
        return this
    },
    attr: function (name, value) {
        if (arguments.length === 2) {
            DOM.setAttribute(this[0], name, value)
            return this
        } else {
            return DOM.getAttribute(this[0], name)
        }
    },
    data: function (name, value) {
        name = "data-" + hyphen(name || "")
        switch (arguments.length) {
            case 2:
                this.attr(name, value)
                return this
            case 1:
                var val = this.attr(name)
                return parseData(val)
            case 0:
                var ret = {}
                ap.forEach.call(this[0].attributes, function (attr) {
                    if (attr) {
                        name = attr.name
                        if (!name.indexOf("data-")) {
                            name = camelize(name.slice(5))
                            ret[name] = parseData(attr.value)
                        }
                    }
                })
                return ret
        }
    },
    removeData: function (name) {
        name = "data-" + hyphen(name)
        this[0].removeAttribute(name)
        return this
    },
    css: function (name, value) {
        console.warn("string-avalon不存在fn.css方法")
    },
    position: function () {
        console.warn("string-avalon不存在fn.position方法")
    },
    offsetParent: function () {
        console.warn("string-avalon不存在fn.offsetParent方法")

    },
    bind: function (type, fn, phase) {
        console.warn("string-avalon不存在fn.bind方法")
    },
    unbind: function (type, fn, phase) {
        console.warn("string-avalon不存在fn.unbind方法")
        return this
    },
    val: function (value) {
        var node = this[0]
        if (node && DOM.nodeType(node) === 1) {
            var get = arguments.length === 0
            var access = get ? ":get" : ":set"
            var fn = valHooks[getValType(node) + access]
            if (fn) {
                var val = fn(node, value)
            } else if (get) {
                return (this.attr("value") || "").replace(/\r/g, "")
            } else {
                this.attr("value", String(value))
            }
        }
        return get ? val : this
    }
})


var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/
avalon.parseJSON = JSON.parse

function parseData(data) {
    try {
        if (typeof data === "object")
            return data
        data = data === "true" ? true :
                data === "false" ? false :
                data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? JSON.parse(data) : data
    } catch (e) {
    }
    return data
}
avalon.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
}, function (method, prop) {
    avalon.fn[method] = function (val) {
        console.warn("string-avalon不存在fn." + method + "方法")
    }
})

//=============================css相关==================================
var cssHooks = avalon.cssHooks = createMap()
var prefixes = ["", "-webkit-", "-moz-", "-ms-"] //去掉opera-15的支持

avalon.cssNumber = {}
avalon.cssName = function (name, host, camelCase) {
    console.warn("string-avalon不存在avalon.cssName方法")
}

"Width,Height".replace(rword, function (name) { //fix 481
    var method = name.toLowerCase()
    avalon.fn[method] = function (value) { //会忽视其display
        console.warn("string-avalon不存在fn." + method + "方法")
    }
    avalon.fn["inner" + name] = function () {
        console.warn("string-avalon不存在fn.inner" + name + "方法")
    }
    avalon.fn["outer" + name] = function () {
        console.warn("string-avalon不存在fn.outer" + name + "方法")
    }
})
avalon.fn.offset = function () { //取得距离页面左右角的坐标
    console.warn("string-avalon不存在fn.offset方法")
    return {
        left: 0,
        top: 0
    }
}
//=============================val相关=======================

function getValType(elem) {
    var ret = elem.tagName.toLowerCase()
    return ret === "input" && /checkbox|radio/.test(DOM.getAttribute(elem, "type")) ? "checked" : ret
}

function collectSelectedOptions(children, array) {
    for (var i = 0, el; el = children[i++]; ) {
        if (el.nodeName.toUpperCase() === "OPTGROUP") {
            if (!isDisabled(el))
                collectSelectedOptions(el.childNodes || [], array)
        } else if (!isDisabled(el) && isSelected(el)) {
            array.push(getOptionValue(el))
        }
    }
}
function collectOptions(children, array) {
    for (var i = 0, el; el = children[i++]; ) {
        if (el.nodeName.toUpperCase() === "OPTGROUP") {
            collectOptions(el.childNodes, array)
        } else if (el.nodeName.toUpperCase() === "OPTION") {
            array.push(el)
        }
    }
}
function isDisabled(el) {
    return DOM.hasAttribute(el, "disabled")
}
function isSelected(el) {
    return DOM.hasAttribute(el, "selected")
}
function isSelectMultiple(el) {
    return DOM.hasAttribute(el, "multiple") || DOM.getAttribute(el, "type") === "select-multiple"
}

function getOptionValue(el) {
    var value = DOM.getAttribute(el, "value")
    if (typeof value === "string")
        return value
    var text = el.childNodes[0]
    if (text)
        return text.value
    return ""
}

var valHooks = {
    "select:get": function (node) {
        var array = []
        collectSelectedOptions(node.childNodes, array)
        var isMultiple = isSelectMultiple(node)
        return isMultiple ? array : array[0]
    },
    "select:set": function (node, values) {
        values = [].concat(values) //强制转换为数组
        var options = collectOptions(node.childNodes)
        var isMultiple = isSelectMultiple(node)
        var selectedIndex = -1
        for (var i = 0, el; el = options[i]; i++) {
            var value = getOptionValue(el)
            var toggle = values.indexOf(value) > -1
            if (toggle) {
                DOM.setAttribute(el, "selected", "selected")
                selectedIndex = i
            } else {
                DOM.removeAttribute(el, "selected")
            }
        }
        if (!isMultiple) {
            DOM.setAttribute(node, "selectedIndex", String(selectedIndex))
        }
    }
}