import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Guided Interview Process',
      description: 'State-specific questions guide you through creating a legally compliant prenup.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Legal Compliance',
      description: 'Automatically ensures your agreement meets state-specific legal requirements.'
    },
    {
      icon: UserGroupIcon,
      title: 'Partner Collaboration',
      description: 'Invite your partner to collaborate on financial disclosures and agreement terms.'
    },
    {
      icon: ClockIcon,
      title: 'Save & Resume',
      description: 'Save your progress and return anytime to complete your prenup.'
    }
  ];

  const states = [
    { name: 'California', features: ['7-day waiting period', 'Full disclosure required'] },
    { name: 'Washington', features: ['Community property state', 'Fair disclosure required'] },
    { name: 'New York', features: ['Notarization required', 'Fair & reasonable standard'] },
    { name: 'Washington D.C.', features: ['UPAA compliance', 'Disclosure requirements'] },
    { name: 'Virginia', features: ['Voluntariness emphasis', 'Full disclosure required'] }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Create Your Prenup
              <span className="block text-primary-200">With Confidence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Build legally enforceable prenuptial agreements online with our 
              state-specific guided platform. Protect your future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-secondary text-lg px-8 py-3"
              >
                Get Started Now
              </Link>
              <Link
                to="/login"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-primary-200">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>$150-$300 one-time fee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>No monthly subscriptions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>5 states supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for a Legal Prenup
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform handles the complexity of state-specific requirements 
              while guiding you through an easy, step-by-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State Coverage Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              State-Specific Legal Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ensure your prenup meets the specific legal requirements for your state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {states.map((state, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {state.name}
                </h3>
                <ul className="space-y-2">
                  {state.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your prenup done quickly and correctly with our guided process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Choose Your State & Answer Questions
              </h3>
              <p className="text-gray-600">
                Select your state and answer guided questions about your relationship and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Financial Disclosure
              </h3>
              <p className="text-gray-600">
                Both partners provide complete financial information including assets, debts, and income.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Review & Sign
              </h3>
              <p className="text-gray-600">
                Review your custom prenup, make any final changes, and sign electronically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Protect Your Future?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who have created their prenups with confidence using our platform.
          </p>
          <Link
            to="/register"
            className="btn btn-secondary text-lg px-8 py-3"
          >
            Start Your Prenup Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;