import SideBar from './components/sidebar'
import './App.css'
import TransactionTable from './components/table'
import { Routes, Route } from "react-router-dom";

function NoImplementation() {
  return <div style={{ padding: 24 }}>No implementation</div>;
}
function App() {

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <main style={{ flex: 1, padding: 16 }}>
        <Routes>
          <Route path="/" element={<TransactionTable />} />
          <Route path="/settings" element={<NoImplementation />} />
          <Route path="/user-management" element={<NoImplementation />} />
          <Route path="/atm-management" element={<NoImplementation />} />
          <Route path="/my-account" element={<NoImplementation />} />
        </Routes>
      </main>
    </div>
  );
}

export default App
