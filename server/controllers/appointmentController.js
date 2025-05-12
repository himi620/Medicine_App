import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  if (!doctorId || !date || !time || !reason) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(404);
    throw new Error('Doctor not found');
  }

  // Check for duplicate appointment for the same patient, doctor, date, and time
  const duplicate = await Appointment.findOne({
    patient: req.user._id,
    doctor: doctorId,
    date,
    time,
  });
  if (duplicate) {
    res.status(400);
    throw new Error('Duplicate appointment for this patient, doctor, date, and time');
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date,
    time,
    reason,
  });

  const fullAppointment = await Appointment.findById(appointment._id)
    .populate('doctor', 'name')
    .populate('patient', 'name');

  res.status(201).json(fullAppointment);
});

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req, res) => {
  let appointments;
  
  if (req.user.role === 'patient') {
    // Get appointments for patient
    appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name')
      .sort({ date: 1 });
  } else {
    // Get appointments for doctor
    appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name')
      .sort({ date: 1 });
  }
  
  // Transform appointments for frontend with doctorName
  const formattedAppointments = appointments.map(app => {
    const formattedApp = app.toObject();
    
    if (req.user.role === 'patient' && app.doctor) {
      formattedApp.doctorName = app.doctor.name;
    } else if (req.user.role === 'doctor' && app.patient) {
      formattedApp.patientName = app.patient.name;
    }
    
    return formattedApp;
  });

  res.status(200).json(formattedAppointments);
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('doctor', 'name')
    .populate('patient', 'name');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check if user is authorized
  if (
    appointment.patient._id.toString() !== req.user._id.toString() &&
    appointment.doctor._id.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(appointment);
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check if user is authorized
  if (
    appointment.patient.toString() !== req.user._id.toString() &&
    appointment.doctor.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
    .populate('doctor', 'name')
    .populate('patient', 'name');

  res.status(200).json(updatedAppointment);
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check if user is authorized
  if (
    appointment.patient.toString() !== req.user._id.toString() &&
    appointment.doctor.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  appointment.status = 'cancelled';
  await appointment.save();

  const updatedAppointment = await Appointment.findById(req.params.id)
    .populate('doctor', 'name')
    .populate('patient', 'name');

  res.status(200).json(updatedAppointment);
});

// @desc    Complete appointment
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Doctor only)
export const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Only doctor can mark as complete
  if (
    req.user.role !== 'doctor' ||
    appointment.doctor.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  appointment.status = 'completed';
  await appointment.save();

  const updatedAppointment = await Appointment.findById(req.params.id)
    .populate('doctor', 'name')
    .populate('patient', 'name');

  res.status(200).json(updatedAppointment);
});