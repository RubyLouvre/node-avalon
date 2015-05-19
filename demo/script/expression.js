var vm = avalon.define({
    $id: 'test',
    text1: '孤立的插值表达式',
    text2: '元素中的插值表达式',
    text3: '元素中的前后有字符的插值表达式',
    num1: 1,
    num2: 2,

    change: function() {
        var randomNum = Math.random()

        vm.text1 = '孤立的插值表达式' + randomNum
        vm.text2 = '元素中的插值表达式' + randomNum
        vm.text3 = '元素中的前后有字符的插值表达式' + randomNum

        vm.num1 = Math.floor(randomNum * 10)
        vm.num2 = Math.floor(Math.random() * 60)
    }
})