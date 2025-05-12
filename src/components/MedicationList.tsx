import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isCompleted?: boolean;
}

interface ErrorResponse {
  message: string;
}

interface MedicationListProps {
  refresh: number;
}

const MedicationList: React.FC<MedicationListProps> = ({ refresh }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchMedications();
  }, [refresh]);
  
  const fetchMedications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure auth token is in headers
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get<Medication[]>('/api/medications');
      setMedications(response.data);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error fetching medications:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to view your medications');
      } else {
        setError(error.response?.data?.message || 'Failed to load medications');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsCompleted = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.patch(`/api/medications/${id}/complete`);
      setMedications(prevMeds => 
        prevMeds.map(med => 
          med._id === id ? { ...med, isCompleted: true } : med
        )
      );
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error marking medication as completed:', error);
    }
  };
  
  const deleteMedication = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.delete(`/api/medications/${id}`);
      setMedications(prevMeds => prevMeds.filter(med => med._id !== id));
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Error deleting medication:', error);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  if (medications.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-500">No medications found</h3>
        <p className="text-gray-400 mt-2">Add medications to see them here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Your Medications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((medication) => (
          <div 
            key={medication._id}
            className={`bg-white rounded-lg shadow-sm p-5 border-l-4 transition-all ${
              medication.isCompleted 
                ? 'border-green-500 bg-green-50' 
                : 'border-blue-500 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg text-gray-800">{medication.name}</h3>
                <p className="text-gray-600">{medication.dosage}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {medication.isCompleted ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Taken
                  </span>
                ) : (
                  <button
                    onClick={() => markAsCompleted(medication._id)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as taken
                  </button>
                )}
                
                <button
                  onClick={() => deleteMedication(medication._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete medication"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{medication.time} - {medication.frequency.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
            </div>
            
            {medication.notes && (
              <div className="mt-3 text-sm text-gray-500">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <p>{medication.notes}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationList;