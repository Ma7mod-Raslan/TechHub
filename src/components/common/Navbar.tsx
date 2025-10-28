import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">
      <div className="text-2xl font-semibold text-blue-600">TechHub</div>
      <ul className="flex space-x-6 text-gray-700">
        <li><Link to="/WhoWeAreSection.tsx">Who We Are</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/partners">Our Partners</Link></li>
        <li><Link to="/courses">Explore Courses</Link></li>
        <li><Link to="/plans">Plans</Link></li>
      </ul>
      <div className="flex space-x-3">
        <button className="px-4 py-2 border rounded-md">Sign In</button>
        <button className="px-4 py-2 bg-blue-800 text-white rounded-md">Sign Up</button>
      </div>
    </nav>
  );
}
