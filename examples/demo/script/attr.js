var vm = avalon.define({
    $id: 'test',
    aaa: 'this is title',
    bbb: 'this is name',

    change: function() {
    	var randomNum = Math.random()

    	vm.aaa = 'this is title ' + randomNum
    	vm.bbb = 'this is name ' + randomNum
    }
})