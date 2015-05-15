/*==================================================
 Copyright (c) 2013-2015 司徒正美 and other contributors
 http://www.cnblogs.com/rubylouvre/
 https://github.com/RubyLouvre
 http://weibo.com/jslouvre/
 
 Released under the MIT license
 avalon.js 1.43 built in 2015.5.15
 用于后端渲染
 */
(function(){

var parse5 = require('parse5')
var parser = new parse5.Parser()
var expose = Date.now()

    function log() {
        if (avalon.config.debug) {
            // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
            console.log.apply(console, arguments)
        }
    }
    /**
     * Creates a new object without a prototype. This object is useful for lookup without having to
     * guard against prototypically inherited properties via hasOwnProperty.
     *
     * Related micro-benchmarks:
     * - http://jsperf.com/object-create2
     * - http://jsperf.com/proto-map-lookup/2
     * - http://jsperf.com/for-in-vs-object-keys2
     */
var window = {}

    function createMap() {
        return Object.create(null)
    }

var subscribers = "$" + expose
var otherRequire = window.require
var otherDefine = window.define
var innerRequire
var stopRepeatAssign = false
var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
var rcomplexType = /^(?:object|array)$/
var rsvg = /^\[object SVG\w*Element\]$/
var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/
var oproto = Object.prototype
var ohasOwn = oproto.hasOwnProperty
var serialize = oproto.toString
var ap = Array.prototype
var aslice = ap.slice
var Registry = {} //将函数曝光到此对象上，方便访问器收集依赖
var W3C = true

var class2type = {}
"Boolean Number String Function Array Date RegExp Object Error".replace(rword, function(name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
})

    function noop() {}

    function oneObject(array, val) {
        if (typeof array === "string") {
            array = array.match(rword) || []
        }
        var result = {},
            value = val !== void 0 ? val : 1
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value
        }
        return result
    }

    //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var generateID = function(prefix) {
    prefix = prefix || "avalon"
    return (prefix + Math.random() + Math.random()).replace(/0\./g, "")
}

var avalon = function(el) { //创建jQuery式的无new 实例化结构
    return new avalon.init(el)
}
module.exports = avalon

/*视浏览器情况采用最快的异步回调*/
avalon.nextTick = function(fn) {
    process.nextTick(fn)
} // jsh

// https://github.com/rsms/js-lru
var Cache = new function() {// jshint ignore:line
    function LRU(maxLength) {
        this.size = 0
        this.limit = maxLength
        this.head = this.tail = void 0
        this._keymap = {}
    }

    var p = LRU.prototype

    p.put = function(key, value) {
        var entry = {
            key: key,
            value: value
        }
        this._keymap[key] = entry
        if (this.tail) {
            this.tail.newer = entry
            entry.older = this.tail
        } else {
            this.head = entry
        }
        this.tail = entry
        if (this.size === this.limit) {
            this.shift()
        } else {
            this.size++
        }
        return value
    }

    p.shift = function() {
        var entry = this.head
        if (entry) {
            this.head = this.head.newer
            this.head.older =
                    entry.newer =
                    entry.older =
                    this._keymap[entry.key] = void 0
        }
    }
    p.get = function(key) {
        var entry = this._keymap[key]
        if (entry === void 0)
            return
        if (entry === this.tail) {
            return  entry.value
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry.newer) {
            if (entry === this.head) {
                this.head = entry.newer
            }
            entry.newer.older = entry.older // C <-- E.
        }
        if (entry.older) {
            entry.older.newer = entry.newer // C. --> E
        }
        entry.newer = void 0 // D --x
        entry.older = this.tail // D. --> E
        if (this.tail) {
            this.tail.newer = entry // E. <-- D
        }
        this.tail = entry
        return entry.value
    }
    return LRU
}// jshint ignore:line

/*********************************************************************
 *                           配置系统                                 *
 **********************************************************************/

function kernel(settings) {
    for (var p in settings) {
        if (!ohasOwn.call(settings, p))
            continue
        var val = settings[p]
        if (typeof kernel.plugins[p] === "function") {
            kernel.plugins[p](val)
        } else if (typeof kernel[p] === "object") {
            avalon.mix(kernel[p], val)
        } else {
            kernel[p] = val
        }
    }
    return this
}
var openTag, closeTag, rexpr, rexprg, rbind, rregexp = /[-.*+?^${}()|[\]\/\\]/g

function escapeRegExp(target) {
    //http://stevenlevithan.com/regex/xregexp/
    //将字符串安全格式化为正则表达式的源码
    return (target + "").replace(rregexp, "\\$&")
}

var plugins = {
    loader: function (builtin) {
        var flag = innerRequire && builtin
        window.require = flag ? innerRequire : otherRequire
        window.define = flag ? innerRequire.define : otherDefine
    },
    interpolate: function (array) {
        openTag = array[0]
        closeTag = array[1]
        if (openTag === closeTag) {
            throw new SyntaxError("openTag!==closeTag")
        } else if (array + "" === "<!--,-->") {
            kernel.commentInterpolate = true
        } else {
            var test = openTag + "test" + closeTag
            if (test.indexOf("<") > -1) {
                throw new SyntaxError("此定界符不合法")
            }
        }
        var o = escapeRegExp(openTag),
                c = escapeRegExp(closeTag)
        rexpr = new RegExp(o + "(.*?)" + c)
        rexprg = new RegExp(o + "(.*?)" + c, "g")
        rbind = new RegExp(o + ".*?" + c + "|\\sms-")
    }
}

kernel.debug = true
kernel.plugins = plugins
kernel.plugins['interpolate'](["{{", "}}"])
kernel.paths = {}
kernel.shim = {}
kernel.maxRepeatSize = 100
avalon.config = kernel
/*********************************************************************
 *                 avalon的静态方法定义区                              *
 **********************************************************************/
avalon.init = function (el) {
    this[0] = this.element = el
}
avalon.fn = avalon.prototype = avalon.init.prototype

avalon.type = function (obj) { //取得目标的类型
    if (obj == null) {
        return String(obj)
    }
    // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
    return typeof obj === "object" || typeof obj === "function" ?
            class2type[serialize.call(obj)] || "object" :
            typeof obj
}

var isFunction = function (fn) {
    return serialize.call(fn) === "[object Function]"
}

avalon.isFunction = isFunction

avalon.isWindow = function (obj) {
    return rwindow.test(serialize.call(obj))
}

/*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/

avalon.isPlainObject = function (obj) {
    // 简单的 typeof obj === "object"检测，会致使用isPlainObject(window)在opera下通不过
    return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto
}

//与jQuery.extend方法，可用于浅拷贝，深拷贝
avalon.mix = avalon.fn.mix = function () {
    var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false

    // 如果第一个参数为布尔,判定是否深拷贝
    if (typeof target === "boolean") {
        deep = target
        target = arguments[1] || {}
        i++
    }

    //确保接受方为一个复杂的数据类型
    if (typeof target !== "object" && !isFunction(target)) {
        target = {}
    }

    //如果只有一个参数，那么新成员添加于mix所在的对象上
    if (i === length) {
        target = this
        i--
    }

    for (; i < length; i++) {
        //只处理非空参数
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name]
                copy = options[name]
                // 防止环引用
                if (target === copy) {
                    continue
                }
                if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false
                        clone = src && Array.isArray(src) ? src : []

                    } else {
                        clone = src && avalon.isPlainObject(src) ? src : {}
                    }

                    target[name] = avalon.mix(deep, clone, copy)
                } else if (copy !== void 0) {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

function _number(a, len) { //用于模拟slice, splice的效果
    a = Math.floor(a) || 0
    return a < 0 ? Math.max(len + a, 0) : Math.min(a, len);
}
avalon.mix({
    rword: rword,
    subscribers: subscribers,
    version: 1.43,
    ui: {},
    log: log,
    slice: function (nodes, start, end) {
        return aslice.call(nodes, start, end)
    },
    noop: noop,
    /*如果不用Error对象封装一下，str在控制台下可能会乱码*/
    error: function (str, e) {
        throw new (e || Error)(str)// jshint ignore:line
    },
    /*将一个以空格或逗号隔开的字符串或数组,转换成一个键值都为1的对象*/
    oneObject: oneObject,
    /* avalon.range(10)
     => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     avalon.range(1, 11)
     => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     avalon.range(0, 30, 5)
     => [0, 5, 10, 15, 20, 25]
     avalon.range(0, -10, -1)
     => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     avalon.range(0)
     => []*/
    range: function (start, end, step) { // 用于生成整数数组
        step || (step = 1)
        if (end == null) {
            end = start || 0
            start = 0
        }
        var index = -1,
                length = Math.max(0, Math.ceil((end - start) / step)),
                result = new Array(length)
        while (++index < length) {
            result[index] = start
            start += step
        }
        return result
    },
    eventHooks: {},
    /*绑定事件*/
    bind: function (el, type, fn, phase) {
        console.warn("string-avalon不存在bind方法")
    },
    /*卸载事件*/
    unbind: function (el, type, fn, phase) {
        console.warn("string-avalon不存在unbind方法")
    },
    /*读写删除元素节点的样式*/
    css: function (node, name, value) {
        console.warn("string-avalon不存在css方法")
    },
    /*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
    each: function (obj, fn) {
        if (obj) { //排除null, undefined
            var i = 0
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    if (fn(i, obj[i]) === false)
                        break
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                        break
                    }
                }
            }
        }
    },
    //收集元素的data-{{prefix}}-*属性，并转换为对象
    getWidgetData: function (elem, prefix) {
        var raw = avalon(elem).data()
        var result = {}
        for (var i in raw) {
            if (i.indexOf(prefix) === 0) {
                result[i.replace(prefix, "").replace(/\w/, function (a) {
                    return a.toLowerCase()
                })] = raw[i]
            }
        }
        return result
    },
    Array: {
        /*只有当前数组不存在此元素时只添加它*/
        ensure: function (target, item) {
            if (target.indexOf(item) === -1) {
                return target.push(item)
            }
        },
        /*移除数组中指定位置的元素，返回布尔表示成功与否*/
        removeAt: function (target, index) {
            return !!target.splice(index, 1).length
        },
        /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
        remove: function (target, item) {
            var index = target.indexOf(item)
            if (~index)
                return avalon.Array.removeAt(target, index)
            return false
        }
    }
})

