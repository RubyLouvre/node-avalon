var vm = avalon.define({
    $id: 'test',
    color: 'red',
    opacity: 0.1,
    zIndex: 1,

    change: function() {
    	var randomNum = Math.random()

    	vm.color = '#'+Math.floor(Math.random()*16777215).toString(16);
    	vm.opacity = randomNum
    	vm.zIndex = Math.floor(100 * randomNum)
    }
})