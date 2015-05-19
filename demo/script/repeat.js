var vm = avalon.define({
    $id: 'test',
    array: [1, 2, 3, 4, 5],
    object: {
        a: 1,
        b: 2,
        c: 3
    },

    over: function() {
        console.log(arguments)
    },

    change: function() {
    	var randomNum = Math.random()

    	vm.array = [1 + randomNum, 2 + randomNum, 3 + randomNum]
        vm.object.a = vm.array[0]
        vm.object.b = vm.array[1]
        vm.object.c = vm.array[2]
    }
})