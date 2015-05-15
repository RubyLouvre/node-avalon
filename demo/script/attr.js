var vm = avalon.define({
    $id: 'test',
    aaa: 'this is title',
    bbb: 'this is name',
    c1: 'c1value',
    c2: 'c2value',
    altMsg: '看不到图片',
    imgSrc: 'http://source.qunarzz.com/common/hf/logo.png',
    imgTitle: "qunar",
    hrefRouter: 'avalon',
    readonly: true,
    enabled: false,
    opt1Selected: true,
    opt2Selected: false,
    opt3Selected: true,
    opt4Selected: false,
    tabIndex: 0,
    colspan: 10,

    change: function() {
    	var randomNum = Math.random()

    	vm.aaa = 'this is title ' + randomNum
    	vm.bbb = 'this is name ' + randomNum
        vm.c1 = "c1-" + randomNum
        vm.c2 = "c2-" + randomNum
        vm.altMsg = '看不到图片' + randomNum
        vm.imgSrc = 'http://source.qunarzz.com/common/hf/logo.png?v=' + randomNum
        vm.imgTitle = "qunar" + randomNum
        vm.hrefRouter = "avalon" + randomNum
        vm.readonly = !vm.readonly
        vm.enabled = !vm.enabled
        vm.opt1Selected = !vm.opt1Selected;
        vm.opt2Selected = !vm.opt1Selected;
        vm.opt3Selected = !vm.opt2Selected;
        vm.opt4Selected = !vm.opt3Selected;
        vm.tabIndex++;
        vm.colspan++;
    }
})