import { Button } from "@radix-ui/themes";
import { Menu } from "lucide-react";
import { Link } from "react-router";
import Logo from "./ui/logo";
const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          <Logo/>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/features" className="text-gray-700 hover:text-blue-600">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
            Pricing
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">
            About
          </Link>
          <Link to="/dashboard">
            <Button
              size="3"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button className="text-gray-700 hover:text-blue-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
