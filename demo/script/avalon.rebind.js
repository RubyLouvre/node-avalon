/************************************************************************
 *               avalon.rebind node-avalon 绑定恢复                     *
 ************************************************************************/
avalon.rebind = function(bindings, vmodelIds) {
    var element = this,
        vmodels = vmodelIds.map(function(id) {
            return avalon.vmodels[id]
        })

    for (var i = 0, data; data = bindings[i++]; ) {
        data.vmodels = vmodels

        if (data.type === 'text') {
            // 如果是插值表达式
            // 将 node-avalon 生成的 span 元素用文本节点替换
            var parent = element.parentNode,
                textNode = element.childNodes[0].cloneNode(false)

            parent.replaceChild(textNode, element)
            data.element = textNode                
        } else {
            data.element = element
        }
        
        // 重新渲染  data.type 绑定
        avalon.bindingHandlers[data.type](data, vmodels)
    }
}