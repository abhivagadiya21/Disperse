import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Connect from './components/Connect';
import Sepolia from './components/sepolia';
import Token from './components/token';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Connect />} />
        <Route path="/sepolia" element={<Sepolia />} />
        <Route path="/token" element={<Token />} />
      </Routes>
    </Router>
  );
}

export default App;
