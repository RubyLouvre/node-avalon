var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
        $id: "test",
        a: false,
        b: ["1","2"]
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
        <input type="radio" ms-duplex-checked='a'/>
        <input type="radio" ms-duplex-checked='!a'/>
        <input type="checkbox" ms-duplex-checked='a'/>
        <input type="checkbox" ms-duplex-checked='!a'/>
        <input type="checkbox" ms-duplex-string='b' value=1/>
        <input type="checkbox" ms-duplex-string='b' value=2/>
        <input type="checkbox" ms-duplex-string='b' value=3/>
        <input type="text" ms-duplex="c"/>
        <textarea ms-duplex="c"></textarea>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)
var str = serializer.serialize(dom);
console.log(str)
