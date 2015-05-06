var parse5 = require('parse5')
var parser = new parse5.Parser();
var serializer = new parse5.Serializer();
//https://github.com/exolution/xCube/blob/master/XParser.js

var avalon = require('./avalon')
var vm = avalon.define({
    $id: "test",
    aaa: "司徒正美",
    bbb:"风之大陆"
})

var dom = parser.parse('<!DOCTYPE html><html ms-controller="test"><head></head><body><div>{{aaa}}|{{aaa}}</div><div ms-text="bbb"></div></body></html>')
avalon.scan(dom, vm)

var str = serializer.serialize(dom);
console.log(str)