function bindForBrowser(data) {
    var attrName = 'ms-scan-331',
            attrValue = ''

    // 提取 vmodels id
    var array = [], uniq = {}
    data.vmodels.map(function (el) {
        if (!uniq[el.$id]) {
            uniq[el.$id] = 1
            array.push(el.$id)
        }
    })

    var element = data.element
    if (DOM.nodeType(element) === 1) {
        // 如果是 Element 节点

        // 提取 data 属性
        // var props = 'name,param,priority,type,value',
        //     options = {}
        // props.replace(rword, function(prop) {
        //     options[prop] = data[prop]
        // })
        var type = data.type
        var dataName = type
        if (data.param) {
            dataName += "-" + data.param
        }

        var options = {
            a: dataName + "=" + data.value
        }
        switch (type) {
            case "include":
                options.template = data._template
                delete data._template
                if (data.includeReplace) {
                    options.includeReplace = 1
                }
                break
            case "visible":
                options.isShow = data.isShow
                options.inlineDisplay = data.inlineDisplay
                break
            case "if":
                options.isInDom = data.isInDom
                break
            case "repeat":
            case "each":
            case "with":
                var proxiesIDs = []
                if(data.pool) {
                    for(var i in data.pool) {
                        var proxy = data.pool[i]
                        proxiesIDs.push(proxy.$key + "=" + proxy.$id)
                    }
                } else {
                    data.proxies.forEach(function(proxy) {
                        proxiesIDs.push(proxy.$id)
                    })
                }
                options.signature = data.signature
                options.$ids = proxiesIDs.join(",") // 收集$id
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

    } else {
        // 如果是 Text 节点
    
        // 提取 data 属性
        var props = 'expr,filters,type,value',
            options = {}
        props.replace(rword,function(prop){
            options[prop] = data[prop]
        })
        
        options.isInText = true

        var newElement = DOM.createElement('span')
            copy = DOM.cloneNode(element, true)

        newElement.childNodes.push(copy)
        copy.parentNode = newElement

        data.element = newElement

        // avalon.rebind
        attrValue = 'avalon.rebind(' + [JSON.stringify([options]), JSON.stringify(array)] + ')';
        attrValue = attrValue.replace(/"/ig, "'");
        DOM.setAttribute(newElement, attrName , attrValue)

        DOM.replaceChild(newElement, element)
    }
}