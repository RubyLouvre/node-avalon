var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
    $id: "test",
    aaa: "<p><span>xxx</span></p><br/>",
    bbb: "<p><span>bbb</span></p>ccc<br/>"
    })
    
function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function(){
    /*
<!DOCTYPE html>
<html ms-controller="test">
    <head>
        <title>测试html绑定的后端渲染</title>
    </head>
    <body>
        <div style="font-size:16px">{{aaa|html}}</div>
        <div ms-html="bbb"><b>11</b></div>
    </body>
</html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)


var str = serializer.serialize(dom);
console.log(str)
