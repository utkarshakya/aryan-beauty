import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value > Date.now(), // Start time must be in the future
        message: "Start time must be in the future",
      },
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value > this.startTime, // End time must be after start time
        message: "End time must be after start time",
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
