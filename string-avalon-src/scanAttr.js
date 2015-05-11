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
                attributes.splice(++i, 1, {name: name, value: value})
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
