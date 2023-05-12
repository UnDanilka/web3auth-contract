const { ethers } = require("hardhat");
const { expect } = require("chai");


describe('UserWallet', function () {
    let userEOA;
    let vitacoreEOA;
    let userWalletContract;
    let vita20Contract;

    beforeEach(async function () {
        [userEOA, vitacoreEOA] = await ethers.getSigners();
        const UserWalletContract = await ethers.getContractFactory("UserWallet", vitacoreEOA);
        userWalletContract = await UserWalletContract.deploy(userEOA.address);
        await userWalletContract.deployed();

        const Vita20Contract = await ethers.getContractFactory("Vita20", vitacoreEOA);
        vita20Contract = await Vita20Contract.deploy();
        await vita20Contract.deployed();
    });

    it('UserWallet should allow to recive and send ethers', async () => {

        await vitacoreEOA.sendTransaction({
            to: userWalletContract.address,
            value: ethers.utils.parseEther("10.0")
        });

        const amount = ethers.utils.parseUnits("2", 'ether')
        const nonce = 1

        const hash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address"],
            [vitacoreEOA.address, amount, nonce, userWalletContract.address])

        const messageHashBin = ethers.utils.arrayify(hash)

        const signature = await userEOA.signMessage(messageHashBin)

        console.log('contract balance eth start', ethers.utils.formatEther(await ethers.provider.getBalance(userWalletContract.address)))
        console.log('userEOA balance eth start', ethers.utils.formatEther(await ethers.provider.getBalance(userEOA.address)))
        console.log('vitacoreEOA balance eth start', ethers.utils.formatEther(await ethers.provider.getBalance(vitacoreEOA.address)))

        const tx = await userWalletContract.withdrawEth(amount, nonce, signature)
        tx.wait();

        await expect(tx).to.changeEtherBalance(vitacoreEOA, amount)

        console.log('contract balance eth end', ethers.utils.formatEther(await ethers.provider.getBalance(userWalletContract.address)))
        console.log('userEOA balance eth end', ethers.utils.formatEther(await ethers.provider.getBalance(userEOA.address)))
        console.log('vitacoreEOA balance eth end', ethers.utils.formatEther(await ethers.provider.getBalance(vitacoreEOA.address)))
    })
    it('UserWallet should allow to recive and send Vita20', async () => {
        await vita20Contract.mint(userWalletContract.address, 500);


        const amount = 100
        const nonce = 1

        const hash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "address"],
            [vitacoreEOA.address, amount, nonce, userWalletContract.address])

        const messageHashBin = ethers.utils.arrayify(hash)

        const signature = await userEOA.signMessage(messageHashBin)

        console.log('contract balance vft start', await vita20Contract.balanceOf(userWalletContract.address))
        console.log('userEOA balance vft start', await vita20Contract.balanceOf(userEOA.address))
        console.log('vitacoreEOA balance vft start', await vita20Contract.balanceOf(vitacoreEOA.address))


        const tx = await userWalletContract.withdrawToken(vita20Contract.address, amount, nonce, signature)
        tx.wait();

        await expect(await vita20Contract.balanceOf(userWalletContract.address)).to.equal(400)

        console.log('contract balance vft end', await vita20Contract.balanceOf(userWalletContract.address))
        console.log('userEOA balance vft end', await vita20Contract.balanceOf(userEOA.address))
        console.log('vitacoreEOA balance vft end', await vita20Contract.balanceOf(vitacoreEOA.address))

    })
})