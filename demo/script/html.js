var vm = avalon.define({
    $id: 'test',
    aaa: '含有<strong>加粗标签</strong>',

    change: function() {
        var max = Math.floor( Math.random() * 7 )
        var str = ""
        for(var i = 0; i <= max; i++){
            str  += "含有<strong>加粗标签</strong>"+i
        }

        vm.aaa = str
    }
})