describe('测试ms-data', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "test-data",
            string: "11",
            number: 123,
            bool: false,
            null: null
        })
        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test-data">
             <head>
             <title>测试attr绑定的后端渲染</title>
             </head>
             <body>
             <div ms-data-a='string' ms-data-b="number" ms-data-c="bool" ms-data-d="null"></div>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        console.log(str)
        expect(str.indexOf('data-a="11"') !== -1).to.be(true)
        expect(str.indexOf('data-b="123"') !== -1).to.be(true)
        expect(str.indexOf('data-c="false"') !== -1).to.be(true)
        expect(str.indexOf('data-d="null"') !== -1).to.be(true)
    })
})




