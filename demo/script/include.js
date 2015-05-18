avalon.templateCache.xxx = "<p>这是另一个模板</p>"
var vm = avalon.define({
    $id: 'test',
    aaa: './include-tmpl.html',
    change: function() {
       vm.aaa = vm.aaa === "./include-tmpl.html" ? "xxx" : "./include-tmpl.html"
    }
})
