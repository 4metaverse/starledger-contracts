import assert from "assert";
import { ethers } from "hardhat";

describe("StarLedgerNFT", function () {
  it("Should mint NFT", async function () {
    const [ownerAddr] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    const star = await starLedgerNFT.getStar(1);

    assert.strictEqual(star.owner, ownerAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to mail non-unique NFT", async function () {
    const [ownerAddr] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    try {
      await starLedgerNFT.mintStar(
        1,
        ownerAddr.address,
        "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
      );

      assert.fail("should throw error");
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        `VM Exception while processing transaction: reverted with reason string 'ERC721: token already minted'`
      );
    }
  });

  it("Should buy NFT", async function () {
    const [ownerAddr, addr2] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    const star = await starLedgerNFT.getStar(1);

    assert.strictEqual(star.owner, addr2.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to buy NFT with insufficient funds", async function () {
    const [ownerAddr, addr2] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    try {
      await starLedgerNFT.connect(addr2).buyStar(1, { value: 1 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'Insufficient value.'"
      );
    }
  });

  it("Should fail to buy NFT that was already sold", async function () {
    const [ownerAddr, addr2, addr3] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    try {
      await starLedgerNFT.connect(addr3).buyStar(1, { value: 2 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'Star already sold.'"
      );
    }
  });

  it("Should fail to buy NFT that sender already owns", async function () {
    const [ownerAddr, addr2, addr3] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    try {
      await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'You already own this star.'"
      );
    }
  });

  it("Should sell NFT", async function () {
    const [ownerAddr, addr2] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    await starLedgerNFT.connect(addr2).sellStar(1, 20);

    const star = await starLedgerNFT.getStar(1);

    assert.strictEqual(star.owner, addr2.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("20")._hex);
  });

  it("Should buy NFT that was listed for sale", async function () {
    const [ownerAddr, addr2, addr3] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    await starLedgerNFT.connect(addr2).sellStar(1, 20);

    await starLedgerNFT.connect(addr3).buyStar(1, { value: 20 });

    const star = await starLedgerNFT.getStar(1);

    assert.strictEqual(star.owner, addr3.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to buy NFT that was listed for sale with insufficient funds", async function () {
    const [ownerAddr, addr2, addr3] = await ethers.getSigners();

    const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");
    const starLedgerNFT = await StarLedgerNFT.deploy();
    await starLedgerNFT.deployed();

    await starLedgerNFT.mintStar(
      1,
      ownerAddr.address,
      "ipfs://QmSyxrHn6aVWnuhLCr4G9mjmFhM2eC8hR1wtRfymPKV31N"
    );

    await starLedgerNFT.connect(addr2).buyStar(1, { value: 2 });

    await starLedgerNFT.connect(addr2).sellStar(1, 20);

    try {
      await starLedgerNFT.connect(addr3).buyStar(1, { value: 2 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'Insufficient value.'"
      );
    }
  });
});
