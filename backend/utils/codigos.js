import Counter from "../models/counter.model.js";

function pad(num, size) {
    return String(num).padStart(size, "0");
}

export async function nextCodigoPrestamo() {
    const doc = await Counter.findOneAndUpdate(
        { key: "prestamo" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).exec();

    // PRE-000001
    return `PRE-${pad(doc.seq, 6)}`;
}

export async function nextCodigoSolicitud() {
    const doc = await Counter.findOneAndUpdate(
        { key: "solicitud" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).exec();

    return `SOL-${pad(doc.seq, 6)}`;
}
