describe('测试ms-attr', function () {
    var vm = avalon.define({
        $id: "attr1",
        aaa: "111",
        bbb: "222",
        ccc: "333",
        labelName: "qunar power",
        tt: "./template1.html"
    })
    var text = heredoc(function () {
        /*
         <!DOCTYPE html>
         <html ms-controller="attr1">
         <head>
         <title>测试attr绑定的后端渲染</title>
         </head>
         <body>
         <script id='tmpl' type="avalon"><strong>这是模板</strong></script>
         <div ms-attr-title='aaa'></div>
         <input ms-value="bbb"/>
         <p><a ms-href="{{aaa}}ss/{{bbb}}.html">link</a></p>
         <select><option ms-selected="ccc">aaa</option></select>
         |<div ms-include="'tmpl'">这里的内容会被替换掉</div>|
         <blockquote ms-include-src="tt" data-include-replace='true'>这个元素会被替换掉</blockquote>
         <div id='skip-test' ms-skip></div>
         <label ms-attr-name="labelName"></label>
         </body>
         </html>
         */
    })
    var dom = parser.parse(text)
    avalon.scan(dom, vm)
    var str = serializer.serialize(dom);
    console.log(str)

    it("<html ms-controller=\"attr1\">controller绑定", function() {
        expect(str.indexOf('<html ms-controller="attr1" ms-skip-ctrl="true">')).to.be.above(-1)
    })

    it("<div ms-attr-title='aaa'></div>ms-attr-title绑定", function () {
        expect(str.indexOf('<div title="111"></div>')).to.be.above(-1)
    })

    it("<input ms-value=\"bbb\"/>Input value绑定", function () {
        expect(str.indexOf('<input value="222">')).to.be.above(-1)
    })

    it("<a ms-href=\"{{aaa}}ss/{{bbb}}.html\">link</a>A href绑定", function () {
        expect(str.indexOf('<a href="111ss/222.html">link</a>')).to.be.above(-1)
    })

    it("<option ms-selected=\"ccc\">aaa</option>selected绑定", function () {
        expect(str.indexOf('<option selected="selected">aaa</option>')).to.be.above(-1)
    })

    it("内联Include绑定", function () {
        expect(str.indexOf('<script id=\'tmpl\' type="avalon"><strong>这是模板</strong></script>')).to.be(-1)
        expect(str.indexOf('<!--ms-include--><strong>这是模板</strong><!--ms-include-end-->')).to.be.above(-1)
    })

    it("外链Include绑定", function () {
        expect(str.indexOf('<blockquote ms-include-src="tt" data-include-replace=\'true\'>这个元素会被替换掉</blockquote>')).to.be(-1)
        expect(str.indexOf('<div>\n   这是另一个文件\n</div>')).to.be.above(-1)
    })

    it("ms-skip", function () {
        expect(str.indexOf('id="skip-test" ms-skip')).to.be.above(-1)
    })

    it("ms-attr-name", function () {
        expect(str.indexOf('<label name="qunar power"></label>')).to.be.above(-1)
    })
})

