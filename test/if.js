
describe('测试ms-if', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "test-if",
            aaa: true,
            bbb: false
        })
        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test-if">
             <head>
             <title>测试if绑定的后端渲染</title>
             </head>
             <body>
             <div ms-if="aaa">x</div>
             <div ms-if="bbb"></div>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        // console.log(str)
        expect(str.indexOf('<div>x</div>') !== -1).to.be(true)
        expect(str.indexOf('<!--<div ms-if="bbb"></div>-->') !== -1).to.be(true)
    })
})

 

