var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('./avalon')
var vm = avalon.define({
        $id: "test",
        aaa: "111",
        bbb: "222",
        ccc: "333"
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
    <body>
        <div ms-attr-title='aaa'></div>
        <input ms-value="bbb"/>
        <p><a ms-src="{{aaa}}ss/{{bbb}}.html">link</a></p>
        <select><option ms-selected="ccc">aaa</option></select>
        |<div ms-include=aaa></div>|
        <div ms-include=bbb data-include-replace='true'>222</div>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)


var str = serializer.serialize(dom);
console.log(str)
