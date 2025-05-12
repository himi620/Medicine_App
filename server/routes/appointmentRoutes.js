import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
} from '../controllers/appointmentController.js';
import { protect, doctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointment);

router.patch('/:id/cancel', protect, cancelAppointment);
router.patch('/:id/complete', protect, doctor, completeAppointment);

export default router;