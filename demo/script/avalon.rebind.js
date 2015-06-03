/************************************************************************
 *               avalon.rebind node-avalon 绑定恢复                     *
 ************************************************************************/
new function () {
    var bindingExecutors = avalon.bindingExecutors
    var bindingHandlers = avalon.bindingHandlers
    var getBindingCallback = function(elem, name, vmodels) {
        var callback = elem.getAttribute(name)
        if (callback) {
            for (var i = 0, vm; vm = vmodels[i++]; ) {
                if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                    return vm[callback]
                }
            }
        }
    }
    function getVmodel(expr, vmodels) {
        for (var i = 0, el; el = vmodels[i++]; ) {
            var v = el.$model 
            if (v) {
                var arr = expr.split(".")
                while (v = v[arr.shift()]) {
                }
                if (arr.length === 0)
                    return el
            }
        }
    }
    function getProxy(proxies, proxyIndex) {
        var proxies = proxies.proxies || proxies.$repeat && proxies.$repeat.$proxy // 新版
        return proxies && proxies[proxyIndex]
    }
    var callbackHash = {}, tmp
    bindingHandlers._getproxy = function(data, vmodels) {
        var elem = data.element,
            par = elem.parentNode
        tmp = tmp || {}
        if(par && vmodels[0] && vmodels[0].$key) {
            tmp[vmodels[0].$key] = vmodels[0]
        }
    }
    var bindingHandlersRepeat = function (data, vmodels) {
        var expr = data.value,
            targetVM = getVmodel(expr, vmodels),
            elem = data.element,
            par = elem.parentNode,
            type = data.type
        if(targetVM) {
            // 可监听
            try {
                var div = document.createElement("div")
                var arr = targetVM[expr] || targetVM.$map && targetVM.el // 新版avalon内proxy没有expr属性鸟
                var isWith = !(targetVM[expr] && (targetVM[expr] instanceof Array))
                div.innerHTML ="<i>" + (isWith ? "<b ms-_getproxy></b>" : "") + "</i>"
                var loop = div.childNodes[0]
                var t = type == "repeat" ? loop : div
                t.setAttribute(data.name, expr)
                div.style.display = "none"
                par.appendChild(div)
                avalon.scan(t, vmodels)
                var proxyArray = arr.$events[avalon.subscribers].pop()
                // 新版，如果没有$proxy属性才采用猥琐方式tmp获取
                if(proxyArray.$with) proxyArray.proxies = proxyArray.$repeat && proxyArray.$repeat.$proxy || tmp
                tmp = {}
                par.removeChild(div)
                return [proxyArray, arr]
            } catch(e) {
                avalon.log(e)
            }
        }
    }
    avalon.rebind = function (bindings, vmodelIds) {
        var vmodels = vmodelIds.map(function (id) {
            return avalon.vmodels[id]
        })
        for (var i = 0, data; data = bindings[i++]; ) {
            resetData(data)
            var rebindFn = avalon.rebind[data.type]
            data.element = this
            if (typeof rebindFn === "function") {
                rebindFn(data, vmodels, this)
            }
        }
    }
    function noop() {
    }
    var priorityMap = {
        "if": 10,
        "repeat": 90,
        "data": 100,
        "widget": 110,
        "each": 1400,
        "with": 1500,
        "_getproxy": 1501,
        "duplex": 2000,
        "on": 3000
    }
    function resetData(data) {
        if (data.a) {
            var arr = data.a.split("=")
            var name = arr.shift()
            var value = arr.join("=")
            arr = name.split("-")
            var type = arr.shift()
            var param = arr.join("-") || ""

            data.value = value
            data.name = "ms-" + name
            data.type = type
            data.param = param
            data.priority = type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
            delete data.a
        }
    }


    function injectBinding(name, data, vmodels) {
        var fn = bindingExecutors[name]
        bindingExecutors[name] = noop //防止刷新视图
        bindingHandlers[name](data, vmodels)
        bindingExecutors[name] = fn
        data.handler = bindingExecutors[data.handlerName || name]
    }
    avalon.mix(avalon.rebind, {
        attr: function (data, vmodels, elem) {
            injectBinding("attr", data, vmodels)
        },
        "class": function (data, vmodels, elem) {
            var addClass = avalon.fn.addClass
            var removeClass =  avalon.fn.removeClass
            avalon.fn.addClass= noop
            avalon.fn.removeClass = noop
            bindingHandlers["class"](data, vmodels)
            avalon.fn.addClass = addClass
            avalon.fn.removeClass = removeClass
        },
        text: function (data, vmodels, elem) {

            // 将 node-avalon 添加的 span 元素去除
            var node = elem.firstChild
            elem.parentNode.replaceChild(node, elem)
            data.element = node

            injectBinding("text", data, vmodels)
        },
        html: function(data, vmodels, elem) {
            if (data.filter) {
                // html 过滤器
                var nodes = elem.childNodes,
                    len = nodes.length,
                    parentNode = elem.parentNode,
                    nextNode = elem.nextSibling,
                    node

                // 将 node-avalon 添加的 span 元素去除
                parentNode.removeChild(elem)

                while (nodes[0]) {
                    // 提取第一个节点，绑定用
                    if (!node) {
                        node = nodes[0]
                    }
                    // 将 span 元素的子元素提取加入 dom
                    parentNode.insertBefore(nodes[0], nextNode)
                }

                data.element = node
                data.group = len
                delete data.filter
            }
            injectBinding("html", data, vmodels)
        },
        data: function (data, vmodels, elem) {
            injectBinding("data", data, vmodels)
        },
        if: function (data, vmodels, elem) {
            var isInDom = data.isInDom,
                loopIf = "ms-if-loop"
            delete data.isInDom
            if (!isInDom) {
                data.element = avalon.parseHTML(elem.text).firstChild
                // loopIf的执行是在scan之前，所以其实模板是没有scan的，恢复属性先
                if(data.name == loopIf) {
                    data.element.setAttribute(loopIf, data.value)
                }
                elem.parentNode.replaceChild(data.element, elem)
            }
            data.vmodels = vmodels
            bindingHandlers["if"](data, vmodels)
        },
        visible: function (data, vmodels, elem) {
            var inlineDisplay = data.inlineDisplay
            inlineDisplay = inlineDisplay === "none" ? "" : inlineDisplay
            var isShow = data.isShow
            delete data.inlineDisplay
            delete data.isShow
            injectBinding("visible", data, vmodels)
            if (inlineDisplay) {
                data.display = inlineDisplay
            }
            elem.style.display = isShow ? inlineDisplay : "none"
        },
        include: function (data, vmodels, elem) {

            if (data.template) {
                var arr = data.template.split(" ")
                var key = arr.shift()
                var val = arr.join(' ')
                avalon.templateCache[key] = val
                delete data.template
            }
            injectBinding("attr", data, vmodels)
            if (data.includeReplace) {
                var f = document.createDocumentFragment()
                while (elem.firstChild) {
                    f.appendChild(elem.firstChild)
                }
                f.removeChild(f.firstChild)
                f.removeChild(f.lastChild)
                var parent = elem.parentNode
                parent.replaceChild(f, elem)
            } else {
                elem.removeChild(elem.firstChild)
                elem.removeChild(elem.lastChild)
                data.startInclude = elem.firstChild
                data.endInclude = elem.lastChild
            }


        },
        // repeat的回调补丁
        cb: function(data, vmodels, elem) {
            var signature = data.value,
                callback = callbackHash[signature]
            elem.parentNode.removeChild(elem)
            if(!callback) return
            callback()
            delete callbackHash[signature]
        },
        repeat: function(data, vmodels, elem) {
            var templateString = elem.text,
                template = avalon.parseHTML(templateString),
                par = elem.parentNode,
                nodes = par.childNodes,
                len = nodes.length,
                ids = data.$ids.split(","),
                proxyIndex = 0,
                type = data.type,
                DataElement = par,
                signature = data.signature
            delete data.$ids
            if(type == "repeat") DataElement = template.firstChild
            data.template = template
            data.sortedCallback = getBindingCallback(DataElement, "data-with-sorted", vmodels)
            data.renderedCallback = getBindingCallback(DataElement, "data-" + type + "-rendered", vmodels)
            var proxyArray = bindingHandlersRepeat(data, vmodels)
            if(!proxyArray) return
            var repeatTarget = proxyArray[1]
            proxyArray = proxyArray[0]
            if(proxyArray.$with) {
                for(var i = 0; i < len; i++) {
                    var node = nodes[i]
                    if(i == len - 1) data.element = node
                    if(node.nodeType == 8) {
                        if(node.textContent.indexOf(signature) == -1) continue
                        if(node.textContent == signature) {
                            data.clone = data.$with = node.cloneNode(false)
                            data.$stamp = node
                        }
                    }
                }
                avalon.each(ids, function(i, id) {
                    id = id.split("=")
                    var vm = proxyArray.proxies[id[0]]
                    if(vm) {
                        vm.$id = id[1]
                        avalon.vmodels[id[1]] = vm
                    }
                })
            } else {
                var proxies = data.proxies = data.proxies || []
                for(var i = 0; i < len; i++) {
                    var node = nodes[i]
                    if(i == len - 1) data.element = node
                    if(node.nodeType == 8) {
                        if(node.textContent != signature) continue
                        if(!data.clone) {
                            data.clone = node.cloneNode(false)
                        }
                        if(i != len -1) {
                            var proxy = getProxy(proxyArray, proxyIndex),
                                id = ids[proxyIndex] && ids[proxyIndex]
                            if(proxy) {
                                proxy.$id = id
                                proxy.$stamp = node
                                avalon.vmodels[proxy.$id] = proxy // 临时挂载到全局，在回调里移除
                                proxies.splice(proxyIndex, 0, proxy)
                                proxyIndex++
                            }
                        }
                    }
                }
            }
            avalon.mix(proxyArray, data)
            repeatTarget.$events[avalon.subscribers].push(proxyArray)
            // 回调
            var cb = data.renderedCallback/*,
                resetVmodels = function() {
                    avalon.each(ids, function(i, id) {
                        delete avalon.vmodels[id]
                    })
                    resetVmodels = null
                }
            data.renderedCallback = function() {
                // resetVmodels && resetVmodels()
                cb && cb.apply(this, Array.prototype.slice.call(arguments))
            }*/
            // 由于ms-if-loop，不能在回调里从vmodels上移除proxy
            if(cb) {
                callbackHash[signature] = function() {
                    data.renderedCallback.apply(par, [type == "with" ? "append" : "add", 0, proxyIndex])
                }
            }
            par.removeChild(elem)
        },
        duplex: function (data, vmodels, elem) {
            bindingHandlers["duplex"](data, vmodels)
        }
    })
    "with,each".replace(avalon.rword, function(name) {
        avalon.rebind[name] = avalon.rebind.repeat
    })
    "title,alt,src,value,css,href".replace(avalon.rword, function (name) {
        avalon.rebind[name] = avalon.rebind.attr
    })
}