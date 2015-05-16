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

        switch (data.type) {
            case "include":
                options.template = data.template

//                if (data.includeReplace) {
//                    options.includeReplace = true
//                  //  var newElement = DOM.createElement('script')
//                 //   DOM.replaceChild([element, newElement], element)
//                //    newElement = element
//                }
                break
            case "visible":
                options.isShow = data.isShow
                options.inlineDisplay = data.inlineDisplay
                break
            case "if":
                options.isInDom = data.isInDom
                break

        }
        if (DOM.hasAttribute(element, attrName)) {
            // 检测是否存在 ms-scan-noderebind
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

    } else {//如果是文本节点
        // 提取 data 属性
        var props = 'expr,filters,type,value',
                options = {}
        props.replace(rword, function (prop) {
            options[prop] = data[prop]
        })
        options.isInText = true
        //将原内容包含到一个span标签上
        var newElement = DOM.createElement('span')
        DOM.replaceChild(newElement, element)
        DOM.innerText(newElement, element.value)
        element = newElement
        // avalon.rebind
        attrValue = 'avalon.rebind(' + [JSON.stringify([options]), JSON.stringify(array)] + ')';
        attrValue = attrValue.replace(/"/ig, "'");
        DOM.setAttribute(element, attrName, attrValue)
    }
}