// services/solicitudPdf.service.js

//Añadí esto porque necesitamos generar un PDF desde el backend
import PDFDocument from "pdfkit";

export function generarPdfSolicitud(solicitud, cliente, vendedor) {

  //Añadí esto porque PDFKit necesita un stream de documento para escribir el PDF
  const doc = new PDFDocument({ margin: 50 });

  // Título
  doc
    .fontSize(20)
    .text("Solicitud de Crédito", { align: "center" })
    .moveDown(2);

  // Datos básicos
  doc.fontSize(12).text(`Código: ${solicitud.codigoSolicitud}`);
  doc.text(`Fecha de Solicitud: ${new Date(solicitud.fechaSolicitud).toLocaleDateString()}`);
  doc.moveDown();

  // Datos del Cliente
  doc.fontSize(14).text("Datos del Cliente", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Nombre: ${cliente?.nombreCompleto || "N/A"}`);
  doc.text(`Identidad: ${cliente?.identidad || "N/A"}`);
  doc.text(`Teléfono: ${cliente?.telefono || "N/A"}`);
  doc.moveDown();

  // Datos del Oficial
  doc.fontSize(14).text("Oficial / Usuario Registro", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Nombre: ${vendedor?.nombreCompleto || "N/A"}`);
  doc.text(`Código Usuario: ${vendedor?.codigoUsuario || "N/A"}`);
  doc.moveDown();

  // Detalles del Crédito
  doc.fontSize(14).text("Detalles del Crédito", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Capital Solicitado: L ${solicitud.capitalSolicitado}`);
  doc.text(`Plazo (Cuotas): ${solicitud.plazoCuotas}`);
  doc.text(`Finalidad: ${solicitud.finalidadCredito || "N/A"}`);
  doc.moveDown();

  // Firma
  doc.moveDown(4);
  doc.text("_______________________________");
  doc.text("Firma del Cliente", { align: "left" });

  doc.end();
  return doc;
}
