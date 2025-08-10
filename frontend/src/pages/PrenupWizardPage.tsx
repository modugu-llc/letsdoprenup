import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  ScaleIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  DocumentCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface StateRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  category: 'timing' | 'disclosure' | 'execution' | 'fairness';
}

interface StateInfo {
  name: string;
  code: string;
  requirements: StateRequirement[];
  waitingPeriod: string;
  notarizationRequired: boolean;
  attorneyReviewRecommended: boolean;
}

const stateData: Record<string, StateInfo> = {
  'california': {
    name: 'California',
    code: 'CA',
    waitingPeriod: '7 days',
    notarizationRequired: false,
    attorneyReviewRecommended: true,
    requirements: [
      {
        id: 'ca-1',
        title: '7-Day Waiting Period',
        description: 'Must wait 7 days after receiving the agreement before signing',
        required: true,
        category: 'timing'
      },
      {
        id: 'ca-2',
        title: 'Full Financial Disclosure',
        description: 'Complete disclosure of all assets, debts, and income',
        required: true,
        category: 'disclosure'
      },
      {
        id: 'ca-3',
        title: 'Fairness Testing',
        description: 'Agreement must be fair and reasonable at time of execution',
        required: true,
        category: 'fairness'
      },
      {
        id: 'ca-4',
        title: 'Independent Legal Counsel',
        description: 'Each party should have opportunity to consult with attorney',
        required: false,
        category: 'execution'
      }
    ]
  },
  'washington': {
    name: 'Washington',
    code: 'WA',
    waitingPeriod: 'None',
    notarizationRequired: false,
    attorneyReviewRecommended: true,
    requirements: [
      {
        id: 'wa-1',
        title: 'Community Property Rules',
        description: 'Must address community property classification',
        required: true,
        category: 'disclosure'
      },
      {
        id: 'wa-2',
        title: 'Comprehensive Disclosure',
        description: 'Full disclosure of financial circumstances',
        required: true,
        category: 'disclosure'
      },
      {
        id: 'wa-3',
        title: 'Fair Terms',
        description: 'Agreement must be fair and reasonable',
        required: true,
        category: 'fairness'
      }
    ]
  },
  'new-york': {
    name: 'New York',
    code: 'NY',
    waitingPeriod: 'None',
    notarizationRequired: true,
    attorneyReviewRecommended: true,
    requirements: [
      {
        id: 'ny-1',
        title: 'Mandatory Notarization',
        description: 'Agreement must be notarized to be enforceable',
        required: true,
        category: 'execution'
      },
      {
        id: 'ny-2',
        title: 'Fair and Reasonable Standard',
        description: 'Must be fair and reasonable at time of execution',
        required: true,
        category: 'fairness'
      },
      {
        id: 'ny-3',
        title: 'Full Disclosure',
        description: 'Complete financial disclosure required',
        required: true,
        category: 'disclosure'
      }
    ]
  },
  'washington-dc': {
    name: 'Washington D.C.',
    code: 'DC',
    waitingPeriod: 'None',
    notarizationRequired: false,
    attorneyReviewRecommended: false,
    requirements: [
      {
        id: 'dc-1',
        title: 'UPAA Compliance',
        description: 'Must comply with Uniform Premarital Agreement Act',
        required: true,
        category: 'execution'
      },
      {
        id: 'dc-2',
        title: 'Disclosure Requirements',
        description: 'Financial disclosure must be fair and reasonable',
        required: true,
        category: 'disclosure'
      },
      {
        id: 'dc-3',
        title: 'Voluntary Execution',
        description: 'Must be entered into voluntarily',
        required: true,
        category: 'execution'
      }
    ]
  },
  'virginia': {
    name: 'Virginia',
    code: 'VA',
    waitingPeriod: 'None',
    notarizationRequired: false,
    attorneyReviewRecommended: true,
    requirements: [
      {
        id: 'va-1',
        title: 'Voluntariness Emphasis',
        description: 'Must be entered into voluntarily without coercion',
        required: true,
        category: 'execution'
      },
      {
        id: 'va-2',
        title: 'Full Disclosure',
        description: 'Complete financial disclosure required',
        required: true,
        category: 'disclosure'
      },
      {
        id: 'va-3',
        title: 'Fair Terms',
        description: 'Agreement must be fair and reasonable',
        required: true,
        category: 'fairness'
      }
    ]
  }
};

const PrenupWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedState, setSelectedState] = useState<string>('');
  const [formData, setFormData] = useState({
    state: '',
    partnerName: '',
    weddingDate: '',
    hasChildren: false,
    ownsProperty: false,
    hasBusiness: false,
    hasSignificantAssets: false,
    hasDebts: false,
    incomeLevel: '',
    complexityLevel: 'low'
  });

  const steps = [
    { id: 1, title: 'Enter Your State', icon: MapPinIcon },
    { id: 2, title: 'State Requirements', icon: ScaleIcon },
    { id: 3, title: 'Questionnaire', icon: DocumentTextIcon },
    { id: 4, title: 'AI Analysis', icon: SparklesIcon },
    { id: 5, title: 'Notarize & Review', icon: DocumentCheckIcon }
  ];

  const handleStateSelect = (stateKey: string) => {
    setSelectedState(stateKey);
    setFormData(prev => ({ ...prev, state: stateKey }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAIRecommendation = () => {
    const complexity = formData.complexityLevel;
    const state = stateData[selectedState];
    
    if (complexity === 'high' || state?.attorneyReviewRecommended) {
      return {
        recommendation: 'Attorney Review Recommended',
        reason: 'Your situation involves complex financial arrangements or your state strongly recommends legal counsel.',
        confidence: 'high',
        color: 'text-red-600'
      };
    } else if (complexity === 'medium') {
      return {
        recommendation: 'Attorney Review Considered',
        reason: 'Your situation has moderate complexity. Consider consulting with an attorney for peace of mind.',
        confidence: 'medium',
        color: 'text-yellow-600'
      };
    } else {
      return {
        recommendation: 'Self-Service Appropriate',
        reason: 'Your situation appears straightforward. You can proceed with confidence using our platform.',
        confidence: 'low',
        color: 'text-green-600'
      };
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your State</h2>
              <p className="text-lg text-gray-600">
                Choose your state to see specific legal requirements and compliance needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(stateData).map(([key, state]) => (
                <button
                  key={key}
                  onClick={() => handleStateSelect(key)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedState === key
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{state.name}</h3>
                    <span className="text-sm font-medium text-gray-500">{state.code}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Waiting Period: {state.waitingPeriod}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentCheckIcon className="h-4 w-4 mr-2" />
                      Notarization: {state.notarizationRequired ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        if (!selectedState) return <div>Please select a state first.</div>;
        const stateInfo = stateData[selectedState];
        
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {stateInfo.name} Requirements
              </h2>
              <p className="text-lg text-gray-600">
                Here's what makes your prenup enforceable according to {stateInfo.name} laws.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Key Requirements for {stateInfo.name}
                  </h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Waiting Period: {stateInfo.waitingPeriod}</li>
                    <li>• Notarization: {stateInfo.notarizationRequired ? 'Required' : 'Not Required'}</li>
                    <li>• Attorney Review: {stateInfo.attorneyReviewRecommended ? 'Recommended' : 'Not Required'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {stateInfo.requirements.map((requirement) => (
                <div key={requirement.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {requirement.title}
                        </h3>
                        {requirement.required && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{requirement.description}</p>
                    </div>
                    <div className="ml-4">
                      {requirement.required ? (
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Questionnaire</h2>
              <p className="text-lg text-gray-600">
                Answer these questions to help us understand your situation and provide appropriate recommendations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Partner's Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange('partnerName', e.target.value)}
                  placeholder="Enter your partner's full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wedding Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Do you have children from previous relationships?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasChildren"
                      checked={formData.hasChildren === true}
                      onChange={() => handleInputChange('hasChildren', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasChildren"
                      checked={formData.hasChildren === false}
                      onChange={() => handleInputChange('hasChildren', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Do you own real estate?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ownsProperty"
                      checked={formData.ownsProperty === true}
                      onChange={() => handleInputChange('ownsProperty', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="ownsProperty"
                      checked={formData.ownsProperty === false}
                      onChange={() => handleInputChange('ownsProperty', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Do you own a business?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasBusiness"
                      checked={formData.hasBusiness === true}
                      onChange={() => handleInputChange('hasBusiness', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasBusiness"
                      checked={formData.hasBusiness === false}
                      onChange={() => handleInputChange('hasBusiness', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Do you have significant assets (over $100,000)?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasSignificantAssets"
                      checked={formData.hasSignificantAssets === true}
                      onChange={() => handleInputChange('hasSignificantAssets', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasSignificantAssets"
                      checked={formData.hasSignificantAssets === false}
                      onChange={() => handleInputChange('hasSignificantAssets', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Do you have significant debts?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasDebts"
                      checked={formData.hasDebts === true}
                      onChange={() => handleInputChange('hasDebts', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasDebts"
                      checked={formData.hasDebts === false}
                      onChange={() => handleInputChange('hasDebts', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Income Level</label>
                <select
                  className="input"
                  value={formData.incomeLevel}
                  onChange={(e) => handleInputChange('incomeLevel', e.target.value)}
                >
                  <option value="">Select income level</option>
                  <option value="low">Under $50,000</option>
                  <option value="medium">$50,000 - $150,000</option>
                  <option value="high">$150,000 - $500,000</option>
                  <option value="very-high">Over $500,000</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        const aiRecommendation = getAIRecommendation();
        
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Analysis Complete</h2>
              <p className="text-lg text-gray-600">
                Our AI agent has confidentially analyzed your prenup and provided recommendations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Analysis Results</h3>
                  <p className="text-gray-600">Based on your questionnaire responses</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Recommendation</h4>
                  <p className={`text-xl font-bold ${aiRecommendation.color}`}>
                    {aiRecommendation.recommendation}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Reasoning</h4>
                  <p className="text-gray-700">{aiRecommendation.reason}</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Confidence Level</h4>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                      <div 
                        className={`h-2 rounded-full ${
                          aiRecommendation.confidence === 'high' ? 'bg-red-500' :
                          aiRecommendation.confidence === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: aiRecommendation.confidence === 'high' ? '90%' : 
                                aiRecommendation.confidence === 'medium' ? '60%' : '30%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {aiRecommendation.confidence} confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Important Note
                  </h3>
                  <p className="text-yellow-800">
                    This AI analysis is for guidance only and does not constitute legal advice. 
                    Always consider consulting with a qualified attorney for your specific situation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

             case 5:
         const stateInfoFinal = stateData[selectedState];
        
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notarize & Review Options</h2>
              <p className="text-lg text-gray-600">
                Choose your notarization and attorney review options based on your state requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <DocumentCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Notarization</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Self-Service Notarization</h4>
                      <p className="text-sm text-gray-600">Find a local notary and complete yourself</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">$0</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Remote Online Notarization</h4>
                      <p className="text-sm text-gray-600">Complete notarization online with our partner</p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">$25</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <ScaleIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Attorney Review</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Self-Service</h4>
                      <p className="text-sm text-gray-600">Use our platform without attorney review</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">$0</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                    <div>
                      <h4 className="font-medium text-gray-900">Attorney Review</h4>
                      <p className="text-sm text-gray-600">Have an attorney review your agreement</p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">$150</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    You're Almost Done!
                  </h3>
                  <p className="text-green-800">
                    Your prenup is ready to be generated. Choose your options above and proceed to create your final document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h1>
          </div>
        </div>

        {/* Step Content */}
        <div className="card p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`btn btn-outline flex items-center ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 5}
            className={`btn btn-primary flex items-center ${
              currentStep === 5 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {currentStep === 5 ? 'Complete' : 'Next'}
            {currentStep < 5 && <ChevronRightIcon className="h-4 w-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrenupWizardPage;