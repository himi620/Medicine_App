import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Clock, CalendarDays, Pill, Info } from 'lucide-react';

interface MedicationFormProps {
  onMedicationAdded: () => void;
}

interface ErrorResponse {
  message: string;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onMedicationAdded }) => {
  const [medicationData, setMedicationData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMedicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      // Ensure auth token is in headers
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Prevent duplicate medication by checking local state (client-side)
      const existingMeds: typeof medicationData[] = JSON.parse(localStorage.getItem('medications') || '[]');
      const isDuplicate = existingMeds.some((med) =>
        med.name.trim().toLowerCase() === medicationData.name.trim().toLowerCase() &&
        med.dosage.trim().toLowerCase() === medicationData.dosage.trim().toLowerCase() &&
        med.frequency === medicationData.frequency &&
        med.time === medicationData.time &&
        med.startDate === medicationData.startDate
      );
      if (isDuplicate) {
        setError('Medicine already added. You cannot add the same medicine twice.');
        setIsLoading(false);
        return;
      }
      
      await axios.post('/api/medications', medicationData);
      // Save to localStorage for duplicate check
      existingMeds.push(medicationData);
      localStorage.setItem('medications', JSON.stringify(existingMeds));
      
      setMedicationData({
        name: '',
        dosage: '',
        frequency: '',
        time: '',
        startDate: '',
        endDate: '',
        notes: '',
      });
      
      onMedicationAdded();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Duplicate medication')) {
        setError('Medicine already added. You cannot add the same medicine twice.');
      } else {
        setError(error.response?.data?.message || 'An error occurred while adding medication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Medication</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medication Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Pill className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={medicationData.name}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter medication name"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dosage
            </label>
            <input
              type="text"
              name="dosage"
              value={medicationData.dosage}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 10mg, 1 tablet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <select
              name="frequency"
              value={medicationData.frequency}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select frequency</option>
              <option value="once">Once daily</option>
              <option value="twice">Twice daily</option>
              <option value="three">Three times daily</option>
              <option value="asNeeded">As needed</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                name="time"
                value={medicationData.time}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="startDate"
                value={medicationData.startDate}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="endDate"
                value={medicationData.endDate}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <Info className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="notes"
              value={medicationData.notes}
              onChange={handleChange}
              rows={3}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Any special instructions or notes about this medication"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Medication'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicationForm;