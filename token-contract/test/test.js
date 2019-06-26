let Token = artifacts.require("./Token.sol");

let tokenInstance;

let tokens = [100, 200, 300, 400];
let token_to_send = [10, 20, 30, 40];
contract('TokenContract', function (accounts) {
  //accounts[0] is the default account
  //Test case 1
  it("contract deployment", function() {
    return Token.deployed().then(function (instance) {
      tokenInstance = instance;
      assert(tokenInstance !== undefined, 'Token contract should be defined');
    });
  });

	it("should create money", function() {
    return tokenInstance.mint(accounts[1], tokens[0]).then(function (result) {
      assert.equal('0x01', result.receipt.status, 'valid token creation');
			return tokenInstance.mint(accounts[2], tokens[1])
    }).then(function(result) {
			assert.equal('0x01', result.receipt.status, 'valid token creation');
			return tokenInstance.mint(accounts[3], tokens[2])
		}).then(function(result) {
			assert.equal('0x01', result.receipt.status, 'valid token creation');
		});
  });

	it("should transfer money", function() {
		return tokenInstance.transfer(accounts[3], token_to_send[0], {from: accounts[1]}).then(function (result) {
			assert.equal('0x01', result.receipt.status, 'transfer is done');
			return tokenInstance.balances(accounts[1]);
		}).then(function(result) {
			assert.equal(tokens[0] - token_to_send[0], result.toNumber(), 'money tally is correct');
			return tokenInstance.balances(accounts[3]);
		}).then(function(result) {
			assert.equal(tokens[2] + token_to_send[0], result.toNumber(), 'money tally is correct');
		});
	});

	it("should NOT create money", function() {
    return tokenInstance.mint(accounts[1], token_to_send[0], {from: accounts[1]}).then(function (result) {
      throw("modifer not working");
    }).catch(function (e) {
      if(e === "modifer not working") {
        assert(false);
      } else {
        assert(true);
      }
    })
  });

	it("should NOT transfer money", function() {
		return tokenInstance.transfer(accounts[3], tokens[0], {from: accounts[1]}).then(function (result) {
      throw("modifer not working");
    }).catch(function (e) {
      if(e === "modifer not working") {
        assert(false);
      } else {
        assert(true);
      }
    })
  });
});
