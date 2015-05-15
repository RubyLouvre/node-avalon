var vm = avalon.define({
    $id: 'test',
    color: 'red',
    opacity: 0.1,
    zIndex: 1,

    change: function() {
    	var randomNum = Math.random()

    	vm.color = vm.color === 'blue' ? 'red' : 'blue'
    	vm.opacity = randomNum
    	vm.zIndex = randomNum
    }
})