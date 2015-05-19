var vm = avalon.define({
    $id: 'test',
    a: '插值表达式',
    html1: '一个文本节点',
    html2: '含有<strong>元素节点</strong>',
    html3: '含有<strong>{{a}}</strong>',

    change: function() {
        var randomNum = Math.random()

        vm.html1 = '一个文本节点' + randomNum
        vm.html2 = '含有<strong>元素节点</strong>' + randomNum
        vm.a = '插值表达式' + randomNum
    }
})