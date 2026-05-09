import { Code2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';




export default function Footer() {
  const navigate = useNavigate();  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                TechHub
              </span>
            </div>
            <p className="text-sm mb-4">
              Empowering the next generation of tech professionals with cutting-edge courses and resources.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-cyan-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-cyan-400 transition-colors">
                  Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">
                  Courses
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/community')} className="hover:text-cyan-400 transition-colors">
                  Community
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-cyan-400 transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="hover:text-cyan-400 transition-colors">Help Center</button>
              </li>
              <li>
                <button className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
              </li>
              <li>
                <button className="hover:text-cyan-400 transition-colors">Terms of Service</button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">contact@techhub.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">Cairo, Egypt</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 TechHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}