import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Clock, Trash2, User } from 'lucide-react';

interface Appointment {
  _id: string;
  doctorId?: string;
  doctorName?: string;
  patientName?: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AppointmentListProps {
  refresh: number;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ refresh }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAppointments();
  }, [refresh]);
  
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelAppointment = async (id: string) => {
    try {
      await axios.patch(`/api/appointments/${id}/cancel`);
      setAppointments(prevApps => 
        prevApps.map(app => 
          app._id === id ? { ...app, status: 'cancelled' as const } : app
        )
      );
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
    }
  };
  
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div></div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  if (appointments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-500">No appointments found</h3>
        <p className="text-gray-400 mt-2">Book an appointment to see it here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Your Appointments</h2>
      
      <div className="space-y-4">
        {appointments.map((appointment) => {
          const statusColors = {
            scheduled: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-gray-100 text-gray-800'
          };
          
          return (
            <div 
              key={appointment._id}
              className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${
                appointment.status === 'cancelled' 
                  ? 'border-gray-300' 
                  : appointment.status === 'completed' 
                    ? 'border-blue-500' 
                    : 'border-green-500 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg text-gray-800">
                    {appointment.doctorName
                      ? `Appointment with Dr. ${appointment.doctorName}`
                      : appointment.patientName
                        ? `Appointment with Patient ${appointment.patientName}`
                        : 'Appointment'}
                  </h3>
                  <p className="text-gray-600 mt-1">{appointment.reason}</p>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Cancel appointment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatAppointmentDate(appointment.date)}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{appointment.time}</span>
                </div>
                
                <div className="flex items-center md:col-span-2">
                  <User className="h-4 w-4 mr-2" />
                  <span>{appointment.doctorName ? `Dr. ${appointment.doctorName}` : appointment.patientName ? appointment.patientName : ''}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentList;