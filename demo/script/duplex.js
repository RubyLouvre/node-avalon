var vm = avalon.define({
    $id: 'test',
    staticDuplexValue: 0,

    dynamicOptDuplexValue: 'a',

    opt1Val: 'a',
    opt2Val: 'b',
    opt3Val: 'c',

    dynamicSelectOptions: [{
        text: "A1",
        value: 0
    }, {
        text: "A2",
        value: 1
    }],
    dynamicSelectDuplexValue: 0,

    change: function() {
        vm.staticDuplexValue = (vm.staticDuplexValue + 1) % 3;

        var dValues = ['a', 'b', 'c'];
        vm.dynamicOptDuplexValue = dValues[(dValues.indexOf(vm.dynamicOptDuplexValue) + 1) % 3];

        vm.dynamicSelectDuplexValue = (vm.dynamicSelectDuplexValue + 1) % 2;
    }
})