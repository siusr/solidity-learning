import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimals = 18n;

describe("My Token", () => {
  let myTokenC: MyToken;
  let signers: HardhatEthersSigner[];
  beforeEach("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
      100,
    ]);
  });
  describe("Basic state value check", () => {
    it("should return name", async () => {
      expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
      expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
      expect(await myTokenC.decimals()).equal(decimals);
    });
    it("should return 100 totalSupply", async () => {
      expect(await myTokenC.totalSupply()).equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  // 1 MT = 1 * 10^18
  describe("Mint", () => {
    it("should return 1 MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await myTokenC.balanceOf(signer0)).equal(
        mintingAmount * 10n ** decimals
      );
    });
  });

  describe("Transfer", () => {
    it("should have 0.5 MT", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits("0.5", decimals),
          signer1.address
        )
      )
        .to.emit(myTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", decimals)
        );
      expect(await myTokenC.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", decimals)
      );

      const filter = myTokenC.filters.Transfer(signer0.address);
      const logs = await myTokenC.queryFilter(filter, 0, "latest");
      console.log(logs.length);

      console.log(logs[0].args.from);
      console.log(logs[0].args.to);
      console.log(logs[0].args.value);
    });
    it("should be reverted with insufficient balace error", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimals),
          signer1.address
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });
});
