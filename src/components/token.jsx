import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers, isAddress, BrowserProvider, Contract } from "ethers";
import Confirm from "./Confirm";
import "./css/token.css"
import eth from "../img/ethicon.svg";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, mainnet, base, baseSepolia } from "@reown/appkit/networks";

const ERC20_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }];

const DISPERSE_ADDRESS = "0xD152f549545093347A162Dce210e7293f1452150";

const AddressInput = ({
  balance,
  allowanceGranted,
  onApprove,
  inputText,
  setInputText,
  tokenAddress,
  selectedNetwork,
  account,
}) => {
  const recipients = useMemo(() => {
    return inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const match = line.match(/^(0x[a-fA-F0-9]{40})[\s,=]+([\d.]+)$/);
        if (!match) return null;
        const [_, address, amountStr] = match;
        if (!isAddress(address)) return null;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return null;
        return { address, amount };
      })
      .filter(Boolean);
  }, [inputText]);

  const total = useMemo(() => recipients.reduce((acc, r) => acc + r.amount, 0), [recipients]);

  return (
    <div>
      <textarea
        rows="5"
        className="address-textarea"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={`0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 3.14\n0x271bffabd0f79b8bd4d7a1c245b7ec5b576ea98a,2.71`}
      />
      {recipients.length > 0 && (
        <Confirm
          recipients={recipients}
          total={total}
          balance={balance}
          allowanceGranted={allowanceGranted}
          onApprove={onApprove}
          tokenAddress={tokenAddress}
          selectedNetwork={selectedNetwork}
          account={account}
        />
      )}
    </div>
  );
};

const DisperseToken = () => {
  const navigate = useNavigate();
  const [tokenAddress, setTokenAddress] = useState("");
  const [selectedType, setSelectedType] = useState("token");
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [balance, setBalance] = useState(0);
  const [allowanceGranted, setAllowanceGranted] = useState(false);
  const [account, setAccount] = useState("");
  const [inputText, setInputText] = useState("");
  const [tokenName, setTokenName] = useState("token");
  const [selectedNetwork, setSelectedNetwork] = useState();
  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();
  const [modal, setModal] = useState(null);
  const [appkitProvider, setAppkitProvider] = useState(null);
  const [decimals, setDecimals] = useState(18);

  const shortenAddress = (address) => {
    if (!address) return "Not Connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
            icons: [
              "https://raw.githubusercontent.com/reownxyz/assets/main/logo.png",
            ],
          },
          projectId: "9784ae3d0e3f70d4130cf831f49c2923",
        });
        setModal(modalInstance);
        const provider = await modalInstance.subscribeProviders(
          (state) => state["eip155"]
        );
        const account = await modalInstance.subscribeAccount((state) => state);
        if (!provider || !account) return;
        setAppkitProvider(provider);
        setAccount(account);
      } catch (err) {
        console.error("AppKit connection error:", err);
      }
    };
    initAppKit();
  }, []);

  const handleLoadClick = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      alert("Invalid token address format.");
      setIsTokenLoaded(false);
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const [name, decimals, balanceRaw, allowanceRaw] = await Promise.all([
        contract.name(),
        contract.decimals(),
        contract.balanceOf(address),
        contract.allowance(address, DISPERSE_ADDRESS)
      ]);
      setTokenName(name);
      setDecimals(decimals);
      setBalance(parseFloat(ethers.formatUnits(balanceRaw, decimals)));
      setAllowanceGranted(allowanceRaw > 0);
      setIsTokenLoaded(true);
    } catch (error) {
      console.error("Error loading token:", error);
      alert("Failed to load token info. Check the address and try again.");
      setIsTokenLoaded(false);
    }
  };

  const handleApprove = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const tx = await contract.approve(DISPERSE_ADDRESS, ethers.MaxUint256);
      await tx.wait();
      setAllowanceGranted(true);
      alert("Approval successful!");
    } catch (error) {
      console.error("Approval error:", error);
      alert("Approval failed.");
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
    }
  }, [address, isConnected]);
  const handleDisconnect = () => {
    modal?.disconnect();
    navigate('/');
  };

  return (
    <div className="container-token">
      <div className="header">
        <img src={eth} alt="Ethereum Logo" className="logo" />
        <h1 className="title">
          disperse{" "}
          <select
            className="network-dropdown-token"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            <option value="base">base</option>
            <option value="goerli">goerli</option>
            <option value="sepolia">sepolia</option>
            <option value="ethereum">ethereum</option>
            <option value="bnb">bnb</option>
            <option value="basesepolia">basesepolia</option>
          </select>
        </h1>
        <div className="wallet-address">
          {isConnected ? (
            <span
              className="address"
              onClick={() => navigator.clipboard.writeText(address)}
              title="Click to copy"
              style={{ cursor: "pointer" }}
            >
              {shortenAddress(address)}
            </span>
          ) : (
            <button onClick={() => modal?.open()} className="connect-wallet-btn">
              Connect Wallet
            </button>
          )}

          {account && (
            <button className="disconnect" onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
        </div>
      </div>

      <p className="definition">
        <em>verb</em> distribute ether or tokens to multiple addresses
      </p>

      <div className="send-type">
        <p>
          <strong>send </strong>
          <span
            className={selectedType === "ether" ? "selected ether" : "ether"}
            onClick={() => navigate("/sepolia")}
          >
            sepolia
          </span>{" "}
          or{" "}
          <span
            className={selectedType === "token" ? "selected token" : "token"}
            onClick={() => setSelectedType("token")}
          >
            token
          </span>
        </p>
      </div>

      {selectedType === "token" && (
        <div className="token-section">
          <label className="token-label">token address</label>
          <div className="input-group">
            <input
              type="text"
              className="token-input"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x314ab97b76e39d63c78d5c86c2daf8eaa306b182"
              disabled={!isConnected}
            />
            <button className="load-btn" onClick={handleLoadClick}>
              load
            </button>
          </div>
        </div>
      )}

      {isTokenLoaded && (
        <div className="token-section">
          <h2 className="recipient-title">recipients and amounts</h2>
          <p>
            enter one address and amount in {tokenName} on each line.
          </p>
          <AddressInput
            balance={balance}
            allowanceGranted={allowanceGranted}
            onApprove={handleApprove}
            inputText={inputText}
            setInputText={setInputText}
            tokenAddress={tokenAddress}
            selectedNetwork={selectedNetwork}
            account={account}
          />

        </div>
      )}
    </div>
  );
};

export default DisperseToken;