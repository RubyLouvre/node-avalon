var vm = avalon.define({
    $id: 'test',
    array: [1, 2, 3, 4, 5],
    object: {
        a: 1,
        b: 2,
        c: 3
    },

    change: function() {
    	var randomNum = Math.random()

    	arr = [1 + randomNum, 2 + randomNum, 3 + randomNum]
    }
})