
describe('测试ms-repeat', function () {
    it("sync", function () {
        var vm = avalon.define({
            $id: "test-repeat",
            array: [1, 2, 3, 4, 5],
            object: {
                a: 1,
                b: 2,
                c: 3
            }
        })
        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test-repeat">
             <head>
             <title>测试repeat绑定的后端渲染</title>
             </head>
             <body>
             <ul><li ms-repeat="array">{{el}}-{{$first}}-{{$last}}-{{$index}}</li></ul>
             <ol ms-each="array"><li>{{el}}</li></ol>
             <div ms-with="object"><strong>{{$key}}-{{$val}}</strong></div>
             <map>X<area ms-repeat="object" ms-attr-title="$key"></map>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom);
        str = str.replace(/<!--\w+\d+(:end)?-->/g, "")

        expect(str.indexOf('<ul><li>1-true-false-0</li><li>2-false-false-1</li><li>3-false-false-2</li><li>4-false-false-3</li><li>5-false-true-4</li></ul>') !== -1).to.be(true)
        expect(str.indexOf("<ol><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ol>") !== -1).to.be(true)
        expect(str.indexOf("<div><strong>a-1</strong><strong>b-2</strong><strong>c-3</strong></div>") !== -1).to.be(true)
        expect(str.indexOf('<map>X<area title="a"><area title="b"><area title="c"></map>') !== -1).to.be(true)
        delete avalon.vmodels["test-repeat"]

    })
    it("async", function (done) {
        var vm = avalon.define({
            $id: "test-repeat2",
            array: ["a", "b", "c", "d", "e"]
        })

        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test-repeat2">
             <head>
             <title>测试repeat绑定的后端渲染</title>
             </head>
             <body>
             <ul><li ms-repeat="array">{{el}}-{{$index}}</li></ul>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom)
        str = str.replace(/<!--\w+\d+(:end)?-->/g, "")
        var lis = avalon.getElementsTagName(dom, "li")
        expect(lis.length).to.be(5)
        expect(str.indexOf('<ul><li>a-0</li><li>b-1</li><li>c-2</li><li>d-3</li><li>e-4</li></ul>') !== -1).to.be(true)
        vm.array.shift()
        setTimeout(function () {
            var lis = avalon.getElementsTagName(dom, "li")
            expect(lis.length).to.be(4)
            var str = serializer.serialize(dom)
            str = str.replace(/<!--\w+\d+(:end)?-->/g, "")
            expect(str.indexOf("<li>b-0</li>") !== -1).to.be(true)
            done()
        }, 500)


    })
      it("ms-with", function () {
        var vm = avalon.define({
            $id: "test-repeat3",
            xxx:{
                a: 1,
                b: 2,
                c: 3
            }
        })

        var text = heredoc(function () {
            /*
             <!DOCTYPE html>
             <html ms-controller="test-repeat3">
             <head>
             <title>测试repeat绑定的后端渲染</title>
             </head>
             <body>
             <ul><li ms-xxx="array">{{$key}}-{{$val}}</li></ul>
             </body>
             </html>
             */
        })
        var dom = parser.parse(text)
        avalon.scan(dom, vm)
        var str = serializer.serialize(dom)
        str = str.replace(/<!--\w+\d+(:end)?-->/g, "")
        var lis = avalon.getElementsTagName(dom, "li")
       console.log(str)


    })
})




