const { ethers } = require("hardhat");
const { expect } = require("chai");


describe('UserWallet', function () {
    let owner;
    let receiver;
    let userWallet;

    beforeEach(async function () {
        [owner, receiver] = await ethers.getSigners();
        const UserWallet = await ethers.getContractFactory("UserWallet", owner);
        userWallet = await UserWallet.deploy({ value: ethers.utils.parseUnits("100", 'ether') });
        await userWallet.deployed();
    });


})