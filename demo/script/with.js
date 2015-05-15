var vm = avalon.define({
    $id: 'test',
    object: {
        a: 1,
        b: 2
    },

    change: function() {
    	var randomNum = Math.random()

    	vm.object.a = randomNum
    	vm.object.b = randomNum
    }
})