import Razorpay from "razorpay";
import config from "../config/env.js";
import Appointment from "../models/appointmentModel.js";

const instance = new Razorpay({
  key_id: config.razorpay.id,
  key_secret: config.razorpay.secret,
});

export const createPaymentOrder = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId).populate(
      "service",
      "price"
    );

    if (!appointment) {
      res.status(404).json({ message: "Appointment Not found" });
    }

    // Creating the order
    const amount = appointment.service.price * 100; // Razorpay uses paisa
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${appointmentId}`,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify payment and update appointment
export const verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  try {
    // Verify the payment signature (security check)
    const generatedSignature = crypto
      .createHmac("sha256", config.razorpay.secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update appointment status to "confirmed"
    const appointment = await Appointment.findById(req.body.appointmentId);
    appointment.status = "confirmed";
    await appointment.save();

    res.json({ message: "Payment successful", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
