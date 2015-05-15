var vm = avalon.define({
    $id: 'test',
    toggle: true,
    table: true,
    tr: true,
    td: true,
    change: function () {
        vm.toggle = !vm.toggle

    }
})


