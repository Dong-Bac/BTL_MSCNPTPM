const { expect } = require("chai");
const { ethers } = require("hardhat");

const abiCoder = new ethers.AbiCoder();
describe("BlindDomainAuction", function () {
  let BlindDomainAuction;
  let auction;
  let beneficiary;
  let bidder1;
  let bidder2;
  let biddingTime = 60; // 60 giây cho giai đoạn đấu giá
  let revealTime = 60; // 60 giây cho giai đoạn tiết lộ

  beforeEach(async function () {
    
    [beneficiary, bidder1, bidder2] = await ethers.getSigners();
    // console.log("🚀 ~ bidder2:", bidder2)
    // console.log("🚀 ~ bidder1:", bidder1)
    // console.log("🚀 ~ beneficiary:", beneficiary)
    // console.log(ethers)
    // Triển khai hợp đồng
    BlindDomainAuction = await ethers.getContractFactory("BlindDomainAuction");
    auction = await BlindDomainAuction.deploy(
      biddingTime,
      revealTime,
      beneficiary.address
    );
  });

  it("should allow a user to place a bid", async function () {
    const blindedBid = ethers.keccak256(
        abiCoder.encode(
        ["uint256", "bool", "bytes32"],
        [
          ethers.parseEther("1.0"),
          false,
          ethers.encodeBytes32String("secret")
        ]
      )
    );

    await auction.connect(bidder1).bid(blindedBid, {
      value: ethers.parseEther("1.0"),
    });
    const userBids = await auction.bids(bidder1.address,0);
    const formattedUserBids = [{
      hash: userBids[0], // Phần tử đầu tiên là hash
      deposit: userBids[1] // Phần tử thứ hai là deposit
    }];
    expect(formattedUserBids.length).to.equal(1); // Đảm bảo có một bid
    expect(formattedUserBids[0].deposit).to.equal(ethers.parseEther("1.0"));
  });

  it("should allow reveal phase to process bids correctly", async function () {
    const blindedBid = ethers.keccak256(
        abiCoder.encode(
        ["uint256", "bool", "bytes32"],
        [
          ethers.parseEther("1.0"),
          false,
          ethers.encodeBytes32String("secret")
        ]
      )
    );

    await auction.connect(bidder1).bid(blindedBid, {
      value: ethers.parseEther("1.0"),
    });

    // Chờ giai đoạn đấu giá kết thúc
    await ethers.provider.send("evm_increaseTime", [biddingTime]);
    await ethers.provider.send("evm_mine");

    const values = [ethers.parseEther("1.0")];
    const fakes = [false];
    const secrets = [ethers.encodeBytes32String("secret")];

    await auction.connect(bidder1).reveal(values, fakes, secrets);
    const pendingReturns = await auction.pendingReturns(bidder1.address);
    expect(pendingReturns).to.equal(0); // Không hoàn tiền vì là bid hợp lệ
  });

  it("should transfer funds to the beneficiary after the auction ends", async function () {
    const blindedBid = ethers.keccak256(
        abiCoder.encode(
        ["uint256", "bool", "bytes32"],
        [
          ethers.parseEther("1.0"),
          false,
          ethers.encodeBytes32String("secret")
        ]
      )
    );

    await auction.connect(bidder1).bid(blindedBid, {
      value: ethers.parseEther("1.0"),
    });

    const values = [ethers.parseEther("1.0")];
    const fakes = [false];
    const secrets = [ethers.encodeBytes32String("secret")];

    // Chờ giai đoạn đấu giá kết thúc
    await ethers.provider.send("evm_increaseTime", [biddingTime]);
    await ethers.provider.send("evm_mine");
    await auction.connect(bidder1).reveal(values, fakes, secrets);

    // Chờ giai đoạn tiết lộ kết thúc
    await ethers.provider.send("evm_increaseTime", [revealTime]);
    await ethers.provider.send("evm_mine");

    await auction.connect(beneficiary).auctionEnd("example.com");
    const beneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
    expect(beneficiaryBalance).to.be.gt(ethers.parseEther("1000")); // Đảm bảo tiền đã được chuyển
  });
});
