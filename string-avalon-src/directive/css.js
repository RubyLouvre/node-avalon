bindingHandlers.css = bindingHandlers.attr 


bindingExecutors.css = function (val, elem, data) {
    var key = data.param

    if (key === 'zIndex') {
        
    }

    DOM.setStyle(elem, key, val)

    if (key === 'opacity') {
        DOM.setStyle(elem, 'filter', 'alpha(opacity=' + val * 100 + ')\\9')
    }
}
