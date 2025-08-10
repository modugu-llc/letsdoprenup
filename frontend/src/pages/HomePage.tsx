import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  MapPinIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: MapPinIcon,
      title: 'State-Specific Compliance',
      description: 'Automatically ensures your agreement meets your state\'s legal requirements.'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Analysis',
      description: 'Our AI confidentially analyzes your prenup and recommends attorney review when needed.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Legal Protection',
      description: 'Built-in safeguards ensure your prenup is legally enforceable in court.'
    },
    {
      icon: UserGroupIcon,
      title: 'Partner Collaboration',
      description: 'Secure platform for both partners to complete financial disclosures together.'
    }
  ];

  const states = [
    { 
      name: 'California', 
      features: ['7-day waiting period', 'Full disclosure required', 'Fairness testing'],
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      name: 'Washington', 
      features: ['Community property rules', 'Comprehensive disclosure', 'Fair terms required'],
      color: 'bg-green-50 border-green-200'
    },
    { 
      name: 'New York', 
      features: ['Mandatory notarization', 'Fair and reasonable standard', 'Full disclosure'],
      color: 'bg-purple-50 border-purple-200'
    },
    { 
      name: 'Washington D.C.', 
      features: ['UPAA compliance', 'Disclosure requirements', 'Voluntary execution'],
      color: 'bg-red-50 border-red-200'
    },
    { 
      name: 'Virginia', 
      features: ['Voluntariness emphasis', 'Full disclosure required', 'Fair terms'],
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const processSteps = [
    {
      number: '1',
      title: 'Enter Your State',
      description: 'Select your state to see specific legal requirements and compliance needs.',
      icon: MapPinIcon
    },
    {
      number: '2',
      title: 'See State Requirements',
      description: 'Learn what makes your prenup enforceable according to your state laws.',
      icon: ScaleIcon
    },
    {
      number: '3',
      title: 'Fill Questionnaire',
      description: 'Complete our comprehensive questionnaire about your relationship and finances.',
      icon: DocumentTextIcon
    },
    {
      number: '4',
      title: 'AI Analysis',
      description: 'Our AI agent confidentially classifies your prenup and recommends attorney review.',
      icon: SparklesIcon
    },
    {
      number: '5',
      title: 'Notarize & Review',
      description: 'Choose notarization and attorney review options based on your state requirements.',
      icon: DocumentCheckIcon
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-500 bg-opacity-20 text-primary-100">
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI-Powered Legal Analysis
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build Your Prenup
              <span className="block text-primary-200">With Confidence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-4xl mx-auto leading-relaxed">
              Create legally enforceable prenuptial agreements with our state-specific platform. 
              Our AI-powered system ensures compliance and recommends when you need attorney review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="btn btn-secondary text-lg px-10 py-4 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Your Prenup
              </Link>
              <Link
                to="/login"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-10 py-4 font-semibold"
              >
                Sign In
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-primary-200 bg-white bg-opacity-10 rounded-lg p-4">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="font-medium">$150-$300 one-time fee</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-primary-200 bg-white bg-opacity-10 rounded-lg p-4">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="font-medium">No monthly subscriptions</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-primary-200 bg-white bg-opacity-10 rounded-lg p-4">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="font-medium">5 states supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple 5-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your prenup done quickly and correctly with our guided, state-specific process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full text-2xl font-bold shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1 transition-all duration-200">
                    {step.number}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Let's Do Prenup?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines legal expertise with modern technology to ensure your prenup is both 
              legally sound and easy to create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State Coverage Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              State-Specific Legal Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ensure your prenup meets the specific legal requirements for your state, 
              including waiting periods, disclosure requirements, and enforcement standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {states.map((state, index) => (
              <div key={index} className={`card p-8 border-2 ${state.color} hover:shadow-xl transition-shadow duration-200`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {state.name}
                </h3>
                <ul className="space-y-3">
                  {state.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Analysis Section */}
      <section className="py-24 bg-gradient-to-br from-secondary-50 to-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-secondary-200 text-secondary-800 mb-6">
              <SparklesIcon className="h-5 w-5 mr-2" />
              AI-Powered Analysis
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Intelligent Legal Review
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI system confidentially analyzes your prenup and provides personalized recommendations 
              for attorney review based on your specific situation and state requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Confidential Analysis
              </h3>
              <p className="text-gray-600">
                Your information is analyzed confidentially to determine complexity and risk factors.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ScaleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Recommendations
              </h3>
              <p className="text-gray-600">
                Get personalized advice on whether attorney review is recommended for your situation.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Legal Compliance Check
              </h3>
              <p className="text-gray-600">
                Automated verification that your prenup meets state-specific legal requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your Prenup?
          </h2>
          <p className="text-xl text-primary-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of couples who have created their prenups with confidence using our 
            state-specific, AI-powered platform. Start your journey to legal protection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-secondary text-lg px-12 py-4 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Your Prenup Today
            </Link>
            <Link
              to="/login"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-12 py-4 font-semibold"
            >
              Sign In to Continue
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-200">5</div>
              <div className="text-primary-100">States Supported</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-200">AI</div>
              <div className="text-primary-100">Powered Analysis</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-200">24/7</div>
              <div className="text-primary-100">Platform Access</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;