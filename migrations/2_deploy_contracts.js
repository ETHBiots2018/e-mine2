//var Owned = artifacts.require("Owned");
var EMineRewardToken = artifacts.require("EMineRewardToken");
var Emine = artifacts.require("Emine");

module.exports = function(deployer) {

  // Deploy A, then deploy B, passing in A's newly deployed address
  deployer.deploy(EMineRewardToken).then(function() {
    return deployer.deploy(Emine, EMineRewardToken.address);
  });

};