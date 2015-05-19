var vm = avalon.define({
    $id: 'test',
    aaa: '含有<strong>加粗标签</strong>',

    change: function() {
        var randomNum = Math.random()

        vm.aaa = '含有<strong>加粗标签' + randomNum + '</strong>'
    }
})