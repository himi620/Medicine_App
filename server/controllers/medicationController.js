import asyncHandler from 'express-async-handler';
import Medication from '../models/Medication.js';

// @desc    Create a medication
// @route   POST /api/medications
// @access  Private
export const createMedication = asyncHandler(async (req, res) => {
  const { name, dosage, frequency, time, startDate, endDate, notes } = req.body;

  if (!name || !dosage || !frequency || !time || !startDate) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check for duplicate medication for the same user (by name, dosage, frequency, time, startDate)
  const duplicate = await Medication.findOne({
    user: req.user._id,
    name,
    dosage,
    frequency,
    time,
    startDate,
  });
  if (duplicate) {
    res.status(400);
    throw new Error('Duplicate medication entry for this user');
  }

  const medication = await Medication.create({
    user: req.user._id,
    name,
    dosage,
    frequency,
    time,
    startDate,
    endDate,
    notes,
  });

  res.status(201).json(medication);
});

// @desc    Get user medications
// @route   GET /api/medications
// @access  Private
export const getMedications = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id });
  res.status(200).json(medications);
});

// @desc    Get a medication by ID
// @route   GET /api/medications/:id
// @access  Private
export const getMedicationById = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if the medication belongs to the logged in user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(medication);
});

// @desc    Update a medication
// @route   PUT /api/medications/:id
// @access  Private
export const updateMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if the medication belongs to the logged in user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedMedication = await Medication.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedMedication);
});


export const deleteMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if the medication belongs to the logged in user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await medication.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Mark medication as complete
// @route   PATCH /api/medications/:id/complete
// @access  Private
export const markMedicationComplete = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);

  if (!medication) {
    res.status(404);
    throw new Error('Medication not found');
  }

  // Check if the medication belongs to the logged in user
  if (medication.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  medication.isCompleted = true;
  await medication.save();

  res.status(200).json(medication);
});