describe("Attribute binding - First Screen Test", function () {
    var vm = avalon.vmodels.test;
    it("ms-class-binding", function (){
        expect(document.getElementById('classCase1').getAttribute('class')).to.be(vm.c1);
        expect(document.getElementById('classCase2').getAttribute('class')).to.be(vm.c1);
        expect(document.getElementById('classCase3').getAttribute('class')).to.be([vm.c1, vm.c2].join(' '));
    })


    it("ms-value-binding", function (){
        expect(document.getElementById('valueCase1').value).to.be(vm.c1);
        expect(document.getElementById('valueCase2').value).to.be(vm.c1);
        expect(document.getElementById('valueCase3').value).to.be(vm.c1);

        
        var tempC1 = vm.c1;
        vm.c1 = vm.c1 + '1',
        expect(document.getElementById('valueCase1').value).to.be(vm.c1);
        expect(document.getElementById('valueCase2').value).to.be(vm.c1);
        expect(document.getElementById('valueCase3').value).to.be(vm.c1);
        vm.c1 = tempC1;
    })
});