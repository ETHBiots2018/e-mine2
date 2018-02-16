App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Emine.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var EmineArtifact = data;
      App.contracts.Emine = TruffleContract(EmineArtifact);

      // Set the provider for our contract.
      App.contracts.Emine.setProvider(App.web3Provider);

      //return App.getBalances();

      return App.markManufactures();
    });

    return App.bindEvents();
  },

  markManufactures: function(manufactures, account) {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      $('#TTTransferAddress').val(account);

    });


    //var manufacturesInstance;
    /*
    App.contracts.Emine.deployed().then(function(instance) {
      emineInstance = instance;

      return emineInstance.getManufactures.call();
    }).then(function(manufactures) {
      for (i = 0; i < manufactures.length; i++) {
        if (manufactures[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    */

  },

  bindEvents: function() {
    $(document).on('click', '#createProductButton', App.handleCreateProduct);


  },

  handleCreateProduct: function(event) {
    event.preventDefault();

    //var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();
    var productId = $('#pid').val();

    console.log('Create product ' + productId + ' of ' + toAddress);


    var emineInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function(instance) {
        emineInstance = instance;

        return emineInstance.createProduct(productId);
      }).then(function(result) {
        console.log('Creation Successful!');
        return App.getProdacts();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getProducts: function() {
    console.log('Getting products...');

    var emineInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function(instance) {
        emineInstance = instance;

        return emineInstance.products;
        //return emineInstance.productOf(account);
      }).then(function(result) {
        //balance = result.c[0];
        console.log(result);
        //$('#TTBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
