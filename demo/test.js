var files = ["attr","css","if","expression","visible","include","repeat","with"]
// var files = ["attr","css","if","expression","visible","include"]

var parse5 = require('parse5'),
    parser = new parse5.Parser(),
    serializer = new parse5.Serializer(),
    fs = require('fs'),
    // 引入 node-avalon
    avalon = require('../avalon')

fs.mkdir('./public', function(){})

files.forEach(function (name) {
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

    var fileName = './public/' + name + '.html'
    fs.writeFile(fileName, str, function (err) {
        if (err) {
            console.log(fileName + ' 创建失败！')
            console.log(err)
        } else {
            console.log(fileName + ' 创建成功！');
        }
    });
})


