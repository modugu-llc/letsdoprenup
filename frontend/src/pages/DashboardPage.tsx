import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Prenup, PrenupStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const { data: prenups, isLoading } = useQuery(
    'prenups',
    async () => {
      const response = await apiService.getPrenups();
      return (response.data as any)?.prenups || [];
    }
  );

  const getStatusIcon = (status: PrenupStatus) => {
    switch (status) {
      case 'DRAFT':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'READY_FOR_REVIEW':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'PENDING_SIGNATURES':
        return <UserGroupIcon className="h-5 w-5 text-orange-500" />;
      case 'EXECUTED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PrenupStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'READY_FOR_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'PENDING_SIGNATURES':
        return 'bg-orange-100 text-orange-800';
      case 'EXECUTED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: PrenupStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your prenuptial agreements and track their progress.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prenups</p>
                <p className="text-2xl font-bold text-gray-900">{prenups?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prenups?.filter((p: Prenup) => p.status === 'IN_PROGRESS').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prenups?.filter((p: Prenup) => p.status === 'PENDING_SIGNATURES').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prenups?.filter((p: Prenup) => p.status === 'EXECUTED').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prenups List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Prenups</h2>
              <Link
                to="/prenups/create"
                className="btn btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Prenup
              </Link>
            </div>

            {prenups && prenups.length > 0 ? (
              <div className="space-y-4">
                {prenups.map((prenup: Prenup) => (
                  <div key={prenup.id} className="card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {prenup.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prenup.status)}`}>
                            {getStatusIcon(prenup.status)}
                            <span className="ml-1">{formatStatus(prenup.status)}</span>
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>State: {prenup.state.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Created: {format(new Date(prenup.createdAt), 'MMM d, yyyy')}</span>
                          {prenup.partner && (
                            <>
                              <span>•</span>
                              <span>Partner: {prenup.partner.firstName} {prenup.partner.lastName}</span>
                            </>
                          )}
                        </div>
                        {prenup.progress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-600">
                                {prenup.progress.completedSteps?.length || 0} of {prenup.progress.totalSteps} steps
                              </span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{
                                  width: `${((prenup.progress.completedSteps?.length || 0) / prenup.progress.totalSteps) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          to={`/prenups/${prenup.id}`}
                          className="btn btn-outline"
                        >
                          View
                        </Link>
                        {prenup.status !== 'EXECUTED' && (
                          <Link
                            to={`/prenups/${prenup.id}/wizard`}
                            className="btn btn-primary"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prenups yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first prenuptial agreement.
                </p>
                <Link
                  to="/prenups/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Prenup
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/prenups/create"
                  className="w-full btn btn-primary text-left"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Prenup
                </Link>
                <button className="w-full btn btn-outline text-left">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  View Templates
                </button>
              </div>
            </div>

            {/* Help & Resources */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-primary-600 hover:text-primary-700">
                  Prenup Guide & FAQ
                </a>
                <a href="#" className="block text-sm text-primary-600 hover:text-primary-700">
                  State Requirements
                </a>
                <a href="#" className="block text-sm text-primary-600 hover:text-primary-700">
                  Contact Support
                </a>
                <a href="#" className="block text-sm text-primary-600 hover:text-primary-700">
                  Find an Attorney
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;