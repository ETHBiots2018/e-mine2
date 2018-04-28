App = {
  web3Provider: null,
  contracts: {},

  tokenStates: {
    0: "Available",
    1: "Returned",
    2: "Recycled"
  },

  UserType : { 
    0: "NotSet", 
    1: "Manufacturer", 
    2: "Shop",
    3: "Recycler" 
  },

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);

      web3.eth.getAccounts(function (error, accounts) {
        if (error || accounts.length == 0) {
          var b = document.getElementsByClassName('btn');
          if(b.length >= 2){
          b[0].setAttribute("href", "");
          b[0].setAttribute("disabled", "");
          b[1].setAttribute("href", "");
          b[1].setAttribute("disabled", "");}
          alert("No accounts detected, please unlock your account." );
        }
      });

      

    } else {
      // set the provider you want from Web3.providers
      //App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      //web3 = new Web3(App.web3Provider);

      var b = document.getElementsByClassName('btn');
      if(b.length >= 2){
      b[0].setAttribute("href", "");
      b[0].setAttribute("disabled", "");
      b[1].setAttribute("href", "");
      b[1].setAttribute("disabled", "");}
      alert("No web3 provider detected, please use a provider such as Metamask to start." );
    }

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('../build/contracts/EMine.json', function (data) {
      var EmineArtifact = data;
      App.contracts.Emine = TruffleContract(EmineArtifact);
      App.contracts.Emine.setProvider(App.web3Provider);
    });

    $.getJSON('../build/contracts/RewardOracle.json', function (data) {
      var RewardOracleArtifact = data;
      App.contracts.RewardOracle = TruffleContract(RewardOracleArtifact);
      App.contracts.RewardOracle.setProvider(App.web3Provider);
    });

    $.getJSON('../build/contracts/EMineLifecycleToken.json', function (data) {
      var EMineLifecycleTokenArtifact = data;
      App.contracts.EMineLifecycleToken = TruffleContract(EMineLifecycleTokenArtifact);
      App.contracts.EMineLifecycleToken.setProvider(App.web3Provider);
    });

    $.getJSON('../build/contracts/EMineRewardToken.json', function (data) {
      var EMineRewardTokenArtifact = data;
      App.contracts.EMineRewardToken = TruffleContract(EMineRewardTokenArtifact);
      App.contracts.EMineRewardToken.setProvider(App.web3Provider);


    }).then(function (result) {
      App.markManufacturers();
      if (document.getElementById("ItemListManufacturer")) App.getProducts();
      if (document.getElementById("ItemListShop")) App.getProductsShop();
      if (document.getElementById("EMineRewardTokenBalance")) App.getRewardTokenAmount();
      if (document.getElementById("ItemListCustomer")) App.getProductsCustomer();
      if (window.location.href.endsWith('recycler.html')) App.checkAccount(3);
      if (window.location.href.endsWith('manufacturer.html')) App.checkAccount(1);
      if (window.location.href.endsWith('shop.html')) App.checkAccount(2);

    });


    return App.bindEvents();
  },

  markManufacturers: function (manufactures, account) {

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      if (document.getElementById("qrcodeaddress")) {

        $("#qrcodeaddress").html(App.htmlToElement(
          account

        ));
      }

      $('#TTTransferAddress').val(account);

    });

  },

  bindEvents: function () {
    $(document).on('click', '#createProductButton', App.handleCreateProduct);
    $(document).on('click', '#addAccountButton', App.handleAddAccount);
    $(document).on('click', '#returnProductButton', App.handleReturnProduct);
    $(document).on('click', '#recycleProductButton', App.handleRecycleProduct);


  },

  handleAddAccount: function (event) {
    event.preventDefault();

    var addressToBeAdded = $('#ChangeAddress').val();
    var addressType = $('#AddressType').val();

    console.log("Going to get address: " + addressToBeAdded + "as " + addressType);
    var emineInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function (instance) {
        emineInstance = instance;
        if (addressType === "Recycler") return emineInstance.addRecycler(addressToBeAdded);
        else if (addressType === "Manufacturer") return emineInstance.addManufacturer(addressToBeAdded);
        else if (addressType === "Shop") return emineInstance.addShop(addressToBeAdded);
        else console.log(addressType + " is not a valid type.");

      }).then(function (result) {
        console.log("Added account!");
      }).catch(function (err) {
        console.log(err.message);
      });
    });

  },

  handleReturnProduct: function (event) {
    event.preventDefault();

    var toAddress = $('#ReturnerAddress').val();
    var productId = $('#ProductId').val();


    console.log('Return product ' + productId + ' of ' + toAddress);
    var emineInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function (instance) {
        emineInstance = instance;
        return emineInstance.returnProduct(productId, toAddress);

      }).then(function (result) {
        console.log("Returned Product!");
      }).catch(function (err) {
        console.log(err.message);
      });
    });

  },

  handleRecycleProduct: function (event) {

    event.preventDefault();

    var toAddress = $('#RecyclerAddress').val();
    var productId = $('#ProductId').val();


    console.log('Recycle product ' + productId + ' of ' + toAddress);
    var emineInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function (instance) {
        emineInstance = instance;
        return emineInstance.recycleProduct(productId, toAddress);

      }).then(function (result) {
        console.log("Returned Product!");
      }).catch(function (err) {
        console.log(err.message);
      });
    });

  },

  handleCreateProduct: function (event) {
    event.preventDefault();

    var toAddress = $('#TTTransferAddress').val();
    var productId = $('#pid').val();
    var additionalMetadata = JSON.parse($('#exampleFormControlTextarea1').val());

    console.log('Create product ' + productId + ' of ' + toAddress);

    var msg = {};

    msg.toAddress = toAddress;
    msg.productId = productId;
    msg.additionalMetadata = additionalMetadata;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(msg),
      contentType: 'application/json',
      url: '/files/upload',
      success: function (res) {
        console.log('Upload request taken by server');
        console.log(JSON.stringify(res));

        var emineInstance;

        web3.eth.getAccounts(function (error, accounts) {
          if (error) {
            console.log(error);
          }

          var account = accounts[0];

          App.contracts.Emine.deployed().then(function (instance) {
            emineInstance = instance;

            return emineInstance.createProduct(res);
          }).then(function (result) {
            console.log('Creation Successful!');
          }).catch(function (err) {
            console.log(err.message);
          });
        });
      }
    });
  },

  handleProductClick: function (tokenMetadataAddress) {

    console.log('handleProductClick called!');

    $.ajax({
      type: 'GET',
      url: '/files/get/' + tokenMetadataAddress,
      success: function (res) {
        console.log('Upload request taken by server');
        console.log(res);
        tok = JSON.stringify(JSON.parse(res), undefined, 2);


        $("#ProductView").html(App.htmlToElement(

          '<pre align="left">Token Metadata:<br\><br\>' + tok + '</pre>'


        ));
      }
    });
  },

  checkAccount(userTypeWanted){

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Emine.deployed().then(function (emineInstance) {

        emineInstance.userType(account).then(function (userType) {
            if(userType != userTypeWanted){
              var b = document.getElementsByClassName('btn');
              if(b.length >= 2){
              b[0].setAttribute("href", "");
              b[0].setAttribute("disabled", "");
              b[1].setAttribute("href", "");
              b[1].setAttribute("disabled", "");}
              alert("Address: "+ account + " is not a " + App.UserType[userTypeWanted] + " address, please use Admin panel to give authorization" );
            }

        })
      });
    });

  },

  getRewardTokenAmount() {

    console.log('getRewardTokenAmount called');

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.EMineRewardToken.deployed().then(function (emineRewardInstance) {

        emineRewardInstance.balanceOf(account).then(function (accountBalance) {
          $("#EMineRewardTokenBalance").html(App.htmlToElement('My Token Balance: ' + accountBalance));

        })
      });
    });

  },

  getProductsCustomer() {

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log('Getting products of the %s from the blockchain.', account);

      App.contracts.EMineLifecycleToken.deployed().then(function (emineLifecycleInstance) {
        App.contracts.Emine.deployed().then(function (emineInstance) {
          App.contracts.RewardOracle.deployed().then(function (rewardOracleInstance) {

          rewardOracleInstance.getReturnerArrayLength(account).then(function (accountCount) {
            console.log('Returner %s has returned %s tokens.', account, accountCount.c[0]);

            for (i = 0; i < accountCount; i++) {
              rewardOracleInstance.returnerTokens(account, i).then(function (tokenID) {

                var tokenMetadata = emineLifecycleInstance.tokenURI(tokenID);
                var tokenState = emineLifecycleInstance.tokenState(tokenID);

                Promise.all([tokenMetadata, tokenState]).then(function (values) {

                  document.getElementById("ItemListCustomer").append(App.htmlToElement(

                    '<a href="#" class="list-group-item" data-percentage=' + tokenID.c[0] + '>\
                  <h4 class="list-group-item-heading">Token ' + tokenID.c[0] + '</h4>\
                  <p class="list-group-item-text">State:' + App.tokenStates[values[1].c[0]] + '</p>\
                  <p class="list-group-item-text metadata">Token Metadata Address: ' + values[0] + '</p>\
                  <input type="hidden" metadataAddress='+ values[0] + '/>\
                  </a>'


                  ));

                  var $wrapper = $('.list-group');
                  $wrapper.find('.list-group-item').sort(function (a, b) {
                    return +a.dataset.percentage - +b.dataset.percentage;
                  }).appendTo($wrapper);


                  $('.list-group-item').off('click');
                  $('.list-group-item').click(function (e) {

                    console.log('Click!');
                    e.preventDefault();
                    $that = $(this);
                    $('.list-group').find('a').removeClass('active');
                    $that.addClass('active');

                    App.handleProductClick($that.find('input').attr("metadataAddress"));
                  });

                });



              });

            }

          });
        });
        });
      });
    });
  },

  getProductsShop() {

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log('Getting products of the %s from the blockchain.', account);

      App.contracts.EMineLifecycleToken.deployed().then(function (emineLifecycleInstance) {
        App.contracts.Emine.deployed().then(function (emineInstance) {

          App.contracts.EMineRewardToken.deployed().then(function (emineRewardInstance) {

            emineRewardInstance.balanceOf(account).then(function (accountBalance) {
              $("#EMineRewardTokenBalance").html(App.htmlToElement('My Token Balance: ' + accountBalance));

            })
          });

          emineInstance.getProductArrayLength(account).then(function (accountCount) {
            console.log('Returner %s has returned %s tokens.', account, accountCount.c[0]);

            for (i = 0; i < accountCount; i++) {
              emineInstance.products(account, i).then(function (tokenID) {

                var tokenMetadata = emineLifecycleInstance.tokenURI(tokenID);
                var tokenState = emineLifecycleInstance.tokenState(tokenID);

                Promise.all([tokenMetadata, tokenState]).then(function (values) {

                  document.getElementById("ItemListShop").append(App.htmlToElement(

                    '<a href="#" class="list-group-item" data-percentage=' + tokenID.c[0] + '>\
                  <h4 class="list-group-item-heading">Token ' + tokenID.c[0] + '</h4>\
                  <p class="list-group-item-text">State:' + App.tokenStates[values[1].c[0]] + '</p>\
                  <p class="list-group-item-text metadata">Token Metadata Address: ' + values[0] + '</p>\
                  <input type="hidden" metadataAddress='+ values[0] + '/>\
                  </a>'


                  ));

                  var $wrapper = $('.list-group');
                  $wrapper.find('.list-group-item').sort(function (a, b) {
                    return +a.dataset.percentage - +b.dataset.percentage;
                  }).appendTo($wrapper);


                  $('.list-group-item').off('click');
                  $('.list-group-item').click(function (e) {

                    console.log('Click!');
                    e.preventDefault();
                    $that = $(this);
                    $('.list-group').find('a').removeClass('active');
                    $that.addClass('active');

                    App.handleProductClick($that.find('input').attr("metadataAddress"));
                  });

                });



              });

            }

          });
        });
      });
    });
  },


  getProducts: function () {

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log('Getting products of the %s from the blockchain.', account);


      App.contracts.EMineLifecycleToken.deployed().then(function (instance) {
        emineLifecycleInstance = instance;


        emineLifecycleInstance.balanceOf(account).then(function (accountCount) {
          console.log('%s has %s tokens.', account, accountCount.c[0]);

          for (i = 0; i < accountCount; i++) {
            emineLifecycleInstance.tokenOfOwnerByIndex(account, i).then(function (tokenID) {

              var tokenMetadata = emineLifecycleInstance.tokenURI(tokenID);
              var tokenState = emineLifecycleInstance.tokenState(tokenID);

              Promise.all([tokenMetadata, tokenState]).then(function (values) {

                document.getElementById("ItemListManufacturer").append(App.htmlToElement(

                  '<a href="#" class="list-group-item" data-percentage=' + tokenID.c[0] + '>\
                  <h4 class="list-group-item-heading">Token ' + tokenID.c[0] + '</h4>\
                  <p class="list-group-item-text">State:' + App.tokenStates[values[1].c[0]] + '</p>\
                  <p class="list-group-item-text metadata">Token Metadata Address: ' + values[0] + '</p>\
                  <input type="hidden" metadataAddress='+ values[0] + '/>\
                  </a>'


                ));

                var $wrapper = $('.list-group');
                $wrapper.find('.list-group-item').sort(function (a, b) {
                  return +a.dataset.percentage - +b.dataset.percentage;
                }).appendTo($wrapper);


                $('.list-group-item').off('click');
                $('.list-group-item').click(function (e) {

                  console.log('Click!');
                  e.preventDefault();
                  $that = $(this);
                  $('.list-group').find('a').removeClass('active');
                  $that.addClass('active');

                  App.handleProductClick($that.find('input').attr("metadataAddress"));
                });

              });



            });

          }

        });
      });
    });
  },

  htmlToElement: function (html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }
};

$(window).load(function () {
  App.init();


});