import Landing from "./pages/home/LandingPage";
// import { Routes, Route } from "react-router";
import Dashboard from "./pages/dashboard";
import { Toaster } from "sonner";
import { createBrowserRouter, RouterProvider } from "react-router";
function App() {
  let router = createBrowserRouter([
    {
      path: "/",
      Component: Landing,
      // loader: loadRootData,
    },
    {
      path: "/dashboard",
      Component: Dashboard,
    },
  ]);
  return (
    <div className="max-h-screen overflow-y-hidden   flex no-scrollbar flex-col">
      <div className="">
        <Toaster position="top-right" />
        <RouterProvider router={router} />,
        {/* <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes> */}
      </div>
    </div>
  );
}

export default App;
