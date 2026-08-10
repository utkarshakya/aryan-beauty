import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50
    },
    description: {
      type: String,
      default: "Not Available",
      maxLength: 100
    },
    price: {
      type: Number,
      required: true,
      min: [1, "Price must be at least 1"]
    },
    duration: {
      // in minutes
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1"],
      max: [300, "Duration must be less then 300"]
    }, 
    category: {
      type: String,
      enum: ["Hair", "Skincare", "Nails", "Makeup", "Other"],
      default: "Other",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
