//var Owned = artifacts.require("Owned");
var EMineRewardToken = artifacts.require("EMineRewardToken");
var EMineLifecycleToken = artifacts.require("EMineLifecycleToken");
var RewardOracle = artifacts.require("RewardOracle");

module.exports = function(deployer) {

    deployer.deploy(RewardOracle);
    deployer.deploy(EMineLifecycleToken);
    deployer.deploy(EMineRewardToken);
};