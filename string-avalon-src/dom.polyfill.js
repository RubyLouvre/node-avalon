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
