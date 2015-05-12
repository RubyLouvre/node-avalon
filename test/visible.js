var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
    $id: "test",
    toggle: true,
    table: true,
    tr: true,
    td: true
})

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function () {
    /*
     <!DOCTYPE html>
     <html ms-controller="test">
     <head>
     <title>测试visible绑定的后端渲染</title>
     </head>
     <body>
     <div style="display:inline-block" ms-visible='toggle'></div>
     <div ms-visible='toggle'></div>
     <div style="display:inline-block" ms-visible='!toggle'></div>
     <div ms-visible='!toggle'></div>
     <table style="display:table" ms-visible="table">
     <tr ms-visible="tr"><td ms-visible="td"></td></tr>
     </table>
     </body>
     </html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)


var str = serializer.serialize(dom);
console.log(str)