import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { 
  MapPinIcon, 
  InformationCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { USState } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface CreatePrenupFormData {
  title: string;
  state: USState;
}

const CreatePrenupPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CreatePrenupFormData>();

  const createPrenupMutation = useMutation(
    (data: CreatePrenupFormData) => apiService.createPrenup(data),
    {
      onSuccess: (response) => {
        const prenupId = (response.data as any)?.prenup?.id;
        if (prenupId) {
          toast.success('Prenup created successfully!');
          navigate(`/prenups/${prenupId}/wizard`);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create prenup');
      }
    }
  );

  const states = [
    {
      code: 'CALIFORNIA' as USState,
      name: 'California',
      description: 'Community property state with 7-day waiting period requirement',
      features: ['7-day waiting period', 'Full disclosure required', 'Fairness testing'],
      complexity: 'Medium'
    },
    {
      code: 'WASHINGTON' as USState,
      name: 'Washington',
      description: 'Community property state with comprehensive disclosure requirements',
      features: ['Full disclosure required', 'Fair and reasonable standard', 'Community property rules'],
      complexity: 'Medium'
    },
    {
      code: 'NEW_YORK' as USState,
      name: 'New York',
      description: 'Requires notarization and has strict fairness standards',
      features: ['Notarization required', 'Fair and reasonable standard', 'Independent representation recommended'],
      complexity: 'High'
    },
    {
      code: 'WASHINGTON_DC' as USState,
      name: 'Washington D.C.',
      description: 'Follows Uniform Premarital Agreement Act (UPAA)',
      features: ['UPAA compliance', 'Disclosure requirements', 'Unconscionability protection'],
      complexity: 'Low'
    },
    {
      code: 'VIRGINIA' as USState,
      name: 'Virginia',
      description: 'Emphasizes voluntariness and full disclosure',
      features: ['Voluntariness emphasis', 'Full disclosure required', 'Conscionability review'],
      complexity: 'Low'
    }
  ];

  const handleStateSelect = (state: USState) => {
    setSelectedState(state);
    setValue('state', state);
  };

  const onSubmit = (data: CreatePrenupFormData) => {
    createPrenupMutation.mutate(data);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Prenuptial Agreement
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your state and give your prenup a name to get started. 
            We'll guide you through the process step by step.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* State Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Select Your State
            </h2>
            <p className="text-gray-600 mb-6">
              Each state has different requirements for prenuptial agreements. 
              Select the state where you plan to get married.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {states.map((state) => (
                <div
                  key={state.code}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedState === state.code
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStateSelect(state.code)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="h-5 w-5 text-primary-600" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {state.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(state.complexity)}`}>
                          {state.complexity} complexity
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {state.description}
                      </p>
                      <ul className="space-y-1">
                        {state.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedState === state.code && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.state && (
              <p className="form-error mt-2">Please select a state</p>
            )}

            <input
              {...register('state', { required: 'Please select a state' })}
              type="hidden"
            />
          </div>

          {/* Prenup Name */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Name Your Prenup
            </h2>
            <p className="text-gray-600 mb-6">
              Give your prenuptial agreement a descriptive name for easy identification.
            </p>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Prenup Title
              </label>
              <input
                {...register('title', {
                  required: 'Prenup title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  }
                })}
                type="text"
                className="input"
                placeholder="e.g., John & Jane Smith Prenup 2024"
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Important Legal Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>This platform provides document preparation services, not legal advice</li>
                    <li>We recommend consulting with a qualified attorney for complex situations</li>
                    <li>Both parties should have adequate time to review the agreement</li>
                    <li>Full financial disclosure is required in all states</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPrenupMutation.isLoading || !selectedState}
              className="btn btn-primary"
            >
              {createPrenupMutation.isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 mr-2" />
              )}
              Continue to Wizard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrenupPage;