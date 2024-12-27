const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Kiểm tra số dư tài khoản deployer
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // Các tham số cần thiết
  const biddingTime = 3600;  // 1 giờ
  const revealTime = 3600;   // 1 giờ
  const beneficiaryAddress = "0xBE8A9eEBF21ef7d62E00507116C95A829EdfB539";  // Địa chỉ người nhận tiền

  // Chuyển đổi địa chỉ thành kiểu "payable"
  const beneficiaryPayable = ethers.getAddress(beneficiaryAddress);

  // Triển khai hợp đồng
  try {
    const Token = await ethers.getContractFactory("BlindDomainAuction");

    // Triển khai hợp đồng với các tham số
    const token = await Token.deploy(biddingTime, revealTime, beneficiaryPayable);

    // In ra địa chỉ của hợp đồng đã triển khai
    console.log("Contract deployed to:", token);
  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
