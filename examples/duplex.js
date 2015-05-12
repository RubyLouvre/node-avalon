var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('../avalon')
var vm = avalon.define({
        $id: "test",
        a: false,
        b: ["1","2"],
        c: 'haha',
        d: true,
        select: 2
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
        
        <select ms-duplex="select">
            <option value="1">value 1</option>
            <option value="2">value 2</option>
            <option value="3">value 3</option>
        </select>

        <input type="radio" id="radio-1" ms-duplex-checked='a'/>
        <input type="radio" id="radio-2" ms-duplex-checked='d'/>
        <input type="checkbox" ms-duplex-checked='a'/>
        <input type="checkbox" id="checkbox-0" ms-duplex-checked='!a'/>
        <input type="checkbox" id="checkbox-1" ms-duplex-string='b' value="1"/>
        <input type="checkbox" id="checkbox-2" ms-duplex-string='b' value="2"/>
        <input type="checkbox" id="checkbox-3" ms-duplex-string='b' value="3"/>
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
/*
       
 */