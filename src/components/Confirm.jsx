import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const DISPERSE_ABI = [
  "function disperseTokenSimple(address token, address[] recipients, uint256[] values) external"
];

const Confirm = ({ recipients, total, balance, allowanceGranted, onApprove, tokenAddress, selectedNetwork, account }) => {
  const [liveBalance, setLiveBalance] = useState(balance);
  const [hash, setHash] = useState(null);
  const [status, setStatus] = useState(""); 

  useEffect(() => {
    const fetchLiveBalance = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const decimals = await token.decimals();
        const rawBalance = await token.balanceOf(account);
        const formattedBalance = parseFloat(ethers.formatUnits(rawBalance, decimals));
        setLiveBalance(formattedBalance);
      } catch (err) {
        console.error("Failed to fetch live balance", err);
      }
    };

    if (account && tokenAddress) {
      fetchLiveBalance();
    }
  }, [account, tokenAddress]);

  const remaining = liveBalance - total;

  const handleSend = async () => {
    try {
      if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
        alert("Invalid token address.");
        return;
      }
  
      const invalidRecipient = recipients.find(r => !ethers.isAddress(r.address));
      if (invalidRecipient) {
        alert(`Invalid recipient address: ${invalidRecipient.address}`);
        return;
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const disperseAddress = "0xD152f549545093347A162Dce210e7293f1452150";
      const disperseContract = new ethers.Contract(disperseAddress, DISPERSE_ABI, signer);
  
      const recipientAddresses = recipients.map(r => r.address);
      const recipientValues = recipients.map(r => ethers.parseUnits(r.amount.toString(), 18));
  
      setStatus("pending");
      setHash(null);
  
      const tx = await disperseContract.disperseTokenSimple(tokenAddress, recipientAddresses, recipientValues);
  
      console.log("Transaction hash:", tx.hash);
      setHash(tx.hash); 
  
      alert(`Tokens sent!\nTransaction Hash:\n${tx.hash}`);
  
      await tx.wait();
      setStatus("confirmed");
      console.log("Transaction confirmed!");
  
      // Refresh balance
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const rawBalance = await token.balanceOf(account);
      const decimals = await token.decimals();
      const updatedBalance = parseFloat(ethers.formatUnits(rawBalance, decimals));
      setLiveBalance(updatedBalance);
  
    } catch (err) {
      console.error("Send failed:", err);
      alert(err.message || "Transaction failed. Check console.");
      setStatus("");
    }
  };
  const explorerUrls = {
    sepolia: "https://sepolia.etherscan.io",
    ethereum: "https://etherscan.io",
    goerli: "https://goerli.etherscan.io",
    base: "https://basescan.org",
    basesepolia: "https://sepolia.basescan.org",
    bnb: "https://bscscan.com",
  };
    
  return (
    <div className="confirm-box">
      <h3>Confirm Details</h3>

      <p><strong>Your Token Balance:</strong> {liveBalance}</p>
      <p><strong>Recipients:</strong></p>
      <ul>
        {recipients.map((r, idx) => (
          <li key={idx}>
            {r.address} - {r.amount}
          </li>
        ))}
      </ul>
      <p><strong>Total to Send:</strong> {total}</p>
      <p><strong>Remaining Balance:</strong> {remaining >= 0 ? remaining : "Insufficient balance!"}</p>

      {!allowanceGranted && (
        <button onClick={onApprove}>Approve Token</button>
      )}
      {allowanceGranted && remaining >= 0 && (
        <button onClick={handleSend} disabled={status === "pending"}>
          {status === "pending" ? "Sending..." : "Send"}
        </button>
      )}
      {allowanceGranted && remaining < 0 && (
        <p style={{ color: "red" }}><strong>Not enough balance to send tokens.</strong></p>
      )}

      {/* Pending and Confirmed Status */}
      {status === "pending" && <p>⏳ Transaction pending...</p>}
      {status === "confirmed" && <p>✅ Transaction confirmed!</p>}

      {/* Show Transaction Hash if available */}
      {hash && (
        <p>
          Transaction Hash:{" "}
          <a
            href={`${explorerUrls[selectedNetwork]}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            {hash}
          </a>
        </p>
      )}
    </div>
  );
};

export default Confirm;