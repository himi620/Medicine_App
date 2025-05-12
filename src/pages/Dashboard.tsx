import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicationForm from '../components/MedicationForm';
import MedicationList from '../components/MedicationList';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';
import { Pill, Calendar, User, UserPlus, LogOut } from 'lucide-react';
import PatientList from '../components/PatientList';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('medications');
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  const handleMedicationAdded = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  const handleAppointmentAdded = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-blue-600">
                <Pill className="h-8 w-8" />
              </span>
              <h1 className="ml-2 text-2xl font-bold text-gray-900">MedReminder</h1>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Hello, {user?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                {user?.role !== 'doctor' && (
                  <button
                    onClick={() => setActiveTab('medications')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'medications'
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Pill className="h-5 w-5 mr-3" />
                    Medications
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === 'appointments'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Appointments
                </button>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  My Profile
                </button>
                
                {user?.role === 'doctor' && (
                  <button
                    onClick={() => setActiveTab('patients')}
                    className={`flex items-center px-4 py-3 text-sm font-medium ${
                      activeTab === 'patients'
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <UserPlus className="h-5 w-5 mr-3" />
                    My Patients
                  </button>
                )}
              </nav>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Medications</span>
                  <span className="text-sm font-medium text-gray-900">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Upcoming Appointments</span>
                  <span className="text-sm font-medium text-gray-900">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Medication Adherence</span>
                  <span className="text-sm font-medium text-green-600">95%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            {activeTab === 'medications' && user?.role !== 'doctor' && (
              <div className="space-y-6">
                <MedicationForm onMedicationAdded={handleMedicationAdded} />
                <MedicationList refresh={refreshCounter} />
              </div>
            )}
            
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                {user?.role !== 'doctor' && <AppointmentForm onAppointmentAdded={handleAppointmentAdded} />}
                <AppointmentList refresh={refreshCounter} />
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <User className="h-12 w-12" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-sm text-gray-400 mt-1 capitalize">{user?.role}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={user?.name || ''}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={user?.email || ''}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={user?.role === 'patient' ? 'Patient' : 'Doctor'}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'patients' && user?.role === 'doctor' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Patients</h2>
                <PatientList refresh={refreshCounter} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;