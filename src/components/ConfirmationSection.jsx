const ConfirmationSection = ({ parsedEntries, userBalance, onDisperse, hash, selectedNetwork, explorerUrls }) => {
    if (!parsedEntries.length) return null;
  
    const total = parsedEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const remaining = userBalance - total;
  
    return (
      <div className="confirm-section">
        <h1 className="title">confirm</h1>
  
        <div className="address-row">
          <div className="address-label">address</div>
          <div className="amount-label">amount</div>
        </div>
  
        {parsedEntries.map((entry, index) => (
          <div className="address-item" key={index}>
            <span className="address">{entry.address}</span>
            <span className="amount">{entry.amount} ETH</span>
          </div>
        ))}
  
        <div className="summary">
          <p><strong>total</strong> <span className="eth">{total.toFixed(6)} ETH</span></p>
          <p><strong className="balance-label">your balance</strong> <span className="eth balance">{userBalance.toFixed(6)} ETH</span></p>
          <p><strong className="remaining-label">remaining</strong> <span className={`eth remaining ${remaining < 0 ? "error" : ""}`}>{remaining.toFixed(18)} ETH</span></p>
        </div>
  
        <div>
          <button onClick={onDisperse} disabled={remaining < 0}>Disperse Ether</button>
          {hash && (
            <p>
              Transaction Hash: <a href={`${explorerUrls[selectedNetwork]}/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a>
            </p>
          )}
        </div>
      </div>
    );
  };
  
  export default ConfirmationSection;
  