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
        var divs = avalon.getElementsTagName(dom, "div")
        var str = serializer.serialize(dom)
        str = str.replace(/ms-scan-\d+="[^"]+"/g, "").replace(/<!--\w+\d+(:end)?-->/g, "")
        console.log(str)
        expect(avalon(divs[0]).attr("style")).to.be("display:inline-block;")
        expect(avalon(divs[1]).attr("style")).to.be(undefined)
        expect(avalon(divs[2]).attr("style")).to.be("display:none;")
        expect(avalon(divs[3]).attr("style")).to.be("display:none;")
        var tables = avalon.getElementsTagName(dom, "table")
        expect(avalon(tables[0]).attr("style")).to.be("display:table;")
        var trs = avalon.getElementsTagName(dom, "tr")
        expect(avalon(trs[0]).attr("style")).to.be(undefined)
        var tds = avalon.getElementsTagName(dom, "td")
        expect(avalon(tds[0]).attr("style")).to.be(undefined)

    })
})