import { Rocket } from "lucide-react";
import { Link } from "react-router";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 font-bold text-xl text-blue-600 hover:text-blue-700"
    >
      <Rocket className="w-6 h-6" />
      <span>Knight Launch</span>
    </Link>
  );
};

export default Logo;
