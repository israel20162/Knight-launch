import Landing from "./LandingPage";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import { Routes, Route } from "react-router";
import Dashboard from "./pages/dashboard";
function App() {
  return (
    <>
      <div className="max-h-screen  overflow-y-hidden   flex no-scrollbar flex-col">
        
          <div className="">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/project/:projectId" element={<ProjectPage />} />
            </Routes>
         
        </div>
      </div>
    </>
  );
}

export default App;
