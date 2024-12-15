import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  orderId: {
    type: String,
    // required: true,
    unique: true,
  },

  pickupLocation: {
    type: String,
    required: true,
  },

  deliveryLocation: {
    type: String,
    required: true,
  },

  packageType: {
    type: String,
    enum: ["small", "medium", "large"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "in-transit", "delivered", "cancelled"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);
