
describe('测试ms-repeat', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "test",
            array: [1, 2, 3, 4, 5]
        })
        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test">
             <head>
             <title>测试repeat绑定的后端渲染</title>
             </head>
             <body>
             <ul><li ms-repeat="array">{{el}}</li></ul>
             <ol ms-each="array"><li>{{el}}</li></ol>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        console.log(str)
    })
})

