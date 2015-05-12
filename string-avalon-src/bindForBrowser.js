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
        DOM.setAttribute(element, "ms-scan-"+ Math.round(Math.random() * 100) ,"avalon.rebind("+ args.concat(false)+")")
    }else{
        var node = document.createElement("script")
        var id = ("ms"+ Math.random()).replace(/0\.\d/,"")
        node.id = id
        node.innerHTML = "setTimeout(function(){avalon.rebind("+ args.concat(JSON.stringify(id))+")},500)"
        try{
            
             element.parentNode.insertBefore(node, element.nextSibling )
        }catch(e){
        }
    }
}