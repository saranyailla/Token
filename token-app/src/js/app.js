App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  minter:null,
  url:'http://127.0.0.1:7545',
  currentAccount:null,
  transaction:0,
  flag:false,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);
    App.populateAddress();

    return App.initContract();
  },

  initContract: function() {
      $.getJSON('Token.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
        var tokenArtifact = data;
        App.contracts.Token = TruffleContract(tokenArtifact);

    // Set the provider for our contract
        App.contracts.Token.setProvider(App.web3Provider);
        App.getMinter();
        App.currentAccount = web3.eth.coinbase;
        jQuery('#current_account').text(web3.eth.coinbase);
        // jQuery('#curr_account').text(web3.eth.coinbase);
        App.handleBalance();
        return App.bindEvents();
      });
  },

  bindEvents: function() {

    $(document).on('click', '#create_money', function(){ App.handleMint(jQuery('#enter_create_address').val(),jQuery('#create_amount').val()); });
    $(document).on('click', '#send_money', function(){ App.handleTransfer(jQuery('#enter_send_address').val(),jQuery('#send_amount').val()); });
    // $(document).on('click', '#balance', function(){ App.handleBalance(); });
  },


  populateAddress : function(){ 
 
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_create_address').append(optionElement);
          if(web3.eth.coinbase != accounts[i]){
            jQuery('#enter_send_address').append(optionElement);  
          }
      });
    });
  },

  getMinter : function(){
    App.contracts.Token.deployed().then(function(instance) {
      return instance.minter();
    }).then(function(result) {
      App.minter = result;
      jQuery('#minter').text(result);
      if(App.minter != App.currentAccount){
        jQuery('#create_token').css('display','none');
        jQuery('#send_token').css('width','50%');
        jQuery('#balance_token').css('width','50%');
      }else{
        jQuery('#create_token').css('display','block');
        jQuery('#send_token').css('width','30%');
        jQuery('#balance_token').css('width','30%');
      }
    })
  },

  handleMint: function(addr,value){

      if(App.currentAccount != App.minter){
        bootbox.alert("Not Authorised to create token");
        return false;
      }
      if(addr==''){
        bootbox.alert('Please choose a Mint To Address');
        return false;
      }
      if( value=='' || value<=0){
        bootbox.alert('Please enter a valid minting amount');
        return false;
      }
      var tokenInstance;
      App.contracts.Token.deployed().then(function(instance) {
        tokenInstance = instance;
        console.log(addr);
        console.log(value);

        return tokenInstance.mint(addr,value);
     
      }).then( function(result){
        if(result.receipt.status == '0x1')
        {
          bootbox.alert(value +" tokens created successfully to "+addr);
          App.handleBalance();
        }
        else
          bootbox.alert("Failed to mint");
      }).catch( function(err){
        console.log(err.message);
      })
  },


  handleTransfer: function(addr,value) {

    if(addr == ""){
      bootbox.alert("Please choose the receiver's adrdess");
      return false;
    }
    if(value == "" || value<=0){
      bootbox.alert("Please enter a valid amount");
      return false;
    }

    var tokenInstance;
    App.contracts.Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.transfer(addr,value);
    }).then( function(result){
        
      if(result.receipt.status != '0x1'){
          bootbox.alert("Transfer failed");
        }
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];
        var singularText = "tokens were";
        if(log.args.amount == 1){
          singularText = "token was";
        }
        
        // Look for the event Transfer
        // Notification 
        if (log.event == "Transfer") {
          var text = 'Token transfer: ' + log.args.amount + " " +singularText + 
              ' sent from ' + log.args.from +
              ' to ' + log.args.to + '.';
          jQuery('#showmessage_text').html(text);
          jQuery('#show_event').animate({'left':'10px'});
          setTimeout(function(){jQuery('#show_event').animate({'left':'-410px'},500)}, 15000);
          App.handleBalance();
          break;
        }
      }
      return tokenInstance.balances(App.currentAccount);
    }).catch( function(err){
      if(err.message.indexOf('insufficient')!= -1){
        bootbox.alert('Insufficient tokens. Please mint to get tokens.');
        return false;
      }
    })
  },

  handleBalance : function(){
    App.contracts.Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.balances(App.currentAccount);
    }).then(function(result) {
      jQuery('#display_balance').text(result);
    })
  }
};


$(function() {
  $(window).load(function() {
    App.init();
    console.log('starting app.js');
  });
});
