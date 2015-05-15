var vm = avalon.define({
    $id: 'test',
    aaa: false,

    change: function() {
    	vm.aaa = vm.aaa ? false : true
    }
})