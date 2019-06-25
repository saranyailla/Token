var testToken = artifacts.require("./Token.sol");

contract('Token',function (accounts) {
	it('initial total supply on deployment',function(){
		return testToken.deployed().then(function(instance){
			tokenInstance=instance;
			return tokenInstance.totalSupply();
		}).then(function (totalSupply) {
			assert.equal(totalSupply,'1000','checking if the intial totalSupply is equal to 1000');
		});
	});
})

