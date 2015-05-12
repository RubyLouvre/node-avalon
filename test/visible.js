describe('测试ms-visible', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "a111",
            toggle: true,
            table: true,
            tr: true,
            td: true
        })

        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="a111">
             <head>
             <title>测试visible绑定的后端渲染</title>
             </head>
             <body>
             <div style="display:inline-block" ms-visible='toggle'></div>
             <div style="display:inline-block" ms-visible='!toggle'></div>
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
//        expect(str.indexOf('<div style="display:inline-block" ms-visible="toggle"></div>') !== -1).to.be(true)
//        expect(str.indexOf('data-b="123"') !== -1).to.be(true)
//        expect(str.indexOf('data-c="false"') !== -1).to.be(true)
//        expect(str.indexOf('data-d="null"') !== -1).to.be(true)
    //    avalon.vmodels = {}
    
    
//    <div style="display:inline-block" ms-visible="toggle"></div>
//<div style="display:inline-block" ms-visible="!toggle"></div>
//<table style="display:table" ms-visible="table">
//<tbody><tr ms-visible="tr"><td ms-visible="td"></td></tr>
    })
})