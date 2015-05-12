var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
        $id: "test",
        string: "11",
        number: 123,
        bool: false,
        null: null
    })
    
function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function(){
    /*
<!DOCTYPE html>
<html ms-controller="test">
    <head>
        <title>测试attr绑定的后端渲染</title>
    </head>
    <body ms-controller=test>
        <div ms-data-a='string' ms-data-b="number" ms-data-c="bool" ms-data-d="null"></div>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)
var str = serializer.serialize(dom);

console.log(str)

