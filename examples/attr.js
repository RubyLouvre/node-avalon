var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
    $id: "test",
    aaa: "111"
})

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
var text = heredoc(function(){
    /*
<!DOCTYPE html ms-controller="test"><html><body>
    <div ms-attr-title='aaa'>{{aaa}}</div>
</body></html>
     */
})
var dom = parser.parse(text)
avalon.scan(dom, vm)
var str = serializer.serialize(dom);
console.log(str)