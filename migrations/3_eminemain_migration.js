var EMineRewardToken = artifacts.require("EMineRewardToken");
var EMine = artifacts.require("EMine");
var EMineLifecycleToken = artifacts.require("EMineLifecycleToken");
var RewardOracle = artifacts.require("RewardOracle");

module.exports = function(deployer) {

  deployer.deploy(EMine, EMineRewardToken.address, EMineLifecycleToken.address, RewardOracle.address).then(function() {

            EMineRewardToken.deployed().then(function(instance) {
                instance.transferOwnership(EMine.address);
            });

            EMineLifecycleToken.deployed().then(function(instance) {
                instance.transferOwnership(EMine.address);
            });

            RewardOracle.deployed().then(function(instance) {
                instance.setEMineContract(EMine.address);
                instance.fundOracle({value: 1000000000000000000});
            });
        });
}
