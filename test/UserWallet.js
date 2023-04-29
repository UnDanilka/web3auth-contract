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

    it('should allow to recive and send payments', async () => {
        const amount = ethers.utils.parseUnits("2", 'ether')
        const nonce = 1

        const hash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address"],
            [receiver.address, amount, nonce, userWallet.address])


        console.log('hash', hash)

        const messageHashBin = ethers.utils.arrayify(hash)

        console.log('messageHashBin', messageHashBin)

        const signature = await owner.signMessage(messageHashBin)

        console.log('signature', signature)

        console.log('contract balance start', ethers.utils.formatEther(await ethers.provider.getBalance(userWallet.address)))
        console.log('owner balance start', ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)))
        console.log('receiver balance start', ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address)))

        const tx = await userWallet.connect(receiver).withdrawEth(amount, nonce, signature)
        tx.wait();

        await expect(tx).to.changeEtherBalance(receiver, amount)

        console.log('contract balance end', ethers.utils.formatEther(await ethers.provider.getBalance(userWallet.address)))
        console.log('owner balance end', ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)))
        console.log('receiver balance end', ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address)))
    })
})