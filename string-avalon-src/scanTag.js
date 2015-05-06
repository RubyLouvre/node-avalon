function scanTag(elem, vmodels) {
    if (elem.tagName) {
        elem.nodeType = 1
        if (DOM.getAttribute(elem, "ms-skip"))
            return
        if (!DOM.getAttribute(elem, "ms-skip-ctrl")) {
            var ctrl = DOM.getAttribute(elem, "ms-important")
            if (ctrl) {
                elem.attrs.push({name: "ms-skip-ctrl", value: "true"})
                var isImporant = true
            } else {
                ctrl = DOM.getAttribute(elem, "ms-controller")
                if (ctrl) {
                    elem.attrs.push({name: "ms-skip-ctrl", value: "true"})
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
    } else if (elem.nodeName === "#document") {//如果是文档
        scanNodeArray(elem.childNodes, vmodels)
    } else if (elem.nodeName === "#document-fragment") {//如果是文档文型
        scanNodeArray(elem.childNodes, vmodels)
    }
}