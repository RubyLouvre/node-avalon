var vm = avalon.define({
	$id: 'test',

    text1: '孤立的插值表达式',
    text2: '元素中的插值表达式',
    text3: '元素中的前后有字符的插值表达式',

    text4: '含有<strong>加粗标签</strong>',

    change: function() {
        var randomNum = Math.random()

        vm.text1 = '孤立的插值表达式' + randomNum
        vm.text2 = '元素中的插值表达式' + randomNum
        vm.text3 = '元素中的前后有字符的插值表达式' + randomNum
        vm.text4 = '含有<strong>加粗标签</strong>' + randomNum
    }
})