import assert from "assert";
import { ethers } from "hardhat";

const MarketState = {
  offline: ethers.BigNumber.from("0"),
  online: ethers.BigNumber.from("1"),
};

const MintState = {
  pending: ethers.BigNumber.from("0"),
  presale: ethers.BigNumber.from("1"),
  minting: ethers.BigNumber.from("2"),
  complete: ethers.BigNumber.from("3"),
};

describe("StarLedgerNFT", function () {
  it("Should mint NFT as owner during presale", async function () {
    const [ownerAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);

    await contract.updateMintState(MintState.presale);

    await contract.mintStars(1, {
      value: 1,
    });

    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, ownerAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should mint NFT as member during presale", async function () {
    const [ownerAddr, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.presale);
    await contract.addPioneer(memberAddr.address);

    await contract.connect(memberAddr).mintStars(1, {
      value: 1,
    });

    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, memberAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to mint NFT as member during presale if not pioneer", async function () {
    const [ownerAddr, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.presale);

    try {
      await contract.mintStars(1, {
        value: 1,
      });
    } catch (error: any) {
      assert.strictEqual(
        error.message,
        `VM Exception while processing transaction: reverted with reason string 'Minting is not available.'`
      );
    }
  });

  it("Should mint NFT as owner during minting", async function () {
    const [ownerAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);

    await contract.updateMintState(MintState.minting);

    await contract.mintStars(1, {
      value: 1,
    });

    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, ownerAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should mint NFT as member during minting", async function () {
    const [ownerAddr, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.minting);

    await contract.connect(memberAddr).mintStars(1, {
      value: 1,
    });

    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, memberAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to mint NFT as owner before presale", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.pending);

    try {
      await contract.mintStars(1, {
        value: 1,
      });
    } catch (error: any) {
      assert.strictEqual(
        error.message,
        `VM Exception while processing transaction: reverted with reason string 'Minting is not available.'`
      );
    }
  });

  it("Should fail to mint NFT as member before presale", async function () {
    const [_, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.pending);

    try {
      await contract.connect(memberAddr).mintStars(1, {
        value: 1,
      });
    } catch (error: any) {
      assert.strictEqual(
        error.message,
        `VM Exception while processing transaction: reverted with reason string 'Minting is not available.'`
      );
    }
  });

  it("Should fail to mint NFT with insufficient funds", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.updateMintFee(2);

    try {
      await contract.mintStars(1, {
        value: 1,
      });

      assert.fail("should throw error");
    } catch (error: any) {
      assert.strictEqual(
        error.message,
        `VM Exception while processing transaction: reverted with reason string 'Insuffient amount.'`
      );
    }
  });

  it("Should mint NFT if fee goes back down", async function () {
    const [ownerAddr, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
      {
        id: 3,
        tokenUri: "ipfs://c",
      },
      {
        id: 4,
        tokenUri: "ipfs://d",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.updateMintFee(2);
    await contract.updateMintFee(1);

    await contract.mintStars(1, {
      value: 1,
    });

    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, ownerAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to add existing NFT by id", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
    ]);

    try {
      await contract.addStars([
        {
          id: 1,
          tokenUri: "ipfs://b",
        },
      ]);

      assert.fail("should throw error");
    } catch (error: any) {
      assert.strictEqual(
        (error as Error).message,
        `VM Exception while processing transaction: reverted with reason string 'Duplicate star.'`
      );
    }
  });

  it("Should fail to add existing NFT by tokenUri", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
    ]);

    try {
      await contract.addStars([
        {
          id: 2,
          tokenUri: "ipfs://a",
        },
      ]);

      assert.fail("should throw error");
    } catch (error: any) {
      assert.strictEqual(
        (error as Error).message,
        `VM Exception while processing transaction: reverted with reason string 'Duplicate star.'`
      );
    }
  });

  it("Should fail to add non-unique NFT by id", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    try {
      await contract.addStars([
        {
          id: 1,
          tokenUri: "ipfs://a",
        },
        {
          id: 1,
          tokenUri: "ipfs://b",
        },
      ]);

      assert.fail("should throw error");
    } catch (error: any) {
      assert.strictEqual(
        (error as Error).message,
        `VM Exception while processing transaction: reverted with reason string 'Duplicate star.'`
      );
    }
  });

  it("Should fail to add non-unique NFT by tokenUri", async function () {
    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    try {
      await contract.addStars([
        {
          id: 1,
          tokenUri: "ipfs://a",
        },
        {
          id: 2,
          tokenUri: "ipfs://a",
        },
      ]);

      assert.fail("should throw error");
    } catch (error: any) {
      assert.strictEqual(
        (error as Error).message,
        `VM Exception while processing transaction: reverted with reason string 'Duplicate star.'`
      );
    }
  });

  it("Should buy NFT", async function () {
    const [_, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.mintStars(1, {
      value: 1,
    });
    await contract.updateMarketState(MarketState.online);
    await contract.sellStar(1, 2);

    await contract.connect(memberAddr).buyStar(1, { value: 2 });
    const star = await contract.getStar(1);

    assert.strictEqual(star.owner, memberAddr.address);
    assert.strictEqual(star.amount._hex, ethers.BigNumber.from("0")._hex);
  });

  it("Should fail to buy NFT with insufficient funds", async function () {
    const [_, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.mintStars(1, {
      value: 1,
    });
    await contract.updateMarketState(MarketState.online);
    await contract.sellStar(1, 2);

    try {
      await contract.connect(memberAddr).buyStar(1, { value: 1 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'Insufficient value.'"
      );
    }
  });

  it("Should fail to buy NFT twice", async function () {
    const [_, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.mintStars(1, {
      value: 1,
    });
    await contract.updateMarketState(MarketState.online);
    await contract.sellStar(1, 2);

    await contract.connect(memberAddr).buyStar(1, { value: 2 });

    try {
      await contract.connect(memberAddr).buyStar(1, { value: 2 });

      assert.fail("should throw error");
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'You already own this star.'"
      );
    }
  });

  it("Should fail to buy NFT already sold", async function () {
    const [_, memberAddr1, memberAddr2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.mintStars(1, {
      value: 1,
    });
    await contract.updateMarketState(MarketState.online);
    await contract.sellStar(1, 2);

    await contract.connect(memberAddr1).buyStar(1, { value: 2 });

    try {
      await contract.connect(memberAddr2).buyStar(1, { value: 2 });

      assert.fail("should throw error");
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'Star not for sale.'"
      );
    }
  });

  it("Should fail to buy NFT that sender already owns", async function () {
    const [_, memberAddr] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("StarLedgerNFT");
    const contract = await Contract.deploy();
    await contract.deployed();

    await contract.addStars([
      {
        id: 1,
        tokenUri: "ipfs://a",
      },
      {
        id: 2,
        tokenUri: "ipfs://b",
      },
    ]);
    await contract.updateMintState(MintState.minting);
    await contract.updateMarketState(MarketState.online);

    await contract.connect(memberAddr).mintStars(1, {
      value: 1,
    });
    await contract.connect(memberAddr).sellStar(1, 2);

    try {
      await contract.connect(memberAddr).buyStar(1, { value: 2 });
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "VM Exception while processing transaction: reverted with reason string 'You already own this star.'"
      );
    }
  });
});
