describe('测试{{prop}},{{prop|html}},ms-text,ms-html', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "test",
            aaa: "<b>1111</b>",
            bbb: "<b>222</b>"
        })
        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test">
             <head>
             <title>测试text绑定的后端渲染</title>
             </head>
             <body>
             <div><em>用于测试是否被测除</em>xxxx{{aaa}}yyyy</div>
             <div><em>用于测试是否被测除</em>xxxx{{aaa|html}}yyyy</div>
             <div ms-text="bbb"><em>用于测试是否被测除</em>xxxx yyyy</div>
             <div ms-html="bbb"><em>用于测试是否被测除</em>xxxx yyyy</div>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        console.log(str)
        expect(str.indexOf('<div><em>用于测试是否被测除</em>xxxx&lt;b&gt;1111&lt;/b&gt;yyyy</div>') !== -1).to.be(true)
        expect(str.indexOf('<div><em>用于测试是否被测除</em>xxxx<b>1111</b>yyyy</div>') !== -1).to.be(true)
        expect(str.indexOf('<div>&lt;b&gt;222&lt;/b&gt;</div>') !== -1).to.be(true)
        expect(str.indexOf('<div><b>222</b></div>') !== -1).to.be(true)
    })
})
