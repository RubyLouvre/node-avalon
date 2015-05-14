function bindForBrowser(data){
    var props = "name,param,priority,type,value"
    var options = {}
    props.replace(rword,function(prop){
        options[prop] = data[prop]
    })
    var array = data.vmodels.map(function(el){
        return el.$id
    })

    var args = [JSON.stringify(options),  JSON.stringify(array)]
    var element = data.element
    if(DOM.nodeType(element) === 1){
        var scanJSFn = "avalon.rebind("+ args.concat(false)+")";
        scanJSFn = scanJSFn.replace(/"/ig, "'"); // 因为ms-scan-xx内的内容是在双引号内，所以需要把所有的Stringify产生的双引号转换为单引号
        
        // 查找ms-scan-*的attribute，如果没有，则生成一个ms-scan-random()。
        var scanAttrName = DOM.lookupAttributeName(element, /^ms-scan-\d*$/);
        if (scanAttrName == undefined) {
            scanAttrName = "ms-scan-"+ Math.round(Math.random() * 100);
        } else {
            scanJSFn = [DOM.getAttribute(element, scanAttrName), scanJSFn].join(";");
        }
        DOM.setAttribute(element, scanAttrName , scanJSFn)
    }else{
        var node = DOM.createElement("script")
        var id = ("ms"+ Math.random()).replace(/0\.\d/,"")
        DOM.innerHTML(node, "setTimeout(function(){avalon.rebind("+ args.concat(JSON.stringify(id))+")},500)")
        DOM.setAttribute(node, "id", id);
        try{
            element.parentNode.childNodes.push(node)
        }catch(e){
        }
    }
}