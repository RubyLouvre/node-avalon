function bindForBrowser(data) {
    var attrName = 'ms-scan-331',
            attrValue = ''

    // 提取 vmodels id
    var array = data.vmodels.map(function (el) {
        return el.$id
    })

    var element = data.element

    if (DOM.nodeType(element) === 1) {
        // 如果是 Element 节点

        // 提取 data 属性
        var props = 'name,param,priority,type,value',
                options = {}
        props.replace(rword, function (prop) {
            options[prop] = data[prop]
        })
        if (data.type === "include") {
            options.template = data.template
        }
        if (data.type === "visible" ) {
            options.isShow = data.isShow
            options.inlineDisplay = data.inlineDisplay
        }
        // 检测是否存在 ms-scan-noderebind
        if (DOM.hasAttribute(element, attrName)) {
            // 如果已有
            var newOptStr = JSON.stringify(options).replace(/"/ig, "'")

            attrValue = DOM.getAttribute(element, attrName)
            attrValue = attrValue.replace('avalon.rebind([', 'avalon.rebind([' + newOptStr + ', ')

        } else {
            // 如果没有
            attrValue = 'avalon.rebind(' + [JSON.stringify([options]), JSON.stringify(array)] + ')';
            // 将 Stringify 产生的双引号转换为单引号
            attrValue = attrValue.replace(/"/ig, "'");
        }

        DOM.setAttribute(element, attrName, attrValue)

    } else {
        // 如果是 Text 节点

        // 提取 data 属性
        var props = 'expr,filters,type,value',
                options = {}
        props.replace(rword, function (prop) {
            options[prop] = data[prop]
        })

        var newElement = DOM.createElement('span')
        copy = DOM.cloneNode(element, true)

        newElement.childNodes.push(copy)

        // avalon.rebind
        attrValue = 'avalon.rebind(' + [JSON.stringify([options]), JSON.stringify(array)] + ')';
        attrValue = attrValue.replace(/"/ig, "'");
        DOM.setAttribute(newElement, attrName, attrValue)

        DOM.replaceChild(newElement, element)
    }
}