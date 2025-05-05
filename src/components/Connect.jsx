import { useNavigate } from "react-router-dom";
import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, arbitrum, base } from "@reown/appkit/networks";
import { BrowserProvider, parseEther } from "ethers";
import logo from "../img/ethereum-logo.svg";
import "./css/App.css";
import { useState, useEffect } from "react";

function Connect() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const projectId = "9784ae3d0e3f70d4130cf831f49c2923";
  const metadata = {
    name: "AppKit",
    description: "AppKit Example",
    url: "https://reown.com/appkit",
    icons: ["https://raw.githubusercontent.com/reownxyz/assets/main/logo.png"]
  };

  useEffect(() => {
    const initAppKit = async () => {
      try {
        const modal = createAppKit({
          adapters: [new EthersAdapter()],
          networks: [mainnet, arbitrum, base],
          metadata,
          projectId,
          features: {
            analytics: true,
          },
        });

        const appkitProvider = await modal.subscribeProviders((state) => state["eip155"]);
        const addressFrom = await modal.subscribeAccount((state) => state);

        if (!appkitProvider) throw new Error("No provider found");
        if (!addressFrom) throw new Error("No address found");

        setProvider(appkitProvider);
        setAccount(addressFrom);
        setErrorMessage(null);

        navigate("/sepolia");

      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    initAppKit();
  }, [navigate]);

  const sendTransaction = async () => {
    try {
      if (!provider || !account) return;

      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const tx = await signer.sendTransaction({
        to: "0x000000000000000000000000000000000000dead", 
        value: parseEther("0.0001"),
      });

      console.log("Transaction sent:", tx);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const connectWalletHandler = () => {
    setErrorMessage("Use the AppKit button to connect.");
  };


  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="Ethereum Logo" className="logo" />
        <h1 className="header-h1">
          disperse 
        </h1>
      </div>

      <p className="definition">verb distribute ether or tokens to multiple addresses</p>
      <h2>connect to wallet</h2>

      <div className="wallet-buttons">
        <button className="conectbutton"onClick={() => navigate("/sepolia")}>
          <appkit-button  />
        </button>
      </div>
      <div >
      <appkit-network-button className="network" /> 
      </div>

      {/* {account && <p className="unlock-msg">Connected wallet: {account}</p>}
      {errorMessage && <p className="error-msg" style={{ color: "red" }}>{errorMessage}</p>} */}
    </div>
  );
}

export default Connect;