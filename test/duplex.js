describe('测试ms-duplex', function () {
    it("sync", function () {

        var vm = avalon.define({
            $id: "test-duplex",
            a: false,
            b: ["1","2"],
            c: 'haha',
            d: true,
            select: 2
        })

        var text = heredoc(function () {
/*
<!DOCTYPE html>
<html ms-controller="test-duplex">
    <head>
        <title>测试attr绑定的后端渲染</title>
    </head>
    <body>
        <select ms-duplex="select">
            <option value="1">value 1</option>
            <option value="2">value 2</option>
            <option value="3">value 3</option>
        </select>

        <input type="radio" ms-duplex-checked='a'/>
        <input type="radio" id="radio-2" ms-duplex-checked='d'/>
        <input type="checkbox" ms-duplex-checked='a'/>
        <input type="checkbox" id="checkbox-1" ms-duplex-checked='!a'/>
        <input type="checkbox" ms-duplex-string='b' value="1"/>
        <input type="checkbox" ms-duplex-string='b' value="2"/>
        <input type="checkbox" ms-duplex-string='b' value="3"/>
        <input type="text" ms-duplex="c"/>
        <textarea ms-duplex="c"></textarea>
    </body>
</html>
*/
        })

        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        // console.log(str)
        
        expect(str.indexOf('<option value="2" selected="selected">value 2</option>') !== -1).to.be(true)
        expect(str.indexOf('id="radio-2" checked="checked"') !== -1).to.be(true)
        expect(str.indexOf('id="checkbox-0" checked="checked"') !== -1).to.be(true)
        expect(str.indexOf('id="checkbox-1" value="1" checked="checked"') !== -1).to.be(true)
        expect(str.indexOf('id="checkbox-2" value="2" checked="checked"') !== -1).to.be(true)
        expect(str.indexOf('<input type="text" value="haha">') !== -1).to.be(true)
        expect(str.indexOf('<textarea>haha</textarea>') !== -1).to.be(true)
    })
})
