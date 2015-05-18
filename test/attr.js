describe('测试ms-attr', function () {
    var vm = avalon.define({
        $id: "attr1",
        aaa: "111",
        bbb: "222",
        ccc: "333",
        labelName: "qunar power",
        tt: "./template1.html"
    })

    var getHtmlOutput = function (heredocFn) {
        var text = heredoc(heredocFn);
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        str = removeMSScan(removeComment(str))
console.log(str)
        return str;
    }


    it("<html ms-controller=\"attr1\">controller绑定", function() {
        var str = getHtmlOutput(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head>
             </head>
             <body>
             </body>
             </html>
             */
        })
 
        expect(str.indexOf('<html ms-controller="attr1" ms-skip-ctrl="true">')).to.be.above(-1)
    })

    it("<div ms-attr-title='aaa'></div>ms-attr-title绑定", function () {
        var str = getHtmlOutput(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <div ms-attr-title='aaa'></div>
             </body>
             </html>
             */
        })

        expect(str.indexOf('title="111"')).to.be.above(-1)
    })

    it("<input ms-value=\"bbb\"/>Input value绑定", function () {
        var str = getHtmlOutput(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <input ms-value="bbb"/>
             </body>
             </html>
             */
        })

        expect(str.indexOf('<input value="222">')).to.be.above(-1)
    })

    it("<a ms-href=\"{{aaa}}ss/{{bbb}}.html\">link</a>A href绑定", function () {
        var str = getHtmlOutput(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <a ms-href="{{aaa}}ss/{{bbb}}.html">link</a>
             </body>
             </html>
             */
        })

        expect(str.indexOf('<a href="111ss/222.html">link</a>')).to.be.above(-1)
    })

    it("<option ms-selected=\"ccc\">aaa</option>selected绑定", function () {
        expect(getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <select>
                    <option ms-selected="ccc">aaa</option>
                    <option>bbb</option>
                </select>
             </body>
             </html>
             */
        }).indexOf('<option selected="selected">aaa</option>')).to.be.above(-1)
    })

    it("内联Include绑定", function () {
        var html = getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <script id='tmpl' type="avalon"><strong>这是模板</strong></script>
                <div ms-include="'tmpl'">这里的内容会被替换掉</div>
             </body>
             </html>
             */
        });
        expect(html.indexOf("<script id='tmpl' type=\"avalon\"><strong>这是模板</strong></script>")).to.be(-1);
        expect(html.indexOf('<!--ms-include--><strong>这是模板</strong><!--ms-include-end-->')).to.be.above(-1);
    })

    it("外链Include绑定, replace=true", function () {
        var html = getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <blockquote ms-include-src="tt" data-include-replace='true'>这个元素会被替换掉</blockquote>
             </body>
             </html>
             */
        });
        expect(html.indexOf('这个元素会被替换掉')).to.be(-1)
        expect(html.indexOf('<blockquote data-include-replace="true">')).to.be.above(-1)
        expect(html.indexOf('<div>\n   这是另一个文件\n</div>')).to.be.above(-1)
    })
    it("外链Include绑定, replace=false", function () {
        var html = getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <blockquote ms-include-src="tt" data-include-replace='false'>这个元素会被替换掉</blockquote>
             </body>
             </html>
             */
        });
        expect(html.indexOf('这个元素会被替换掉')).to.be(-1)
        expect(html.indexOf('<blockquote data-include-replace="false">')).to.be.above(-1)
        expect(html.indexOf('<div>\n   这是另一个文件\n</div>')).to.be.above(-1)
    })

    it("ms-skip", function () {
        var html = getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <div id='skip-test' ms-skip></div>
             </body>
             </html>
             */
        });
        expect(html.indexOf('id="skip-test" ms-skip')).to.be.above(-1)
    })

    it("ms-attr-name", function () {
        var html = getHtmlOutput(function() {
            /*
             <!DOCTYPE html>
             <html ms-controller="attr1">
             <head></head>
             <body>
                <label ms-attr-name="labelName"></label>
             </body>
             </html>
             */
        });
        expect(html.indexOf('<label name="qunar power"></label>')).to.be.above(-1)
    })
})