var bindingHandlers = avalon.bindingHandlers = {}
var bindingExecutors = avalon.bindingExecutors = {}

/*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
function isArrayLike(obj) {
    if (obj && typeof obj === "object") {
        var n = obj.length,
                str = serialize.call(obj)
        if (/(Array|List|Collection|Map|Arguments)\]$/.test(str)) {
            return true
        } else if (str === "[object Object]" && n === (n >>> 0)) {
            return true //由于ecma262v5能修改对象属性的enumerable，因此不能用propertyIsEnumerable来判定了
        }
    }
    return false
}
var nodeOne = oneObject("value,data,attrs,nodeName,tagName,parentNode,childNodes,quirksMode namespaceURI")
var DOM = {
    ids: {},
    nodeType: function (elem) {
        if (elem.nodeName === elem.tagName) {
            return 1
        }
        switch (elem.nodeName + "") {
            case "undefined":
                return 2
            case "#text":
                return 3
            case "#comment":
                return 8
            case "#document":
                return 9
            case "#document-type":
                return 10
            case "#document-fragment":
                return 11
        }
        return 2
    },
    
    /*
     * 使用正则表达寻找一个attribute的Name。返回第一个匹配成功的attrName或者undefined
     */
    lookupAttributeName: function (elem, attrNameRegex) {
        var attrs = elem.attrs || []
        for (var i = 0, attr; attr = attrs[i++]; ) {
            if (attrNameRegex.test(attr.name))
                return attr.name
        }
        return undefined;
    },
    getAttribute: function (elem, name) {
        var attrs = elem.attrs || []
        for (var i = 0, attr; attr = attrs[i++]; ) {
            if (attr.name === name)
                return attr.value
        }
    },
    hasAttribute: function (el, name) {
        var value = DOM.getAttribute(el, name)
        return typeof value === "string"
    },
    setAttribute: function (elem, key, value) {
        var attrs = elem.attrs || (elem.attrs = [])
        for (var i = 0, attr; attr = attrs[i++]; ) {
            if (attr.name === key) {
                attr.value = value
                return elem
            }
        }
        attrs.push({
            name: key,
            value: value
        })
        return elem
    },
    removeAttribute: function (elem, name) {
        var attrs = elem.attrs || []
        for (var i = attrs.length, attr; attr = attrs[--i]; ) {
            if (attr.name === name) {
                attrs.splice(i, 1)
                break
            }
        }
        return elem
    },
    setBoolAttribute: function (elem, name, value) {
        if (value) {
            DOM.setAttribute(elem, name, name)
        } else {
            DOM.removeAttribute(elem, name)
        }
    },
    setStyle: function (elem, key, value) {

        /**
         * 匹配带有 !important 的属性
         * @example
         * /(?=color\s*:)[^;]+!important\s*(;|$)/ 可以匹配出 'color: red !important;'
         */
        var regImportant = new RegExp('(?=' + key + '\\s*:)[^;]+!important\\s*(;|$)'),
                oldValue = DOM.getAttribute(elem, 'style') || ''

        if (!regImportant.test(oldValue)) {
            // 如果该属性木有 !important 结尾的值，替换之
            /**
             * 匹配带有 !important 的属性
             * @example
             * /(?=color\s*:)[^;]+!important\s*(;|$)/ 可以匹配出 'color: red !important;'
             */
            var regKey = new RegExp('(' + key + '\\s*:)[^;]*(;|$)', 'g'),
                    newValue = key + ': ' + value + ';' + oldValue.replace(regKey, '')

            DOM.setAttribute(elem, 'style', newValue)
        }
    },
    innerText: function (elem, text) {
        //如果它没有孩子,添加一个新文本节点,如果它第一个孩子是文本节点,那么直接在它上面改
        //如果是其他节点类型,替换为新文本节点,最后将孩子个数减至1
        var array = elem.childNodes
        var textNode = {
            nodeName: "#text",
            nodeType: 3,
            value: text,
            parentNode: elem
        }
        //如果没有节点,添加一个新文本节点
        if (!array.length) {
            array.push(textNode)
        } else {
            array.length = 1
            var firstChild = array[0]
            if (firstChild.nodeName === "#text") {
                firstChild.value = text
            } else {
                DOM.replaceChild(textNode, firstChild)
            }
        }
    },
    createElement: function (tagName) {
        return {
            nodeName: tagName,
            tagName: tagName,
            attrs: [],
            namespaceURI: 'http://www.w3.org/1999/xhtml',
            nodeType: 1,
            childNodes: []
        }
    },
    cloneNode: function (elem, deep) {
        var ret = {
            parentNode: null
        }
        if (deep) {
            for (var i in elem) {
                if (!nodeOne[i]) {
                    continue
                }
                if (i === "parentNode") {
                    ret[i] = elem[i]
                } else if (i === "childNodes") {
                    var newChildren = []
                    var children = elem.childNodes
                    for (var j = 0, el; el = children[j++]; ) {
                        var ele = DOM.cloneNode(el, true)
                        ele.parentNode = ret
                        newChildren.push(ele)
                    }
                    ret.childNodes = newChildren
                } else if (i === "attrs") {
                    ret[i] = elem.attrs.map(function (el) {
                        return {
                            name: el.name,
                            value: el.value
                        }
                    })
                } else {
                    ret[i] = elem[i]
                }
            }
        } else {
            for (var i in elem) {
                if (i === "childNodes") {
                    ret[i] = []
                } else {
                    ret[i] = elem[i]
                }
            }
        }
        return ret
    },
    outerHTML: function (elem) {
        var serializer = new parse5.Serializer()
        var clone = {}
        for (var i in elem) {
            clone[i] = elem[i]
        }
        var doc = {
            nodeName: "#document",
            quirksNode: false
        }
        clone.parentNode = doc
        doc.childNodes = [elem]
        return serializer.serialize(doc)
    },
    innerHTML: function (parent, html) {
        if (typeof html === "string") {
            var fragment = parser.parseFragment(html)
            var nodes = fragment.childNodes
            for (var i = 0, node; node = nodes[i++]; ) {
                node.nodeType = DOM.nodeType(node)
                node.parentNode = parent
            }
            parent.childNodes = nodes
        } else {
            var clone = {}
            for (var i in parent) {
                if (i === "attrs") {
                    clone[i] = []
                } else {
                    clone[i] = parent[i]
                }
            }
            html = DOM.outerHTML(clone)
            return html.replace(new RegExp("<" + clone.tagName + "\/?>"), "")
                    .replace("<\/" + clone.tagName + ">", "")
        }
    },
    appendChild: function (parent, html) {
        var nodes = [].concat(html)
        for (var i = 0, node; node = nodes[i++]; ) {
            node.parentNode = parent
            node.nodeType = DOM.nodeType(node)
            parent.childNodes.push(node)
        }
    },
    replaceChild: function (newNode, oldNode) {
        var parent = oldNode.parentNode
        var children = parent.childNodes
        var index = children.indexOf(oldNode)
        if (!~index)
            return
        if (Array.isArray(newNode)) {
            var args = [index, 1]
            for (var i = 0, el; el = newNode[i++]; ) {
                el.parentNode = parent
                args.push(el)
            }
            Array.prototype.splice.apply(children, args)
        } else {
            newNode.parentNode = parent
            Array.prototype.splice.apply(children, [index, 1, newNode])
        }
    },
    removeChild: function (elem) {
        var children = elem.parentNode.childNodes
        var index = children.indexOf(elem)
        if (~index)
            children.splice(index, 1)
        return elem
    },
    createComment: function (data) {
        return {
            parentNode: null,
            nodeType: 8,
            nodeName: "#comment",
            data: data
        }
    }
}
avalon.parseHTML = function (html) {
    return parser.parseFragment(html)
}
avalon.innerHTML = function (parent, html) {
    if (parent.tagName)
        DOM.innerHTML(parent, html)
}
avalon.clearHTML = function (parent) {
    parent.childNodes.length = 0
}
function forEachElements(dom, callback) {
    for (var i = 0, el; el = dom.childNodes[i++]; ) {
        if (el.tagName) {
            if (callback(el) === false) {
                break
            } else {
                forEachElements(el, callback)
            }
        }
    }
}
avalon.getElementById = function (dom, id) {
    var ret = null
    forEachElements(dom, function (el) {
        if (DOM.getAttribute(el, "id") === id) {
            ret = el
            return false
        }
    })
    return ret
}
avalon.getElementsTagName = function (dom, tagName) {
    var ret = []
    forEachElements(dom, function (el) {
        if (el.tagName === tagName) {
            ret.push(el)
        }
    })
    return ret
}
avalon.getElementsClassName = function (dom, className, tagName) {
    if (typeof tagName === "string") {
        dom = {
            childNodes: avalon.getElementsTagName(dom, tagName)
        }
    }
    var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
    var ret = []
    forEachElements(dom, function (el) {
        if (pattern.test(DOM.getAttribute(el, "class"))) {
            ret.push(el)
        }
    })
    return ret
}

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
        if (array.indexOf(cls) == -1) {
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
               this[0].attrs.forEach(function (attr) {
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
    if (array == undefined) array = [];
    for (var i = 0, el; el = children[i++]; ) {
        if (el.nodeName.toUpperCase() === "OPTGROUP") {
            collectOptions(el.childNodes, array)
        } else if (el.nodeName.toUpperCase() === "OPTION") {
            array.push(el)
        }
    }
    return array;
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
function bindForBrowser(data){
    var attrName = 'ms-scan-331',
        attrValue = ''

    // 提取 vmodels id
    var array = data.vmodels.map(function(el){
        return el.$id
    })

    var element = data.element

    if(DOM.nodeType(element) === 1){
        // 如果是 Element 节点
        
        // 提取 data 属性
        var props = 'name,param,priority,type,value',
            options = {}
        props.replace(rword,function(prop){
            options[prop] = data[prop]
        })
        
        // 检测是否存在 ms-scan-noderebind
        if (DOM.hasAttribute(element, attrName)) {
            // 如果已有
            var newOptStr = JSON.stringify(options).replace(/"/ig, "'")
            
            attrValue = DOM.getAttribute(element, attrName)
            attrValue = attrValue.replace('avalon.rebind([', 'avalon.rebind([' + newOptStr + ', ')

        } else {
            // 如果没有
            attrValue = 'avalon.rebind('+ [JSON.stringify([options]), JSON.stringify(array)] +')';
            // 将 Stringify 产生的双引号转换为单引号
            attrValue = attrValue.replace(/"/ig, "'");
        }

        DOM.setAttribute(element, attrName , attrValue)

    }else{
        // 如果是 Text 节点
        
        // 提取 data 属性
        var props = 'expr,filters,type,value',
            options = {}
        props.replace(rword,function(prop){
            options[prop] = data[prop]
        })

        var newElement = DOM.createElement('span')
            copy = DOM.cloneNode(element, true)

        newElement.childNodes.push(copy)

        // avalon.rebind
        attrValue = 'avalon.rebind('+ [JSON.stringify([options]), JSON.stringify(array)] +')';
        attrValue = attrValue.replace(/"/ig, "'");
        DOM.setAttribute(newElement, attrName , attrValue)

        DOM.replaceChild(newElement, element)
    }
}
/*********************************************************************
 *                           扫描系统                                 *
 **********************************************************************/
avalon.scan = function(elem, vmodel) {
    var vmodels = vmodel ? [].concat(vmodel) : []
    scanTag(elem, vmodels)
}
//http://www.w3.org/TR/html5/syntax.html#void-elements
var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea")

    function executeBindings(bindings, vmodels) {
        for (var i = 0, data; data = bindings[i++];) {
            data.vmodels = vmodels
            bindingHandlers[data.type](data, vmodels)
            if (data.evaluator && data.element && data.element.tagName) { //移除数据绑定，防止被二次解析
                //chrome使用removeAttributeNode移除不存在的特性节点时会报错 https://github.com/RubyLouvre/avalon/issues/99
                DOM.removeAttribute(data.element, data.name)
                // data.element.removeAttribute(data.name)
            }
        }
        bindings.length = 0
    }

var rmsAttr = /ms-(\w+)-?(.*)/
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

var events = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit")
var obsoleteAttrs = oneObject("value,title,alt,checked,selected,disabled,readonly,enabled")

    function bindingSorter(a, b) {
        return a.priority - b.priority
    }
    
var getBindingCallback = function(elem, name, vmodels) {
    var callback = DOM.getAttribute(elem,name)
    if (callback) {
        for (var i = 0, vm; vm = vmodels[i++]; ) {
            if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                return vm[callback]
            }
        }
    }
}

function scanTag(elem, vmodels) {
    if (elem.tagName) {
        elem.nodeType = 1
        if (DOM.getAttribute(elem, "ms-skip"))
            return
        if (!DOM.getAttribute(elem, "ms-skip-ctrl")) {
            var ctrl = DOM.getAttribute(elem, "ms-important")
            if (ctrl) {
                elem.attrs.push({
                    name: "ms-skip-ctrl",
                    value: "true"
                })
                var isImporant = true
            } else {
                ctrl = DOM.getAttribute(elem, "ms-controller")
                if (ctrl) {
                    elem.attrs.push({
                        name: "ms-skip-ctrl",
                        value: "true"
                    })
                }
            }
            if (ctrl) {
                var newVmodel = avalon.vmodels[ctrl]
                if (!newVmodel) {
                    return
                }
                vmodels = isImporant ? [newVmodel] : [newVmodel].concat(vmodels)
            }
        }
        scanAttr(elem, vmodels)
    } else if (elem.nodeName === "#document") { //如果是文档
        scanNodeArray(elem.childNodes, vmodels)
    } else if (elem.nodeName === "#document-fragment") { //如果是文档文型
        scanNodeArray(elem.childNodes, vmodels)
    }
}
function scanNodeArray(nodes, vmodels) {
    var len = nodes.length,
        i = 0;
    for (; i < len; i++) {
        scanNode(nodes[i], vmodels)
    }
}
var scriptTypes = oneObject(["", "text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript"])

function scanNode(node, vmodels) {
    switch (DOM.nodeType(node)) {
        case 3: //如果是文本节点
            node.nodeType = 3
            scanText(node, vmodels)
            break
        case 8: //如果是注释节点
            if (kernel.commentInterpolate) {
                node.nodeType = 8
                scanText(node, vmodels)
            }
            break
        case 1: //如果是元素节点
            node.nodeType = 1
            var id = DOM.getAttribute(node, "id")
            if (id) {
                switch (node.nodeName) {
                    case "script":
                        var type = DOM.getAttribute(node, "type")
                        if (type && !scriptTypes[type]) {
                            DOM.ids[id] = node.childNodes[0].value
                        }
                        break
                    case "textarea":
                    case "noscript":
                        DOM.ids[id] = node.childNodes[0].value
                        break
                }
            }
            scanTag(node, vmodels)
            if (node.msCallback) {
                node.msCallback()
            }
            break
    }
}
function scanAttr(elem, vmodels) {
    var attributes = elem.attrs || []
    var bindings = [],
            msData = {},
            match
    for (var i = attributes.length, attr; attr = attributes[--i]; ) {
        if (match = (attr.name || "").match(rmsAttr)) {
            //如果是以指定前缀命名的
            var type = match[1]
            var param = match[2] || ""
            var value = attr.value
            var name = attr.name
            msData[name] = value
            if (events[type]) {
                param = type
                type = "on"
            } else if (obsoleteAttrs[type]) {
                log("warning!请改用ms-attr-" + type + "代替ms-" + type + "！")
                if (type === "enabled") {//吃掉ms-enabled绑定,用ms-disabled代替
                    log("warning!ms-enabled或ms-attr-enabled已经被废弃")
                    type = "disabled"
                    value = "!(" + value + ")"
                }
                param = type
                type = "attr"
                name = "ms-attr-" + param
                attributes.splice(i, 1, {name: name, value: value})
                match = [name]
                msData[name] = value
            }
            if (typeof bindingHandlers[type] === "function") {
                var binding = {
                    type: type,
                    param: param,
                    element: elem,
                    name: match[0],
                    value: value,
                    priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
                }
                if (type === "html" || type === "text") {
                    var token = getToken(value)
                    avalon.mix(binding, token)
                    binding.filters = binding.filters.replace(rhasHtml, function () {
                        binding.type = "html"
                        binding.group = 1
                        return ""
                    })// jshint ignore:line
                }
                if (name === "ms-if-loop") {
                    binding.priority += 100
                }
                if (vmodels.length) {
                    bindings.push(binding)
                    if (type === "widget") {
                        elem.msData = elem.msData || msData
                    }
                }
            }
        }
    }

    bindings.sort(bindingSorter)
    var scanNode = true
    for (i = 0; binding = bindings[i]; i++) {
        type = binding.type
        if (rnoscanAttrBinding.test(type)) {
            return executeBindings(bindings.slice(0, i + 1), vmodels)
        } else if (scanNode) {
            scanNode = !rnoscanNodeBinding.test(type)
        }
    }
    executeBindings(bindings, vmodels)
    if (scanNode && !stopScan[elem.tagName]) {
        scanNodeArray(elem.childNodes, vmodels) //扫描子孙元素
    }
}
var rnoscanAttrBinding = /^if|widget|repeat$/
var rnoscanNodeBinding = /^each|with|html|include$/

var rhasHtml = /\|\s*html\s*/,
        r11a = /\|\|/g,
        rlt = /&lt;/g,
        rgt = /&gt;/g,
        rstringLiteral = /(['"])(\\\1|.)+?\1/g
function getToken(value) {
    if (value.indexOf("|") > 0) {
        var scapegoat = value.replace(rstringLiteral, function (_) {
            return Array(_.length + 1).join("1")// jshint ignore:line
        })
        var index = scapegoat.replace(r11a, "\u1122\u3344").indexOf("|") //干掉所有短路或
        if (index > -1) {
            return {
                filters: value.slice(index),
                value: value.slice(0, index),
                expr: true
            }
        }
    }
    return {
        value: value,
        filters: "",
        expr: true
    }
}

function scanExpr(str) {
    var tokens = [],
            value, start = 0,
            stop
    do {
        stop = str.indexOf(openTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { // {{ 左边的文本
            tokens.push({
                value: value,
                filters: "",
                expr: false
            })
        }
        start = stop + openTag.length
        stop = str.indexOf(closeTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { //处理{{ }}插值表达式
            tokens.push(getToken(value))
        }
        start = stop + closeTag.length
    } while (1)
    value = str.slice(start)
    if (value) { //}} 右边的文本
        tokens.push({
            value: value,
            expr: false,
            filters: ""
        })
    }
    return tokens
}

function scanText(textNode, vmodels) {
    var bindings = []
    if (textNode.nodeType === 8) {
        var token = getToken(textNode.data)//在parse5中注释节点的值用data来取
        var tokens = [token]
    } else {
        tokens = scanExpr(textNode.value)//在parse5中文本节点的值用value来取
       
    }
    if (tokens.length) {
        var fragment = []
        fragment.appendChild = function (node) {
            this.push(node)
        }
        for (var i = 0; token = tokens[i++]; ) {
            var node = {
                nodeName: "#text",
                value: token.value,
                nodeMark:"avalon文本节点",
                nodeType: 3
            } //将文本转换为文本节点，并替换原来的文本节点
            if (token.expr) {
                token.type = "text"
                token.element = node
                token.filters = token.filters.replace(rhasHtml, function () {
                    token.type = "html"
                    token.group = 1
                    return ""
                })// jshint ignore:line
                bindings.push(token) //收集带有插值表达式的文本
            }
            fragment.appendChild(node)
        }
        DOM.replaceChild(fragment, textNode)
        if (bindings.length)
            executeBindings(bindings, vmodels)
    }
}
/*********************************************************************
 *                          编译系统                                  *
 **********************************************************************/
var quote = JSON.stringify
var keywords = [
    "break,case,catch,continue,debugger,default,delete,do,else,false",
    "finally,for,function,if,in,instanceof,new,null,return,switch,this",
    "throw,true,try,typeof,var,void,while,with", /* 关键字*/
    "abstract,boolean,byte,char,class,const,double,enum,export,extends",
    "final,float,goto,implements,import,int,interface,long,native",
    "package,private,protected,public,short,static,super,synchronized",
    "throws,transient,volatile", /*保留字*/
    "arguments,let,yield,undefined" /* ECMA 5 - use strict*/].join(",")
var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
var rsplit = /[^\w$]+/g
var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
var rnumber = /\b\d[^,]*/g
var rcomma = /^,+|,+$/g
var cacheVars = new Cache(512)
var getVariables = function (code) {
    var key = "," + code.trim()
    var ret = cacheVars.get(key)
    if (ret) {
        return ret
    }
    var match = code
            .replace(rrexpstr, "")
            .replace(rsplit, ",")
            .replace(rkeywords, "")
            .replace(rnumber, "")
            .replace(rcomma, "")
            .split(/^$|,+/)
    return cacheVars.put(key, uniqSet(match))
}
/*添加赋值语句*/

function addAssign(vars, scope, name, data) {
    var ret = [],
            prefix = " = " + name + "."
    for (var i = vars.length, prop; prop = vars[--i]; ) {
        if (scope.hasOwnProperty(prop)) {
            ret.push(prop + prefix + prop)
            data.vars.push(prop)
            if (data.type === "duplex") {
                vars.get = name + "." + prop
            }
            vars.splice(i, 1)
        }
    }
    return ret
}

function uniqSet(array) {
    var ret = [],
            unique = {}
    for (var i = 0; i < array.length; i++) {
        var el = array[i]
        var id = el && typeof el.$id === "string" ? el.$id : el
        if (!unique[id]) {
            unique[id] = ret.push(el)
        }
    }
    return ret
}
//缓存求值函数，以便多次利用
var cacheExprs = new Cache(128)
//取得求值函数及其传参
var rduplex = /\w\[.*\]|\w\.\w/
var rproxy = /(\$proxy\$[a-z]+)\d+$/
var rthimRightParentheses = /\)\s*$/
var rthimOtherParentheses = /\)\s*\|/g
var rquoteFilterName = /\|\s*([$\w]+)/g
var rpatchBracket = /"\s*\["/g
var rthimLeftParentheses = /"\s*\(/g
function parseFilter(val, filters) {
    filters = filters
            .replace(rthimRightParentheses, "")//处理最后的小括号
            .replace(rthimOtherParentheses, function () {//处理其他小括号
                return "],|"
            })
            .replace(rquoteFilterName, function (a, b) { //处理|及它后面的过滤器的名字
                return "[" + quote(b)
            })
            .replace(rpatchBracket, function () {
                return '"],["'
            })
            .replace(rthimLeftParentheses, function () {
                return '",'
            }) + "]"
    return  "return avalon.filters.$filter(" + val + ", " + filters + ")"
}

function parseExpr(code, scopes, data) {
    var dataType = data.type
    var filters = data.filters || ""
    var exprId = scopes.map(function (el) {
        return String(el.$id).replace(rproxy, "$1")
    }) + code + dataType + filters
    var vars = getVariables(code).concat(),
            assigns = [],
            names = [],
            args = [],
            prefix = ""
    //args 是一个对象数组， names 是将要生成的求值函数的参数
    scopes = uniqSet(scopes)
    data.vars = []
    for (var i = 0, sn = scopes.length; i < sn; i++) {
        if (vars.length) {
            var name = "vm" + expose + "_" + i
            names.push(name)
            args.push(scopes[i])
            assigns.push.apply(assigns, addAssign(vars, scopes[i], name, data))
        }
    }
    if (!assigns.length && dataType === "duplex") {
        return
    }
    if (dataType !== "duplex" && (code.indexOf("||") > -1 || code.indexOf("&&") > -1)) {
        //https://github.com/RubyLouvre/avalon/issues/583
        data.vars.forEach(function (v) {
            var reg = new RegExp("\\b" + v + "(?:\\.\\w+|\\[\\w+\\])+", "ig")
            code = code.replace(reg, function (_) {
                var c = _.charAt(v.length)
                var r = IEVersion ? code.slice(arguments[1] + _.length) : RegExp.rightContext
                var method = /^\s*\(/.test(r)
                if (c === "." || c === "[" || method) {//比如v为aa,我们只匹配aa.bb,aa[cc],不匹配aaa.xxx
                    var name = "var" + String(Math.random()).replace(/^0\./, "")
                    if (method) {//array.size()
                        var array = _.split(".")
                        if (array.length > 2) {
                            var last = array.pop()
                            assigns.push(name + " = " + array.join("."))
                            return name + "." + last
                        } else {
                            return _
                        }
                    }
                    assigns.push(name + " = " + _)
                    return name
                } else {
                    return _
                }
            })
        })
    }
    //---------------args----------------
    data.args = args
    //---------------cache----------------
    var fn = cacheExprs.get(exprId) //直接从缓存，免得重复生成
    if (fn) {
        data.evaluator = fn
        return
    }
    prefix = assigns.join(", ")
    if (prefix) {
        prefix = "var " + prefix
    }
    if (/\S/.test(filters)) { //文本绑定，双工绑定才有过滤器
        if (!/text|html/.test(data.type)) {
            throw Error("ms-" + data.type + "不支持过滤器")
        }
        code = "\nvar ret" + expose + " = " + code + ";\r\n"
        code += parseFilter("ret" + expose, filters)
    } else if (dataType === "duplex") { //双工绑定
        var _body = "'use strict';\nreturn function(vvv){\n\t" +
                prefix +
                ";\n\tif(!arguments.length){\n\t\treturn " +
                code +
                "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) +
                "= vvv;\n} "
        try {
            fn = Function.apply(noop, names.concat(_body))
            data.evaluator = cacheExprs.put(exprId, fn)
        } catch (e) {
            log("debug: parse error," + e.message)
        }
        return
    } else if (dataType === "on") { //事件绑定
        if (code.indexOf("(") === -1) {
            code += ".call(this, $event)"
        } else {
            code = code.replace("(", ".call(this,")
        }
        names.push("$event")
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        var lastIndex = code.lastIndexOf("\nreturn")
        var header = code.slice(0, lastIndex)
        var footer = code.slice(lastIndex)
        code = header + "\n" + footer
    } else { //其他绑定
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
    }
    try {
        fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
        data.evaluator = cacheExprs.put(exprId, fn)
    } catch (e) {
        log("debug: parse error," + e.message)
    } finally {
        vars = assigns = names = null //释放内存
    }
}


//parseExpr的智能引用代理

function parseExprProxy(code, scopes, data, tokens, noregister) {
    if (Array.isArray(tokens)) {
        code = tokens.map(function (el) {
            return el.expr ? "(" + el.value + ")" : quote(el.value)
        }).join(" + ")
    }
    parseExpr(code, scopes, data)
    if (data.evaluator && !noregister) {
        data.handler = bindingExecutors[data.handlerName || data.type]
        //方便调试
        //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
        //将它移出订阅者列表
        registerSubscriber(data)
    }
}
avalon.parseExprProxy = parseExprProxy
/*********************************************************************
 *                            事件总线                               *
 **********************************************************************/
var EventBus = {
    $watch: function(type, callback) {
        if (typeof callback === "function") {
            var callbacks = this.$events[type]
            if (callbacks) {
                callbacks.push(callback)
            } else {
                this.$events[type] = [callback]
            }
        } else { //重新开始监听此VM的第一重简单属性的变动
            this.$events = this.$watch.backup
        }
        return this
    },
    $unwatch: function(type, callback) {
        var n = arguments.length
        if (n === 0) { //让此VM的所有$watch回调无效化
            this.$watch.backup = this.$events
            this.$events = {}
        } else if (n === 1) {
            this.$events[type] = []
        } else {
            var callbacks = this.$events[type] || []
            var i = callbacks.length
            while (~--i < 0) {
                if (callbacks[i] === callback) {
                    return callbacks.splice(i, 1)
                }
            }
        }
        return this
    },
    $fire: function(type) {
        var special, i, v, callback
        if (/^(\w+)!(\S+)$/.test(type)) {
            special = RegExp.$1
            type = RegExp.$2
        }
        var events = this.$events
        if (!events)
            return
        var args = aslice.call(arguments, 1)
        var detail = [type].concat(args)
        if (special === "all") {
            for (i in avalon.vmodels) {
                v = avalon.vmodels[i]
                if (v !== this) {
                    v.$fire.apply(v, detail)
                }
            }
        } else if (special === "up" || special === "down") {
            console.warin("不支持$fire(up!xxx)")
        } else {
            var callbacks = events[type] || []
            var all = events.$all || []
            for (i = 0; callback = callbacks[i++];) {
                if (isFunction(callback))
                    callback.apply(this, args)
            }
            for (i = 0; callback = all[i++];) {
                if (isFunction(callback))
                    callback.apply(this, arguments)
            }
        }
    }
}
/*********************************************************************
 *                           modelFactory                             *
 **********************************************************************/
//avalon最核心的方法的两个方法之一（另一个是avalon.scan），返回一个ViewModel(VM)
var VMODELS = avalon.vmodels = createMap() //所有vmodel都储存在这里
avalon.define = function (id, factory) {
    var $id = id.$id || id
    if (!$id) {
        log("warning: vm必须指定$id")
    }
    if (VMODELS[$id]) {
        log("warning: " + $id + " 已经存在于avalon.vmodels中")
    }
    if (typeof id === "object") {
        var model = modelFactory(id)
    } else {
        var scope = {
            $watch: noop
        }
        factory(scope) //得到所有定义
        model = modelFactory(scope) //偷天换日，将scope换为model
        stopRepeatAssign = true
        factory(model)
        stopRepeatAssign = false
    }
    model.$id = $id
    return VMODELS[$id] = model
}

//一些不需要被监听的属性
var $$skipArray = String("$id,$watch,$unwatch,$fire,$events,$model,$skipArray").match(rword)

function isObservable(name, value, $skipArray) {
    if (isFunction(value) || value && value.nodeType) {
        return false
    }
    if ($skipArray.indexOf(name) !== -1) {
        return false
    }
    if ($$skipArray.indexOf(name) !== -1) {
        return false
    }
    var $special = $skipArray.$special
    if (name && name.charAt(0) === "$" && !$special[name]) {
        return false
    }
    return true
}
//ms-with,ms-each, ms-repeat绑定生成的代理对象储存池
var midway = createMap()
function getNewValue(accessor, name, value, $vmodel) {
    switch (accessor.type) {
        case 0://计算属性
            var getter = accessor.get
            var setter = accessor.set
            if (isFunction(setter)) {
                var $events = $vmodel.$events
                var lock = $events[name]
                $events[name] = [] //清空回调，防止内部冒泡而触发多次$fire
                setter.call($vmodel, value)
                $events[name] = lock
            }
            return  getter.call($vmodel) //同步$model
        case 1://监控属性
            return value
        case 2://对象属性（包括数组与哈希）
            if (value !== $vmodel.$model[name]) {
                var svmodel = accessor.svmodel = objectFactory($vmodel, name, value, accessor.valueType)
                value = svmodel.$model //同步$model
                var fn = midway[svmodel.$id]
                fn && fn() //同步视图
            }
            return value
    }
}

function modelFactory(source, $special, $model) {
    if (Array.isArray(source)) {
        var arr = source.concat()
        source.length = 0
        var collection = Collection(source)// jshint ignore:line
        collection.pushArray(arr)
        return collection
    }
    //0 null undefined || Node || VModel
    if (!source || source.nodeType > 0 || (source.$id && source.$events)) {
        return source
    }
    if (!Array.isArray(source.$skipArray)) {
        source.$skipArray = []
    }
    source.$skipArray.$special = $special || createMap() //强制要监听的属性
    var $vmodel = {} //要返回的对象, 它在IE6-8下可能被偷龙转凤
    $model = $model || {} //vmodels.$model属性
    var $events = createMap() //vmodel.$events属性
    var watchedProperties = createMap() //监控属性
    var initCallbacks = [] //初始化才执行的函数
    for (var i in source) {
        (function (name, val) {
            $model[name] = val
            if (!isObservable(name, val, source.$skipArray)) {
                return //过滤所有非监控属性
            }
            //总共产生三种accessor
            $events[name] = []
            var valueType = avalon.type(val)
            var accessor = function (newValue) {
                var name = accessor._name
                var $vmodel = this
                var $model = $vmodel.$model
                var oldValue = $model[name]
                var $events = $vmodel.$events

                if (arguments.length) {
                    if (stopRepeatAssign) {
                        return
                    }
                    //计算属性与对象属性需要重新计算newValue
                    if (accessor.type !== 1) {
                        newValue = getNewValue(accessor, name, newValue, $vmodel)
                        if (!accessor.type)
                            return
                    }
                    if (!isEqual(oldValue, newValue)) {
                        $model[name] = newValue
                        notifySubscribers($events[name]) //同步视图
                        safeFire($vmodel, name, newValue, oldValue) //触发$watch回调
                    }
                } else {
                    if (accessor.type === 0) { //type 0 计算属性 1 监控属性 2 对象属性
                        //计算属性不需要收集视图刷新函数,都是由其他监控属性代劳
                        newValue = accessor.get.call($vmodel)
                        if (oldValue !== newValue) {
                            $model[name] = newValue
                            //这里不用同步视图
                            safeFire($vmodel, name, newValue, oldValue) //触发$watch回调
                        }
                        return newValue
                    } else {
                        collectSubscribers($events[name]) //收集视图函数
                        return accessor.svmodel || oldValue
                    }
                }
            }
            //总共产生三种accessor
            if (valueType === "object" && isFunction(val.get) && Object.keys(val).length <= 2) {
                //第1种为计算属性， 因变量，通过其他监控属性触发其改变
                accessor.set = val.set
                accessor.get = val.get
                accessor.type = 0
                initCallbacks.push(function () {
                    var data = {
                        evaluator: function () {
                            data.type = Math.random(),
                                    data.element = null
                            $model[name] = accessor.get.call($vmodel)
                        },
                        element: {nodeType: 1},
                        type: Math.random(),
                        handler: noop,
                        args: []
                    }
                    Registry[expose] = data
                    accessor.call($vmodel)
                    delete Registry[expose]
                })
            } else if (rcomplexType.test(valueType)) {
                //第2种为对象属性，产生子VM与监控数组
                accessor.type = 2
                accessor.valueType = valueType
                initCallbacks.push(function () {
                    var svmodel = modelFactory(val, 0, $model[name])
                    accessor.svmodel = svmodel
                    svmodel.$events[subscribers] = $events[name]
                })
            } else {
                accessor.type = 1
                //第3种为监控属性，对应简单的数据类型，自变量
            }
            accessor._name = name
            watchedProperties[name] = accessor
        })(i, source[i])// jshint ignore:line
    }

    $$skipArray.forEach(function (name) {
        delete source[name]
        delete $model[name] //这些特殊属性不应该在$model中出现
    })

    $vmodel = Object.defineProperties($vmodel, descriptorFactory(watchedProperties), source) //生成一个空的ViewModel
    for (var name in source) {
        if (!watchedProperties[name]) {
            $vmodel[name] = source[name]
        }
    }
    //添加$id, $model, $events, $watch, $unwatch, $fire
    $vmodel.$id = generateID()
    $vmodel.$model = $model
    $vmodel.$events = $events
    for (i in EventBus) {
        $vmodel[i] = EventBus[i]
    }

    Object.defineProperty($vmodel, "hasOwnProperty", {
        value: function (name) {
            return name in this.$model
        },
        writable: false,
        enumerable: false,
        configurable: true
    })

    initCallbacks.forEach(function (cb) { //收集依赖
        cb()
    })
    return $vmodel
}

//比较两个值是否相等
var isEqual = Object.is || function (v1, v2) {
    if (v1 === 0 && v2 === 0) {
        return 1 / v1 === 1 / v2
    } else if (v1 !== v1) {
        return v2 !== v2
    } else {
        return v1 === v2
    }
}

function safeFire(a, b, c, d) {
    if (a.$events) {
        EventBus.$fire.call(a, b, c, d)
    }
}

var descriptorFactory = function (obj) {
    var descriptors = createMap()
    for (var i in obj) {
        descriptors[i] = {
            get: obj[i],
            set: obj[i],
            enumerable: true,
            configurable: true
        }
    }
    return descriptors
}

//应用于第2种accessor
function objectFactory(parent, name, value, valueType) {
    //a为原来的VM， b为新数组或新对象
    var son = parent[name]
    if (valueType === "array") {
        if (!Array.isArray(value) || son === value) {
            return son //fix https://github.com/RubyLouvre/avalon/issues/261
        }
        son._.$unwatch()
        son.clear()
        son._.$watch()
        son.pushArray(value.concat())
        return son
    } else {
        var iterators = parent.$events[name]
        var pool = son.$events.$withProxyPool
        if (pool) {
            recycleProxies(pool, "with")
            son.$events.$withProxyPool = null
        }
        var ret = modelFactory(value)
        ret.$events[subscribers] = iterators
        midway[ret.$id] = function (data) {
            while (data = iterators.shift()) {
                (function (el) {
                    avalon.nextTick(function () {
                        var type = el.type
                        if (type && bindingHandlers[type]) { //#753
                            el.rollback && el.rollback() //还原 ms-with ms-on
                            bindingHandlers[type](el, el.vmodels)
                        }
                    })
                })(data)// jshint ignore:line
            }
            delete midway[ret.$id]
        }
        return ret
    }
}
/*********************************************************************
 *          监控数组（与ms-each, ms-repeat配合使用）                     *
 **********************************************************************/

function Collection(model) {
    var array = []
    array.$id = generateID()
    array.$model = model //数据模型
    array.$events = {}
    array.$events[subscribers] = []
    array._ = modelFactory({
        length: model.length
    })
    array._.$watch("length", function (a, b) {
        array.$fire("length", a, b)
    })
    for (var i in EventBus) {
        array[i] = EventBus[i]
    }
    avalon.mix(array, CollectionPrototype)
    return array
}

function mutateArray(method, pos, n, index, method2, pos2, n2) {
    var oldLen = this.length, loop = 2
    while (--loop) {
        switch (method) {
            case "add":
                /* jshint ignore:start */
                var array = this.$model.slice(pos, pos + n).map(function (el) {
                    if (rcomplexType.test(avalon.type(el))) {
                        return el.$id ? el : modelFactory(el, 0, el)
                    } else {
                        return el
                    }
                })
                /* jshint ignore:end */
                _splice.apply(this, [pos, 0].concat(array))
                this._fire("add", pos, n)
                break
            case "del":
                var ret = this._splice(pos, n)
                this._fire("del", pos, n)
                break
        }
        if (method2) {
            method = method2
            pos = pos2
            n = n2
            loop = 2
            method2 = 0
        }
    }
    this._fire("index", index)
    if (this.length !== oldLen) {
        this._.length = this.length
    }
    return ret
}

var _splice = ap.splice
var CollectionPrototype = {
    _splice: _splice,
    _fire: function (method, a, b) {
        notifySubscribers(this.$events[subscribers], method, a, b)
    },
    size: function () { //取得数组长度，这个函数可以同步视图，length不能
        return this._.length
    },
    pushArray: function (array) {
        var m = array.length, n = this.length
        if (m) {
            ap.push.apply(this.$model, array)
            mutateArray.call(this, "add", n, m, Math.max(0, n - 1))
        }
        return  m + n
    },
    push: function () {
        //http://jsperf.com/closure-with-arguments
        var array = []
        var i, n = arguments.length
        for (i = 0; i < n; i++) {
            array[i] = arguments[i]
        }
        return this.pushArray(array)
    },
    unshift: function () {
        var m = arguments.length, n = this.length
        if (m) {
            ap.unshift.apply(this.$model, arguments)
            mutateArray.call(this, "add", 0, m, 0)
        }
        return  m + n //IE67的unshift不会返回长度
    },
    shift: function () {
        if (this.length) {
            var el = this.$model.shift()
            mutateArray.call(this, "del", 0, 1, 0)
            return el //返回被移除的元素
        }
    },
    pop: function () {
        var n = this.length
        if (n) {
            var el = this.$model.pop()
            mutateArray.call(this, "del", n - 1, 1, Math.max(0, n - 2))
            return el //返回被移除的元素
        }
    },
    splice: function (start) {
        var m = arguments.length, args = [], change
        var removed = _splice.apply(this.$model, arguments)
        if (removed.length) { //如果用户删掉了元素
            args.push("del", start, removed.length, 0)
            change = true
        }
        if (m > 2) {  //如果用户添加了元素
            if (change) {
                args.splice(3, 1, 0, "add", start, m - 2)
            } else {
                args.push("add", start, m - 2, 0)
            }
            change = true
        }
        if (change) { //返回被移除的元素
            return mutateArray.apply(this, args)
        } else {
            return []
        }
    },
    contains: function (el) { //判定是否包含
        return this.indexOf(el) !== -1
    },
    remove: function (el) { //移除第一个等于给定值的元素
        return this.removeAt(this.indexOf(el))
    },
    removeAt: function (index) { //移除指定索引上的元素
        if (index >= 0) {
            this.$model.splice(index, 1)
            return mutateArray.call(this, "del", index, 1, 0)
        }
        return  []
    },
    clear: function () {
        this.$model.length = this.length = this._.length = 0 //清空数组
        this._fire("clear", 0)
        return this
    },
    removeAll: function (all) { //移除N个元素
        if (Array.isArray(all)) {
            all.forEach(function (el) {
                this.remove(el)
            }, this)
        } else if (typeof all === "function") {
            for (var i = this.length - 1; i >= 0; i--) {
                var el = this[i]
                if (all(el, i)) {
                    this.removeAt(i)
                }
            }
        } else {
            this.clear()
        }
    },
    ensure: function (el) {
        if (!this.contains(el)) { //只有不存在才push
            this.push(el)
        }
        return this
    },
    set: function (index, val) {
        if (index >= 0) {
            var valueType = avalon.type(val)
            if (val && val.$model) {
                val = val.$model
            }
            var target = this[index]
            if (valueType === "object") {
                for (var i in val) {
                    if (target.hasOwnProperty(i)) {
                        target[i] = val[i]
                    }
                }
            } else if (valueType === "array") {
                target.clear().push.apply(target, val)
            } else if (target !== val) {
                this[index] = val
                this.$model[index] = val
                this._fire("set", index, val)
            }
        }
        return this
    }
}

function sortByIndex(array, indexes) {
    var map = {};
    for (var i = 0, n = indexes.length; i < n; i++) {
        map[i] = array[i] // preserve
        var j = indexes[i]
        if (j in map) {
            array[i] = map[j]
            delete map[j]
        } else {
            array[i] = array[j]
        }
    }
}

"sort,reverse".replace(rword, function (method) {
    CollectionPrototype[method] = function () {
        var newArray = this.$model//这是要排序的新数组
        var oldArray = newArray.concat() //保持原来状态的旧数组
        var mask = Math.random()
        var indexes = []
        var hasSort
        ap[method].apply(newArray, arguments) //排序
        for (var i = 0, n = oldArray.length; i < n; i++) {
            var neo = newArray[i]
            var old = oldArray[i]
            if (isEqual(neo, old)) {
                indexes.push(i)
            } else {
                var index = oldArray.indexOf(neo)
                indexes.push(index)//得到新数组的每个元素在旧数组对应的位置
                oldArray[index] = mask    //屏蔽已经找过的元素
                hasSort = true
            }
        }
        if (hasSort) {
            sortByIndex(this, indexes)
            this._fire("move", indexes)
            this._fire("index", 0)
        }
        return this
    }
})

/*********************************************************************
 *                           依赖调度系统                             *
 **********************************************************************/
var ronduplex = /^(duplex|on)$/

function registerSubscriber(data) {
    Registry[expose] = data //暴光此函数,方便collectSubscribers收集
    avalon.openComputedCollect = true
    var fn = data.evaluator
    if (fn) { //如果是求值函数
        try {
            var c = ronduplex.test(data.type) ? data : fn.apply(0, data.args)
            data.handler(c, data.element, data)
        } catch (e) {
           //log("warning:exception throwed in [registerSubscriber] " + e)
            delete data.evaluator
            var node = data.element
            if (node.nodeType === 3) {
                var parent = node.parentNode
                if (kernel.commentInterpolate) {
                    DOM.replaceChild({
                        nodeName: "#comment",
                        data: data.value,
                        parentNode:parent
                    }, node)
                } else {
                    node.value = openTag + data.value + closeTag
                }
            }
        }
    }
    avalon.openComputedCollect = false
    delete Registry[expose]
}

function collectSubscribers(list) { //收集依赖于这个访问器的订阅者
    var data = Registry[expose]
    if (list && data && avalon.Array.ensure(list, data) && data.element) { //只有数组不存在此元素才push进去
     //   addSubscribers(data, list)
    }
}


function addSubscribers(data, list) {
    data.$uuid = data.$uuid || generateID()
    list.$uuid = list.$uuid || generateID()
    var obj = {
        data: data,
        list: list,
        $$uuid:  data.$uuid + list.$uuid
    }
    if (!$$subscribers[obj.$$uuid]) {
        $$subscribers[obj.$$uuid] = 1
        $$subscribers.push(obj)
    }
}
var $$subscribers =[]
function disposeData(data) {
    data.element = null
    data.rollback && data.rollback()
    for (var key in data) {
        data[key] = null
    }
}

function removeSubscribers() {

}

function notifySubscribers(list) { //通知依赖于这个访问器的订阅者更新自身
    if (list && list.length) {
      
        var args = aslice.call(arguments, 1)
        for (var i = list.length, fn; fn = list[--i]; ) {
            var el = fn.element
            if (el && el.parentNode) {
                if (fn.$repeat) {
                    fn.handler.apply(fn, args) //处理监控数组的方法
                } else if (fn.type !== "on") { //事件绑定只能由用户触发,不能由程序触发
                    var fun = fn.evaluator || noop
                    fn.handler(fun.apply(0, fn.args || []), el, fn)
                }
            }
        }
    }
}

bindingHandlers.text = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors.text = function (val, elem, data) {
    val = val == null ? "" : val //不在页面上显示undefined null
    if (elem.nodeName === "#text") { //绑定在文本节点上
        elem.value = String(val)
    } else { //绑定在特性节点上
        DOM.innerText(elem, val)
    }
    bindForBrowser(data)
}
bindingHandlers.html = function(data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}
bindingExecutors.html = function(val, elem, data) {
    val = val == null ? "" : val
    var isHtmlFilter = "group" in data
    var parent = isHtmlFilter ? elem.parentNode : elem
    if (!parent)
        return
    if (typeof val === "string") {
        var nodes = avalon.parseHTML(val).childNodes
    } else if (val) {
        if (DOM.nodeType(val) === 11) { //将val转换为文档碎片
            nodes = val.childNodes
        } else if (DOM.nodeType(val) === 1) {
            nodes = val.childNodes
        } else {
            nodes = []
        }
    }

    if (!nodes.length) {
        nodes.push(DOM.createComment("ms-html"))
    }
    var args = nodes.map(function(node) {
        node.parentNode = parent
        return node
    })
    var children = parent.childNodes
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    if (isHtmlFilter) {
        data.group = nodes.length
        data.element = nodes[0]

        var index = children.indexOf(elem)
        args.unshift(index, data.group)
        Array.prototype.splice.apply(children, args)
    } else {
        args.unshift(index, children.length)
        Array.prototype.splice.apply(children, args)
    }
    scanNodeArray(nodes, data.vmodels)
}
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
            var replaced = data.display === "none" ? "" : ["display:", data.display, ";"].join("")
            DOM.setAttribute(elem, "style", style.replace(rdisplay, replaced))
        }
    } else {  //如果要隐藏
        var cssText = !style ? "display:none;" : style.replace(rdisplay, "display:none;")
        DOM.setAttribute(elem, "style", cssText)
    }
}
bindingHandlers["data"] = bindingHandlers["if"] = function (data, vmodels) {
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors["if"] = function (val, elem, data) {
    if (val) { //插回DOM树
        if (elem.nodeName === "#comment") {
            var node = parser.parseFragment(elem.data).childNodes[0]
            var parent = elem.parentNode
            node.nodeType = 1
            node.parentNode = parent
            var children = elem.childNodes
            var index = children.indexOf(elem)
            children.splice(index, 1, node)
            elem = data.element = node
        }
        if (DOM.getAttribute(elem, data.name)) {
            DOM.removeAttribute(elem, data.name)
            scanAttr(elem, data.vmodels)
        }
    } else { //移出DOM树，并用注释节点占据原位置
        if (elem.tagName) {
            var parent = elem.parentNode
            var children = parent.childNodes
            var node = DOM.createComment(DOM.outerHTML(elem))
            node.nodeType = 8
            node.parentNode = parent
            var index = children.indexOf(elem)
            children.splice(index, 1, node)
            data.element = node
        }
    }
}

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
    bindForBrowser(data)
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
            var parent = data.startInclude.parentNode
            var children = parent.childNodes
            var startIndex = children.indexOf(data.startInclude)+ 1
            var endIndex = children.indexOf(data.endInclude)
            children.splice(startIndex , endIndex - startIndex)
            var nodes = avalon.parseHTML(text).childNodes
            nodes.forEach(function (el) {
                el.parentNode = parent
            })
            var args = [startIndex, 0].concat(nodes)
            Array.prototype.splice.apply(children, args)
            scanNodeArray(nodes, vmodels)
        }
        var path = require("path")
        if (data.param === "src") {
            if (typeof cacheTmpls[val] === "string") {
                scanTemplate(cacheTmpls[val])
            } else {
                var filePath = path.resolve(process.cwd(), val)
                var text = require("fs").readFileSync(filePath, "utf8")
                scanTemplate(cacheTmpls[val] = text)
            }
        } else {
            //现在只在scanNode中收集拥有id的script, textarea, noscript标签的innerText
            scanTemplate(DOM.ids[val])
        }
    } else if (method === "css" ){
        bindingExecutors.css(val, elem, data)
    } else {
        DOM.setAttribute(elem, method, val) //ms-href, ms-src
    }
}

//这几个指令都可以使用插值表达式，如ms-src="aaa/{{b}}/{{c}}.html"ms-src
"title,alt,src,value,include,href".replace(rword, function (name) {
    bindingHandlers[name] = bindingHandlers.attr
})
// bindingHandlers.data 定义在if.js
bindingExecutors.data = function(val, elem, data) {
    bindForBrowser(data)
    var key = "data-" + data.param
    if (val && typeof val === "object") {
        console.warn("ms-data对应的值必须是简单数据类型")
    } else {
        DOM.setAttribute(elem, key, String(val))
    }
}

//双工绑定
var duplexBinding = bindingHandlers.duplex = function (data, vmodels) {
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

//根据VM的属性值或表达式的值切换类名，ms-class="xxx yyy zzz:flag" 
//http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
bindingHandlers["class"] = function (data, vmodels) {
    bindForBrowser(data);
    var oldStyle = data.param,
            text = data.value,
            rightExpr
    data.handlerName = "class"
    if (!oldStyle || isFinite(oldStyle)) {
        data.param = "" //去掉数字
        var noExpr = text.replace(rexprg, function (a) {
            return a.replace(/./g, "0")
            //return Math.pow(10, a.length - 1) //将插值表达式插入10的N-1次方来占位
        })
        var colonIndex = noExpr.indexOf(":") //取得第一个冒号的位置
        if (colonIndex === -1) { // 比如 ms-class="aaa bbb ccc" 的情况
            var className = text
        } else { // 比如 ms-class-1="ui-state-active:checked" 的情况 
            className = text.slice(0, colonIndex)
            rightExpr = text.slice(colonIndex + 1)
            parseExpr(rightExpr, vmodels, data) //决定是添加还是删除
            if (!data.evaluator) {
                log("debug: ms-class '" + (rightExpr || "").trim() + "' 不存在于VM中")
                return false
            } else {
                data._evaluator = data.evaluator
                data._args = data.args
            }
        }
        var hasExpr = rexpr.test(className) //比如ms-class="width{{w}}"的情况
        if (!hasExpr) {
            data.immobileClass = className
        }
        parseExprProxy("", vmodels, data, (hasExpr ? scanExpr(className) : 0))
    } else {
        data.immobileClass = data.oldStyle = data.param
        parseExprProxy(text, vmodels, data)
    }
}

bindingExecutors["class"] = function (val, elem, data) {
    var $elem = avalon(elem),
            method = data.type
    if (method === "class" && data.oldStyle) { //如果是旧风格
        $elem.toggleClass(data.oldStyle, !!val)
    } else {
        //如果存在冒号就有求值函数
        data.toggleClass = data._evaluator ? !!data._evaluator.apply(elem, data._args) : true
        data.newClass = data.immobileClass || val
        if (data.oldClass && data.newClass !== data.oldClass) {
            $elem.removeClass(data.oldClass)
        }
        data.oldClass = data.newClass
        $elem.toggleClass(data.newClass, data.toggleClass)
    }
}

bindingHandlers.css = bindingHandlers.attr 


bindingExecutors.css = function (val, elem, data) {
    var key = data.param

    DOM.setStyle(elem, key, val)

    if (key === 'opacity') {
        DOM.setStyle(elem, 'filter', 'alpha(opacity=' + val * 100 + ')\\9')
    }
}

bindingHandlers.repeat = function (data, vmodels) {
    var type = data.type
    parseExprProxy(data.value, vmodels, data, 0, 1)
    data.proxies = []
    var freturn = false
    try {
        var $repeat = data.$repeat = data.evaluator.apply(0, data.args || [])
        var xtype = avalon.type($repeat)
        if (xtype !== "object" && xtype !== "array") {
            freturn = true
            avalon.log("warning:" + data.value + "只能是对象或数组")
        }
    } catch (e) {
        freturn = true
    }

    var arr = data.value.split(".") || []
    if (arr.length > 1) {
        arr.pop()
        var n = arr[0]
        for (var i = 0, v; v = vmodels[i++]; ) {
            if (v && v.hasOwnProperty(n)) {
                var events = v[n].$events || {}
                events[subscribers] = events[subscribers] || []
                events[subscribers].push(data)
                break
            }
        }
    }
    var elem = data.element
    DOM.removeAttribute(elem, data.name)

    data.sortedCallback = getBindingCallback(elem, "data-with-sorted", vmodels)
    data.renderedCallback = getBindingCallback(elem, "data-" + type + "-rendered", vmodels)
    var signature = generateID(type)
    var comment = data.element = DOM.createComment(signature + ":end")
    data.clone = DOM.createComment(signature)
    //   hyperspace.appendChild(comment)
    if (type === "each" || type === "with") {
        data.template = DOM.innerHTML(elem).trim()
        var children = elem.childNodes
        comment.parentNode = elem
        children.splice(0, children.length, comment)
    } else {
        data.template = DOM.outerHTML(elem).trim()
        DOM.replaceChild(comment, elem)
    }
    data._template = data.template
    data.template = avalon.parseHTML(data.template)

    data.rollback = function () {
        var elem = data.element
        if (!elem)
            return
        bindingExecutors.repeat.call(data, "clear")
        var parentNode = elem.parentNode
        var content = data.template
        var target = content.firstChild
        parentNode.replaceChild(content, elem)
        var start = data.$stamp
        start && start.parentNode && start.parentNode.removeChild(start)
        target = data.element = data.type === "repeat" ? target : parentNode
    }
    if (freturn) {
        return
    }
    data.handler = bindingExecutors.repeat
    data.$outer = {}
    var check0 = "$key"
    var check1 = "$val"
    if (Array.isArray($repeat)) {
        check0 = "$first"
        check1 = "$last"
    }
    for (i = 0; v = vmodels[i++]; ) {
        if (v.hasOwnProperty(check0) && v.hasOwnProperty(check1)) {
            data.$outer = v
            break
        }
    }
    var $events = $repeat.$events
    var $list = ($events || {})[subscribers]
    if ($list && avalon.Array.ensure($list, data)) {
        addSubscribers(data, $list)
    }
    if (xtype === "object") {
        data.$with = true
        var pool = !$events ? {} : $events.$withProxyPool || ($events.$withProxyPool = {})
        data.handler("append", $repeat, pool)
    } else if ($repeat.length) {
        data.handler("add", 0, $repeat.length)
    }
}
avalon.test2 = false
avalon.testData
bindingExecutors.repeat = function (method, pos, el) {
    if (method) {
        var data = this
        var end = data.element
        var parent = end.parentNode
        var proxies = data.proxies
        var transation = []
        //string-avalon特有
        transation.appendChild = function (el) {
            Array.prototype.push.apply(transation, el.childNodes)
        }
        switch (method) {
            case "add": //在pos位置后添加el数组（pos为数字，el为数组）
                var n = pos + el
                var array = data.$repeat
                var last = array.length - 1
                var fragments = [],
                        fragment
                var start = locateNode(data, pos)
                for (var i = pos; i < n; i++) {
                    var proxy = eachProxyAgent(i, data)
                    proxies.splice(i, 0, proxy)
                    shimController(data, transation, proxy, fragments)
                }
                DOM.replaceChild(transation.concat(start), start)
                for (i = 0; fragment = fragments[i++]; ) {
                    scanNodeArray(fragment.nodes, fragment.vmodels)
                    fragment.nodes = fragment.vmodels = null
                }
                break
            case "del": //将pos后的el个元素删掉(pos, el都是数字)
                start = proxies[pos].$stamp
                end = locateNode(data, pos + el)
                sweepNodes(start, end)
                var removed = proxies.splice(pos, el)
                recycleProxies(removed, "each")
                break
            case "clear":
                var check = data.$stamp || proxies[0]
                if (check) {
                    start = check.$stamp || check
                    sweepNodes(start, end)
                }
                recycleProxies(proxies, "each")
                break
            case "move":
                start = proxies[0].$stamp
                var signature = start.nodeValue
                var rooms = []
                var room = [],
                        node
                sweepNodes(start, end, function () {
                    room.unshift(this)
                    if (this.nodeValue === signature) {
                        rooms.unshift(room)
                        room = []
                    }
                })
                sortByIndex(proxies, pos)
                sortByIndex(rooms, pos)
                while (room = rooms.shift()) {
                    while (node = room.shift()) {
                        transation.appendChild(node)
                    }
                }
                DOM.replaceChild(transation.concat(end), end)
                break
            case "index": //将proxies中的第pos个起的所有元素重新索引
                last = proxies.length - 1
                for (; el = proxies[pos]; pos++) {
                    el.$index = pos
                    el.$first = pos === 0
                    el.$last = pos === last
                }
                return
            case "set": //将proxies中的第pos个元素的VM设置为el（pos为数字，el任意）
                proxy = proxies[pos]
                if (proxy) {
                    notifySubscribers(proxy.$events[data.param || "el"])
                }
                return
            case "append": //将pos的键值对从el中取出（pos为一个普通对象，el为预先生成好的代理VM对象池）
                var pool = el
                var keys = []
                fragments = []
                for (var key in pos) { //得到所有键名
                    if (pos.hasOwnProperty(key) && key !== "hasOwnProperty") {
                        keys.push(key)
                    }
                }
                if (data.sortedCallback) { //如果有回调，则让它们排序
                    var keys2 = data.sortedCallback.call(parent, keys)
                    if (keys2 && Array.isArray(keys2) && keys2.length) {
                        keys = keys2
                    }
                }
                for (i = 0; key = keys[i++]; ) {
                    if (key !== "hasOwnProperty") {
                        if (!pool[key]) {
                            pool[key] = withProxyAgent(key, data)
                        }
                        shimController(data, transation, pool[key], fragments)
                    }
                }

                var comment = data.$stamp = data.clone
                DOM.replaceChild([comment].concat(transation, end), end)
                for (i = 0; fragment = fragments[i++]; ) {
                    scanNodeArray(fragment.nodes, fragment.vmodels)
                    fragment.nodes = fragment.vmodels = null
                }
                break
        }
        if (method === "clear")
            method = "del"
        var callback = data.renderedCallback || noop,
                args = arguments
        var fn = parent.msCallback
        if (fn) {
            parent.msCallback = function () {
                fn()
                callback.apply(parent, args)
                if (parent.oldValue && parent.tagName === "SELECT") { //fix #503
                    avalon(parent).val(parent.oldValue.split(","))
                }
            }
        } else {
            parent.msCallback = function () {
                callback.apply(parent, args)
                if (parent.oldValue && parent.tagName === "SELECT") { //fix #503
                    avalon(parent).val(parent.oldValue.split(","))
                }
            }
        }
//        checkScan(parent, function () {
//            callback.apply(parent, args)
//            if (parent.oldValue && parent.tagName === "SELECT") { //fix #503
//                avalon(parent).val(parent.oldValue.split(","))
//            }
//        }, NaN)
    }
}

"with,each".replace(rword, function (name) {
    bindingHandlers[name] = bindingHandlers.repeat
})

function shimController(data, transation, proxy, fragments) {
    var content = DOM.cloneNode(data.template, true)
    var nodes = avalon.slice(content.childNodes)
    if (proxy.$stamp) {
        content.childNodes.unshift(proxy.$stamp)
        proxy.$stamp.parentNode = content
    }
    transation.appendChild(content)
    var nv = [proxy].concat(data.vmodels)
    var fragment = {
        nodes: nodes,
        vmodels: nv
    }
    fragments.push(fragment)
}

function locateNode(data, pos) {
    var proxy = data.proxies[pos]
    return proxy ? proxy.$stamp : data.element
}

function sweepNodes(start, end, callback) {
    var parent = start.parentNode
    var children = parent.childNodes
    var startIndex = children.indexOf(start)
    var endIndex = children.indexOf(end)
    var array = children.splice(startIndex, endIndex - startIndex)
    if (array.length && callback) {
        array.forEach(function (node) {
            callback.call(node)
        })
    }
}

// 为ms-each,ms-with, ms-repeat会创建一个代理VM，
// 通过它们保持一个下上文，让用户能调用$index,$first,$last,$remove,$key,$val,$outer等属性与方法
// 所有代理VM的产生,消费,收集,存放通过xxxProxyFactory,xxxProxyAgent, recycleProxies,xxxProxyPool实现
var eachProxyPool = []
var withProxyPool = []

function eachProxyFactory(name) {
    var source = {
        $host: [],
        $outer: {},
        $stamp: 1,
        $index: 0,
        $first: false,
        $last: false,
        $remove: avalon.noop
    }
    source[name] = {
        get: function () {
            var e = this.$events
            var array = e.$index
            e.$index = e[name] //#817 通过$index为el收集依赖
            try {
                return this.$host[this.$index]
            } finally {
                e.$index = array
            }
        },
        set: function (val) {
            this.$host.set(this.$index, val)
        }
    }
    var second = {
        $last: 1,
        $first: 1,
        $index: 1
    }
    var proxy = modelFactory(source, second)
    proxy.$id = generateID("$proxy$each")
    return proxy
}

function eachProxyAgent(index, data) {
    var param = data.param || "el",
            proxy
    for (var i = 0, n = eachProxyPool.length; i < n; i++) {
        var candidate = eachProxyPool[i]
        if (candidate && candidate.hasOwnProperty(param)) {
            proxy = candidate
            eachProxyPool.splice(i, 1)
        }
    }
    if (!proxy) {
        proxy = eachProxyFactory(param)
    }
    var host = data.$repeat
    var last = host.length - 1
    proxy.$index = index
    proxy.$first = index === 0
    proxy.$last = index === last
    proxy.$host = host
    proxy.$outer = data.$outer
    proxy.$stamp = DOM.createComment(data.clone.data) //data.clone.cloneNode(false)
    proxy.$remove = function () {
        return host.removeAt(proxy.$index)
    }
    return proxy
}

function withProxyFactory() {
    var proxy = modelFactory({
        $key: "",
        $outer: {},
        $host: {},
        $val: {
            get: function () {
                return this.$host[this.$key]
            },
            set: function (val) {
                this.$host[this.$key] = val
            }
        }
    }, {
        $val: 1
    })
    proxy.$id = generateID("$proxy$with")
    return proxy
}

function withProxyAgent(key, data) {
    var proxy = withProxyPool.pop()
    if (!proxy) {
        proxy = withProxyFactory()
    }
    var host = data.$repeat
    proxy.$key = key
    proxy.$host = host
    proxy.$outer = data.$outer
    if (host.$events) {
        proxy.$events.$val = host.$events[key]
    } else {
        proxy.$events = {}
    }
    return proxy
}

function recycleProxies(proxies, type) {
    var proxyPool = type === "each" ? eachProxyPool : withProxyPool
    avalon.each(proxies, function (key, proxy) {
        if (proxy.$events) {
            for (var i in proxy.$events) {
                if (Array.isArray(proxy.$events[i])) {
                    proxy.$events[i].forEach(function (data) {
                        if (typeof data === "object")
                            disposeData(data)
                    }) // jshint ignore:line
                    proxy.$events[i].length = 0
                }
            }
            proxy.$host = proxy.$outer = {}
            if (proxyPool.unshift(proxy) > kernel.maxRepeatSize) {
                proxyPool.pop()
            }
        }
    })
    if (type === "each")
        proxies.length = 0
}
})()
