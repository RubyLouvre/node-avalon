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
             <div style="display:inline-block;" ms-visible='toggle'></div>
             <div ms-visible='toggle'></div>
             <div id="hidden_case_0" style="display:inline-block;" ms-visible='!toggle'></div>
             <div id="hidden_case_1" ms-visible='!toggle'></div>
             <table style="display:table;" ms-visible="table">
             <tr ms-visible="tr"><td ms-visible="td"></td></tr>
             </table>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        expect(str.indexOf('<div style="display:inline-block;"></div>') !== -1).to.be(true)
        expect(str.indexOf('<div></div>') !== -1).to.be(true)
        expect(str.indexOf('<div id="hidden_case_0" style="display:none;"></div>') !== -1).to.be(true)
        expect(str.indexOf('<div id="hidden_case_1" style="display:none;"></div>') !== -1).to.be(true)
        expect(str.indexOf('<table style="display:table;">') !== -1).to.be(true)
        expect(str.indexOf('<tr><td></td></tr>') !== -1).to.be(true)
    })
})