import mongoose from 'mongoose';

const medicationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a medication name'],
    },
    dosage: {
      type: String,
      required: [true, 'Please add a dosage'],
    },
    frequency: {
      type: String,
      required: [true, 'Please add a frequency'],
    },
    time: {
      type: String,
      required: [true, 'Please add a time'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;