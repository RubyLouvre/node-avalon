var vm = avalon.define({
    $id: "test",
    select0: "1",
    select1: "3",
    select2: "3",
    array: ["1", "2", "3", "4", "5", "6"],
    opt1Val: "1",
    opt2Val: "2",
    opt3Val: "3",
    opt4Val: "4",
    change: function () {
        vm.select0 = String(Math.floor(4 * Math.random()))
        vm.select1 = String(Math.floor(4 * Math.random()))

        vm.array.reverse()
    }
})