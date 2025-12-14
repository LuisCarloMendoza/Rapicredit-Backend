import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true }, // ej: "prestamo"
        seq: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Counter", counterSchema);
