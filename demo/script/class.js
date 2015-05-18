
var vm = avalon.define({
    $id: "test",
    w: 500,
    h: 200,
    bottom: true,
    num: "00",
    className: "点我",
    array: [],
    add: function () {
        console.log("add")
        vm.array.push(1)
    },
    remove: function () {
        vm.array.pop()
    },
    changeClassName: function () {
        vm.num = (100 * Math.random()).toFixed(0);
        vm.className = this.className
    }
})