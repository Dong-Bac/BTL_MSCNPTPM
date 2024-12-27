import React, { useState } from 'react';
import { ethers } from 'ethers'; // Import ethers.js
import './App.css';

// Khởi tạo Ethers provider với MetaMask
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/8f7dbb853823467f9f1dbce7f5189b6f');
const contractAddress = '0xBE8A9eEBF21ef7d62E00507116C95A829EdfB539';
const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "biddingTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "revealTime",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "beneficiaryAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AuctionEndAlreadyCalled",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "TooEarly",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      }
    ],
    "name": "TooLate",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "highestBid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "domainName",
        "type": "string"
      }
    ],
    "name": "AuctionEnded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "domainName",
        "type": "string"
      }
    ],
    "name": "auctionEnd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "beneficiary",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "blindedBid",
        "type": "bytes32"
      }
    ],
    "name": "bid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "biddingEnd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bids",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "blindedBid",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "deposit",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ended",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "highestBid",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "highestBidder",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "pendingReturns",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "internalType": "bool[]",
        "name": "fakes",
        "type": "bool[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "secrets",
        "type": "bytes32[]"
      }
    ],
    "name": "reveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revealEnd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [account, setAccount] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [domainName, setDomainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false); // Trạng thái yêu cầu kết nối ví đang chờ

  // Kết nối ví MetaMask
  const connectWallet = async () => {
    if (isRequesting) {
      alert('Request is already in progress. Please wait.');
      return; // Nếu yêu cầu đang được xử lý, không gửi yêu cầu mới
    }

    if (window.ethereum) {
      try {
        setIsRequesting(true); // Đánh dấu yêu cầu đang gửi
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        alert(error.message);
      } finally {
        setIsRequesting(false); // Đánh dấu yêu cầu đã hoàn tất
      }
    } else {
      alert('Please install MetaMask');
    }
  };

  // Đặt giá thầu (Bid)
  const placeBid = async () => {
    setLoading(true);
    const signer = provider.getSigner(); // Lấy signer từ provider (người dùng)
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const bidInWei = ethers.utils.parseEther(bidAmount); // Chuyển ETH sang Wei

    try {
      const tx = await contract.bid(ethers.utils.formatBytes32String(domainName), {
        value: bidInWei
      });
      await tx.wait(); // Chờ giao dịch hoàn thành
      alert('Bid placed successfully!');
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  // Tiết lộ giá thầu (Reveal Bid)
  const revealBid = async () => {
    setLoading(true);
    const signer = provider.getSigner(); // Lấy signer từ provider
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const values = [1];  // Các giá trị đấu giá
    const fakes = [false]; // Các giá trị giả
    const secrets = ['secret']; // Các bí mật mã hóa

    try {
      const tx = await contract.reveal(values, fakes, secrets);
      await tx.wait(); // Chờ giao dịch hoàn thành
      alert('Bid revealed successfully!');
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Blind Domain Auction</h1>
        {account ? (
          <p className="account">Connected as: {account}</p>
        ) : (
          <button className="connect-btn" onClick={connectWallet} disabled={isRequesting}>
            {isRequesting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        <div className="bid-section">
          <input
            className="input-field"
            type="text"
            placeholder="Enter domain name"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            disabled={!account} // Vô hiệu hóa trường nhập nếu chưa kết nối ví
          />
          <input
            className="input-field"
            type="number"
            placeholder="Enter bid amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={!account} // Vô hiệu hóa trường nhập nếu chưa kết nối ví
          />
          <button
            className="bid-btn"
            onClick={placeBid}
            disabled={loading || !account} // Vô hiệu hóa nút nếu không kết nối ví hoặc đang bận
          >
            {loading ? 'Placing Bid...' : 'Place Bid'}
          </button>
        </div>

        <div className="reveal-section">
          <button
            className="reveal-btn"
            onClick={revealBid}
            disabled={loading || !account} // Vô hiệu hóa nút nếu không kết nối ví hoặc đang bận
          >
            {loading ? 'Revealing Bid...' : 'Reveal Bid'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
