var DOM = {
    getAttribute: function (elem, name) {
        var attrs = elem.attrs || []
        for (var i = 0, attr; attr = attrs[i++]; ) {
            if (attr.name === name)
                return attr.value
        }
    },
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
    hasAttribute: function (el, name) {
        var value = DOM.getAttribute(el, name)
        return typeof value === "string"
    },
    setAttribute: function (elem, key, value) {
        var attrs = elem.attrs || (elem.attrs = [])
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i]
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
    removeAttribute: function (elem, key) {
        var attrs = elem.attrs || []
        for (var i = attrs.length, attr; attr = attrs[--i]; ) {
            if (attr.name === key) {
                attrs.splice(i, 1)
                break
            }
        }
        return elem
    },
    innerText: function (elem, text) {
        elem.childNodes = [
            {
                nodeName: "#text",
                nodeType: 3,
                value: text,
                parentNode: elem
            }
        ]
    },
    innerHTML: function (parent, html) {
        var fragment = parser.parseFragment(html)
        var nodes = fragment.childNodes
        for (var i = 0, node; node = nodes[i++]; ) {
            node.nodeType = DOM.nodeType(node)
            node.parentNode = parent
        }
        parent.childNodes = nodes
    },
    appendChild: function(parent, html){
        var nodes = [].concat(html)
        for (var i = 0, node; node = nodes[i++]; ) {
            node.parentNode = parent
            node.nodeType = DOM.nodeType(node)
            parent.childNodes.push(node)
        }
    },
    replaceChild: function (newNode, oldNode) {
        var parent = oldNode.parentNode
        var childNodes = parent.childNodes
        var index = childNodes.indexOf(oldNode)
        if (!~index)
            return
        if (Array.isArray(newNode)) {
            var args = [index, 1]
            for (var i = 0, el; el = newNode[i++]; ) {
                el.parentNode = parent
                args.push(el)
            }
            Array.prototype.splice.apply(childNodes, args)
        } else {
            newNode.parentNode = parent
            Array.prototype.splice.apply(childNodes, [index, 1, newNode])
        }
    },
    removeChild: function (elem) {
        var children = elem.parentNode.childNodes
        var index = children.indexOf(elem)
        if (~index)
            children.splice(index, 1)
        return elem
    },
    createComment: function(data){
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