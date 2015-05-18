var vm = avalon.define({
    $id: "test",
    number: 111,
    number2: NaN,
    bool: false,
    bool2: true,
    nn: null,
    vv: void 0,
    change: function () {
        vm.number = Math.floor(Math.random() * 1000)
        vm.number2 = Math.floor(Math.random() *  900)
        vm.bool = !vm.bool
        vm.bool2 = !vm.bool2
    }
})