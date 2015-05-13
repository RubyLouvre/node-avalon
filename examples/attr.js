var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
    $id: "test",
    aaa: "111",
    bbb: "2"
})

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function(){
    /*
<!DOCTYPE html><html ms-controller="test"><body>
    <div ms-attr-title='aaa' ms-attr-name="bbb"></div>
</body></html>
     */
})
var dom = parser.parse(text)
debugger
avalon.scan(dom, vm)
var str = serializer.serialize(dom);
console.log(str)