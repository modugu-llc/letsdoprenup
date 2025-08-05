import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">Let's Do Prenup</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Create legally enforceable prenuptial and postnuptial agreements online 
              with our guided platform. Secure your future with confidence.
            </p>
            <div className="bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-4 mb-4">
              <p className="text-yellow-200 text-sm">
                <strong>Legal Disclaimer:</strong> This platform provides document preparation 
                services and legal information, but does not provide legal advice. 
                We recommend consulting with a qualified attorney for legal guidance.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/prenups/create" className="text-gray-300 hover:text-white transition-colors">
                  Create Prenup
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Legal Disclaimers
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Modugu LLC. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-400 text-sm">
              Supported States: California, Washington, New York, Washington D.C., Virginia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;