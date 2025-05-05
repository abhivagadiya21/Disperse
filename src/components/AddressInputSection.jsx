const AddressInputSection = ({ inputText, setInputText, isConnected }) => (
  
    <textarea
      rows="5"
      className="address-box"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      placeholder={`0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 3.14\n0x271bffabd0f79b8bd4d7a1c245b7ec5b576ea98a,2.71\n0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 =3.14`}
      disabled={!isConnected}
    />
  );
  
  export default AddressInputSection;
  