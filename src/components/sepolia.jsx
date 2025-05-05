import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers, isAddress, BrowserProvider, Contract } from "ethers";
import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, mainnet, base, baseSepolia } from "@reown/appkit/networks";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import ethIcon from "../img/ethicon.svg";
import AddressInputSection from "./AddressInputSection";
import ConfirmationSection from "./ConfirmationSection";
import "./css/sepolia.css";

const DISPERSE_CONTRACT_ADDRESS = "0xA0a2C3DA86C60EEeE26Bd2e90acB3e1e18E81b3D";
const DISPERSE_ABI = [
  "function disperseEther(address[] recipients, uint256[] values) external payable",
  "function disperseTokenSimple(address token, address[] recipients, uint256[] values) external",
  "function disperseToken(address token, address[] recipients, uint256[] values) external"
];

const NETWORKS = {
  sepolia: { chainId: 11155111, name: "Sepolia" },
  ethereum: { chainId: 1, name: "Ethereum" },
  goerli: { chainId: 5, name: "Goerli" },
  base: { chainId: 8453, name: "Base" },
  basesepolia: { chainId: 84532, name: "Base Sepolia" },
  bnb: { chainId: 56, name: "BNB Smart Chain" }
};

const explorerUrls = {
  sepolia: "https://sepolia.etherscan.io",
  ethereum: "https://etherscan.io",
  goerli: "https://goerli.etherscan.io",
  base: "https://basescan.org",
  basesepolia: "https://sepolia.basescan.org",
  bnb: "https://bscscan.com"
};

const shortenAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected";

const Sepolia = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [inputText, setInputText] = useState("");
  const [parsedEntries, setParsedEntries] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");
  const [chainId, setChainId] = useState(NETWORKS["sepolia"].chainId);
  const [hash, setHash] = useState(null);

  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    const initAppKit = async () => {
      try {
        const modalInstance = createAppKit({
          adapters: [new EthersAdapter()],
          networks: [sepolia, mainnet, base, baseSepolia],
          metadata: {
            name: "Disperse App",
            description: "Send ETH to multiple addresses",
            url: "https://yourapp.com",
            icons: ["https://raw.githubusercontent.com/reownxyz/assets/main/logo.png"]
          },
          projectId: "9784ae3d0e3f70d4130cf831f49c2923"
        });

        setModal(modalInstance);
        const provider = await modalInstance.subscribeProviders((state) => state["eip155"]);
        const userAccount = await modalInstance.subscribeAccount((state) => state);

        if (provider && userAccount) {
          setAccount(userAccount);
          await fetchBalance(provider, userAccount);
        }
      } catch (err) {
        console.error("AppKit connection error:", err);
      }
    };

    initAppKit();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    }
  }, [address, isConnected]);

  useEffect(() => {
    const lines = inputText.split("\n");
    const entries = lines.map((line) => {
      const [addr, amt] = line.trim().replace(/[,=]/g, " ").split(/\s+/);
      return isAddress(addr) && !isNaN(parseFloat(amt)) ? { address: addr, amount: parseFloat(amt) } : null;
    }).filter(Boolean);

    setParsedEntries(entries);
  }, [inputText]);

  const fetchBalance = async (provider, userAccount) => {
    try {
      const ethersProvider = new BrowserProvider(provider);
      const balance = await ethersProvider.getBalance(userAccount);
      setUserBalance(parseFloat(ethers.formatEther(balance)));
    } catch (err) {
      console.error("Failed to get balance:", err);
    }
  };

  const handleNetworkChange = async (e) => {
    const selected = e.target.value;
    const newChainId = NETWORKS[selected]?.chainId;
    setSelectedNetwork(selected);
    setChainId(newChainId);
    setInputText("");
    setParsedEntries([]);
    setUserBalance(0);
    setHash(null);

    try {
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${newChainId.toString(16)}` }]
      });
      await fetchBalance(walletProvider, account);
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  };

  const handleDisperseEther = async () => {
    if (!walletProvider || !account || parsedEntries.length === 0) return;
    try {
      const recipients = parsedEntries.map(e => e.address);
      const values = parsedEntries.map(e => ethers.parseEther(e.amount.toString()));
      const totalValue = values.reduce((acc, val) => acc + val, 0n);

      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(DISPERSE_CONTRACT_ADDRESS, DISPERSE_ABI, signer);

      const tx = await contract.disperseEther(recipients, values, { value: totalValue });
      setHash(tx.hash);
      await tx.wait();
    } catch (err) {
      console.error("Disperse failed:", err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src={ethIcon} alt="Ethereum Logo" className="logo" />
        <h1>
          disperse
          <select className="network-dropdown" value={selectedNetwork} onChange={handleNetworkChange}>
            {Object.entries(NETWORKS).map(([key, net]) => (
              <option key={key} value={key}>{net.name}</option>
            ))}
          </select>
        </h1>
        <div className="wallet-info">
          {isConnected ? (
            <span
              className="address"
              onClick={() => navigator.clipboard.writeText(address)}
              title="Click to copy"
            >
              {shortenAddress(address)}
            </span>
          ) : (
            <button onClick={() => modal?.open()} className="connect-wallet-btn">
              Connect Wallet
            </button>
          )}
          {account && <button className="disconnect" onClick={() => { modal?.disconnect(); window.location.href = "/"; }}>Disconnect</button>}
        </div>
      </div>

      <p className="definition"><em>verb</em> distribute ether or tokens to multiple addresses</p>

      <div className="send-section">
        <p className="send">
          <label className="send">send</label><span className="highlight">{selectedNetwork}</span><label className="send">or</label> 
          <span className="token" onClick={() => navigate("/token")}> token</span>
        </p>
        {account && (
          <p className="balance">you have <strong>{userBalance.toFixed(6)}</strong> {selectedNetwork} ether</p>
        )}
      </div>
      <div>
        <p className="recipients">recipients and amounts</p>
        <p className="p1">enter one address and amount in ETH on each line. supports any format.</p>
      </div>

      <AddressInputSection
        inputText={inputText}
        setInputText={setInputText}
        isConnected={isConnected}
      />

      <ConfirmationSection
        parsedEntries={parsedEntries}
        userBalance={userBalance}
        onDisperse={handleDisperseEther}
        hash={hash}
        selectedNetwork={selectedNetwork}
        explorerUrls={explorerUrls}
      />
    </div>
  );
};

export default Sepolia;