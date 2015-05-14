var vm = avalon.define({
	$id: 'test',

    text1: '孤立的插值表达式',
    text2: '被包含的插值表达式',

    change: function() {
        var randomNum = Math.random()

        vm.text1 = '孤立的插值表达式' + randomNum
        vm.text2 = '被包含的插值表达式' + randomNum
    }
})