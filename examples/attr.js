var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
        $id: "test",
        aaa: "111",
        bbb: "222",
        ccc: "333",
        tt: "./template1.html"
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
        <script id='tmpl' type="avalon"><strong>这是模板</strong></script>
        <div ms-attr-title='aaa'></div>
        <input ms-value="bbb" ms-title="ccc" />
        <p><a ms-src="{{aaa}}ss/{{bbb}}.html">link</a></p>
        <select><option ms-selected="ccc">aaa</option></select>
        |<div ms-include="'tmpl'">这里的内容会被替换掉</div>|
       <blockquote ms-include-src="tt" data-include-replace='true'>这个元素会被替换掉</blockquote>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)
var str = serializer.serialize(dom);
console.log(str)
