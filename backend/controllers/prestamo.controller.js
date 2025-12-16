import { prestamoService } from "../services/prestamo.service.js";

export const prestamoController = {
    // Crear un nuevo préstamo
    createPrestamo: async (req, res) => {
        try {
            const payload = req.body;
            const created = await prestamoService.createPrestamo(payload);
            res.status(201).json(created);  // Responde con el préstamo creado
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Actualizar préstamo por código
    updatePrestamoByCodigo: async (req, res) => {
        try {
            const codigoPrestamo = req.params.codigoPrestamo;
            const updateData = req.body;
            const updated = await prestamoService.updatePrestamoByCodigo(codigoPrestamo, updateData);
            res.status(200).json(updated);  // Responde con el préstamo actualizado
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obtener todos los préstamos (con filtros)
    getAllPrestamos: async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado || null,   // Filtro por estado (VIGENTE, RECHAZADO, etc.)
                busqueda: req.query.busqueda || null, // Filtro por búsqueda (cliente/código)
                ordenarPor: req.query.ordenarPor || null, // Ordenar por campo (por ejemplo, por monto o fecha)
            };

            const list = await prestamoService.getAllPrestamos(filtros);
            res.status(200).json(list);  // Responde con la lista de préstamos
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    },

    // Obtener préstamo por código
    getPrestamoByCodigo: async (req, res) => {
        try {
            const codigoPrestamo = req.params.codigoPrestamo;
            const item = await prestamoService.getPrestamoByCodigo(codigoPrestamo);
            res.status(200).json(item);  // Responde con el préstamo encontrado
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    },

    // Obtener préstamo por ID (para búsqueda por ObjectId)
    getPrestamoById: async (req, res) => {
        try {
            const id = req.params.id;
            const item = await prestamoService.getPrestamoById(id);
            res.status(200).json(item);  // Responde con el préstamo encontrado por ID
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    },

    // Eliminar préstamo por código
    deletePrestamoByCodigo: async (req, res) => {
        try {
            const codigoPrestamo = req.params.codigoPrestamo;
            await prestamoService.deletePrestamoByCodigo(codigoPrestamo);
            res.status(204).end();  // Responde con 204 si la eliminación fue exitosa
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obtener un resumen de los préstamos (similar a getFinanciamientosResumen en Financiamiento)
    getPrestamosResumen: async (req, res) => {
        try {
            const resumen = await prestamoService.getPrestamosResumen();
            res.status(200).json(resumen);  // Responde con el resumen de los préstamos
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obtener el detalle completo de un préstamo (similar a getFinanciamientoDetalle en Financiamiento)
    getPrestamoDetalleById: async (req, res) => {
        try {
            const id = req.params.id;
            const detalle = await prestamoService.getPrestamoDetalleById(id);
            if (!detalle) {
                return res.status(404).json({ message: "Prestamo no encontrado" });
            }
            res.status(200).json(detalle);  // Responde con el detalle completo del préstamo
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
};
