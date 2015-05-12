var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
        $id: "test",
        color: "red",
        opacity: 0.1,
        zIndex: 1
    })
    
function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function(){
    /*
<!DOCTYPE html>
<html ms-controller="test">
    <head>
        <title>测试css绑定的后端渲染</title>
    </head>
    <body>
        <p
            ms-css-background-color="color"
            ms-css-opacity="opacity"
            ms-css-z-index="zIndex"

            style="opacity: .5; z-index: 3!important;"
        >
            heheda
        </p>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)
var str = serializer.serialize(dom);
console.log('~~~~~~~~~~~~~~~~~~~~~~ html ~~~~~~~~~~~~~~~~~~~~~~')
console.log(str)
