var vm = avalon.define({
    $id: 'test',
    a: "xxx",
    aaa: '含有<strong>{{a}}</strong>',

    change: function() {
        var randomNum = Math.random()
        vm.a = new Date - 0
        vm.aaa = '含有<strong>加粗标签' + randomNum + '</strong>'
    }
})