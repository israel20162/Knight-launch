import Landing from "./LandingPage";
import { Routes, Route } from "react-router";
import Dashboard from "./pages/dashboard";
import { Toaster } from "sonner";
function App() {
  return (
    <>
      <div className="max-h-screen  overflow-y-hidden   flex no-scrollbar flex-col">
        <div className="">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
