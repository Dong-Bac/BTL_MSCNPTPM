import { ethers } from "ethers";

// Kết nối với Sepolia (hoặc mạng Ethereum mà bạn đang sử dụng)https://sepolia.infura.io/v3/8f7dbb853823467f9f1dbce7f5189b6f
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/8f7dbb853823467f9f1dbce7f5189b6f");
const signer = provider.getSigner();

export { provider, signer };
