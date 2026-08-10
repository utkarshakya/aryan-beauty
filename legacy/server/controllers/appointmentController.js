import Appointment from '../models/appointmentModel.js'
import Service from "../models/serviceModel.js";

// @desc  Create an appointment (Authorized User)
export const createAppointment = async (req, res) => {
  const { serviceId, startTime, notes } = req.body;
  const customerId = req.user.id; // From JWT middleware

  try {
    // Step 1: Validate Service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({ message: "Service not found" });
    }

    // Step 2: Calculate End Time
    const duration = service.duration; // in minutes
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Step 4: Create Appointment
    const appointment = await Appointment.create({
      customer: customerId,
      service: serviceId,
      startTime,
      endTime,
      notes,
    });

    // Step 5: Return Appointment with Populated Details (Optional)
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customer", "name email") // Include only name/email
      .populate("service", "name price");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get appointments (Authorized User)
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

// @desc  Update appointment (Authorized User & Admin)
export const updateAppointment = async (req, res) => {
  const { id } = req.params; // Appointment ID
  const { serviceId, startTime, notes, status } = req.body;
  const userId = req.user.id; // Logged-in user ID
  const userRole = req.user.role; // 'customer' or 'admin'

  try {

    // Before updating first check for any change
    const changesDetected = (
      (serviceId && serviceId !== appointment.service.toString()) ||
      (startTime && new Date(startTime) > appointment.startTime) ||
      (notes && notes !== appointment.notes)
    );

    if (!changesDetected) {
      return res.status(400).json({ message: 'No changes detected' });
    }

    // Step 1: Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Step 2: Authorization check
    if (appointment.customer.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Step 3: Validate service (if provided)
    let service;
    if (serviceId) {
      service = await Service.findById(serviceId);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }
    }

    // Step 4: Calculate new endTime (if service or startTime changes)
    let newEndTime;
    if (startTime || service) {
      const duration = service?.duration || appointment.service.duration;
      const newStartTime = startTime ? new Date(startTime) : appointment.startTime;
      newEndTime = new Date(newStartTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + duration);
    }

    // Step 5: Check for time conflicts (if time changes)
    if (startTime || service) {
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id }, // Exclude current appointment
        $or: [
          { startTime: { $lt: newEndTime }, endTime: { $gt: startTime } },
        ],
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: "Time slot unavailable" });
      }
    }

    // Step 6: Update appointment
    appointment.service = serviceId || appointment.service;
    appointment.startTime = startTime || appointment.startTime;
    appointment.endTime = newEndTime || appointment.endTime;
    appointment.notes = notes || appointment.notes;

    // Only admins can change status
    if (userRole === "admin" && status) {
      appointment.status = status;
    }

    await appointment.save();

    // Step 7: Return updated appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customer", "name email")
      .populate("service", "name price");

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete appointment (Authorized User & Admin)
export const deleteAppointment = async (req, res) => {
  const { id } = req.params; // Appointment ID
  const userId = req.user.id; // Logged-in user ID
  const userRole = req.user.role; // 'customer' or 'admin'

  try {
    // Step 1: Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Step 2: Authorization check
    if (
      appointment.customer.toString() !== userId &&
      userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Step 3: Delete appointment
    await Appointment.deleteOne({ _id: id });

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};