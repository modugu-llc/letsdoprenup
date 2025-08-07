import React from 'react';
import { useParams } from 'react-router-dom';

const PrenupWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prenup Wizard
          </h1>
          <p className="text-lg text-gray-600">
            Prenup ID: {id}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            The multi-step wizard interface will be implemented here with:
          </p>
          <ul className="text-sm text-gray-500 mt-2 max-w-md mx-auto text-left">
            <li>• Basic information collection</li>
            <li>• Financial disclosure forms</li>
            <li>• Agreement terms selection</li>
            <li>• Document review and preview</li>
            <li>• Partner collaboration</li>
            <li>• Electronic signatures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrenupWizardPage;