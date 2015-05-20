var files = ['expression', 'expression-html', 'html', 'class']
var userDefine = process.argv[2] && process.argv[2].split(",")
if(userDefine) files = userDefine

var parse5 = require('parse5'),
    parser = new parse5.Parser(),
    serializer = new parse5.Serializer(),
    fs = require('fs'),
    // 引入 node-avalon
    avalon = require('../avalon')

fs.mkdir('./public', function(){})
files.forEach(function(name) {
    // 引入 js 文件，以字符串形式
    var scriptStr = fs.readFileSync('./script/' + name + '.js', 'utf-8')
        // 引入 html 文件，以字符串形式
    var htmlStr = fs.readFileSync('./html/' + name + '.html', 'utf-8')
    avalon.mainPath = "./html/"
        // 在服务器上执行浏览器的脚本
    eval(scriptStr)

    var dom = parser.parse(htmlStr)
    avalon.scan(dom, vm)
    var str = serializer.serialize(dom);

    fs.writeFile('./public/' + name + '.html', str, function(err) {
        console.log('成功生成 ./public/' + name + '.html');
    });

    var bodyNode = avalon.getElementsTagName(dom, 'body');
    if (bodyNode.length == 0) {
        console.log("warning: 没有找到body节点，无法生成测试。")
        return;
    }
    bodyNode = bodyNode[0];
    bodyNode.childNodes.push({
        nodeName: 'div',
        tagName: 'div',
        attrs: [{ name: 'id', value : "mocha" }],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        nodeType: 1,
        parentNode: bodyNode,
        childNodes: []
    });
    ["../../node_modules/mocha/mocha.css", "../styles/test.css"].forEach(function (cssPath){
        bodyNode.childNodes.push({
            nodeName: 'link',
            tagName: 'link',
            attrs: [{ name: 'rel', value: "stylesheet"}, { name: 'href', value: cssPath }],
            namespaceURI: 'http://www.w3.org/1999/xhtml',
            nodeType: 1,
            parentNode: bodyNode,
            childNodes: []
        })
    });
    ["../../node_modules/mocha/mocha.js", "../expect.js", "../testcase.start.js", name+".js", "../testcase.begin.js"].forEach(function (scriptPath){
        bodyNode.childNodes.push({
            nodeName: 'script',
            tagName: 'script',
            attrs: [{ name: 'src', value : scriptPath }],
            namespaceURI: 'http://www.w3.org/1999/xhtml',
            nodeType: 1,
            parentNode: bodyNode,
            childNodes: []
        })
    });
    var str = serializer.serialize(dom);

    fs.writeFile('./testcases/' + name + '.html', str, function(err) {
        console.log('成功生成 ./testcases/' + name + '.html');
    });
})
