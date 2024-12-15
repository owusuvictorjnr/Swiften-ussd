import mongoose from "mongoose";


const OrderSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["parcel", "food", "grocery"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);
