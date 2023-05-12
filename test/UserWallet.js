const { ethers } = require("hardhat");
const { expect } = require("chai");


describe('UserWallet', function () {
    let userEOA;
    let vitacoreEOA;
    let userWallet;

    beforeEach(async function () {
        [userEOA, vitacoreEOA] = await ethers.getSigners();
        const UserWallet = await ethers.getContractFactory("UserWallet", vitacoreEOA);
        userWallet = await UserWallet.deploy(userEOA.address);
        await userWallet.deployed();
    });

    it('should allow to recive and send payments', async () => {

        await vitacoreEOA.sendTransaction({
            to: userWallet.address,
            value: ethers.utils.parseEther("10.0")
        });

        const amount = ethers.utils.parseUnits("2", 'ether')
        const nonce = 1

        const hash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address"],
            [vitacoreEOA.address, amount, nonce, userWallet.address])

        const messageHashBin = ethers.utils.arrayify(hash)

        const signature = await userEOA.signMessage(messageHashBin)

        console.log('contract balance start', ethers.utils.formatEther(await ethers.provider.getBalance(userWallet.address)))
        console.log('userEOA balance start', ethers.utils.formatEther(await ethers.provider.getBalance(userEOA.address)))
        console.log('vitacoreEOA balance start', ethers.utils.formatEther(await ethers.provider.getBalance(vitacoreEOA.address)))

        const tx = await userWallet.connect(vitacoreEOA).withdrawEth(amount, nonce, signature)
        tx.wait();

        await expect(tx).to.changeEtherBalance(vitacoreEOA, amount)

        console.log('contract balance end', ethers.utils.formatEther(await ethers.provider.getBalance(userWallet.address)))
        console.log('userEOA balance end', ethers.utils.formatEther(await ethers.provider.getBalance(userEOA.address)))
        console.log('vitacoreEOA balance end', ethers.utils.formatEther(await ethers.provider.getBalance(vitacoreEOA.address)))
    })
})