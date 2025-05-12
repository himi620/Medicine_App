import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Patient {
  _id: string;
  name: string;
  email: string;
  nextAppointment?: string;
}

interface PatientListProps {
  refresh: number;
}

const PatientList: React.FC<PatientListProps> = ({ refresh }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line
  }, [refresh]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/appointments');
      // Group appointments by patient
      const patientMap: { [id: string]: Patient } = {};
      response.data.forEach((appt: any) => {
        if (appt.patient && appt.patientName) {
          if (!patientMap[appt.patient._id]) {
            patientMap[appt.patient._id] = {
              _id: appt.patient._id,
              name: appt.patientName,
              email: appt.patient.email || '',
              nextAppointment: appt.date ? new Date(appt.date).toLocaleString() : undefined,
            };
          } else {
            // Update nextAppointment if this one is sooner
            const existing = patientMap[appt.patient._id];
            if (
              appt.date &&
              (!existing.nextAppointment || new Date(appt.date) < new Date(existing.nextAppointment))
            ) {
              existing.nextAppointment = new Date(appt.date).toLocaleString();
            }
          }
        }
      });
      setPatients(Object.values(patientMap));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
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

  if (patients.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-500">No patients found</h3>
        <p className="text-gray-400 mt-2">You have no patients with scheduled appointments.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Appointment</th>
            {/* Removed Actions column for doctors */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{patient.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{patient.nextAppointment || '-'}</div>
              </td>
              {/* Removed Actions cell for doctors */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
