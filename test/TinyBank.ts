import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let managers: string[];
  let myTokenC: MyToken;
  let tinyBankC: TinyBank;
  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    managers = [
      signers[1].address,
      signers[2].address,
      signers[3].address,
      signers[4].address,
      signers[5].address,
    ];
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
      // managers,
    ]);
    myTokenC.setManager(tinyBankC.getAddress());
  });

  describe("Initialized stake check", () => {
    it("should return totalStake 0", async () => {
      expect(await tinyBankC.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("Staking", async () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await expect(tinyBankC.stake(stakingAmount))
        .to.emit(tinyBankC, "Staked")
        .withArgs(signer0.address, stakingAmount);
      expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
      expect(await tinyBankC.totalStaked()).equal(stakingAmount);
      expect(await myTokenC.balanceOf(tinyBankC)).equal(
        await tinyBankC.totalStaked()
      );
    });
  });

  describe("Withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);
      await expect(tinyBankC.withdraw(stakingAmount))
        .to.emit(tinyBankC, "Withdraw")
        .withArgs(stakingAmount, signer0.address);
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("reward", () => {
    it("should reward 1 MT every blocks", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);

      const BLOCKS = 5n;
      const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
      for (var i = 0; i < BLOCKS; i++) {
        await myTokenC.transfer(transferAmount, signer0.address);
      }

      await tinyBankC.withdraw(stakingAmount);
      expect(await myTokenC.balanceOf(signer0.address)).equal(
        hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString())
      );
    });

    it("should revert when changing rewardPerBlock by hacker", async () => {
      const hacker = signers[10];
      const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
      await expect(
        tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange)
      ).to.be.revertedWith("You are not authorized to manage this contract"); // Not all confirmed yet
    });
  });

  // describe("assignment 3", () => {
  //  it("onlyAllConfirmed", async () => {
  //    const rewardToSet = hre.ethers.parseUnits("5", DECIMALS);

  //    for (let i = 0; i < 3; i++) {
  //      await tinyBankC.connect(signers[i + 1]).confirm();
  //    }

  //    await expect(tinyBankC.setRewardPerBlock(rewardToSet)).to.be.revertedWith(
  //      "Not all confirmed yet"
  //    );
  //  });
  //});

  // it("should revert when non-manager confirm", async () => {
  //   await expect(tinyBankC.connect(signers[10]).confirm()).to.be.revertedWith(
  //     "You are not a manager"
  //   );
  // });
});
