describe('测试ms-css', function () {
    it("sync", function () {

        var vm = avalon.define({
            $id: "test-css",
            color: "red",
            opacity: 0.1,
            zIndex: 1
        })

        var text = heredoc(function () {
/*
<!DOCTYPE html>
<html ms-controller="test-css">
    <head>
        <title>测试css绑定的后端渲染</title>
    </head>
    <body>
        <p
            ms-css-background-color="color"
            ms-css-opacity="opacity"
            ms-css-z-index="zIndex"
        >
            heheda
        </p>
    </body>
</html>
*/
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        // console.log(str)
        expect(str.indexOf('background-color: red;') !== -1).to.be(true)
        expect(str.indexOf('opacity: 0.1') !== -1).to.be(true)
        expect(str.indexOf('filter: alpha(opacity=10)\\9;') !== -1).to.be(true)
        expect(str.indexOf('z-index: 1') !== -1).to.be(true)
    })
})
