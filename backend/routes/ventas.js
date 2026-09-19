const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ventas');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar ventas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ventas WHERE id_venta = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la venta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_cliente, fecha_venta, total, estado } = req.body;
    const [result] = await db.query(
      'INSERT INTO ventas (id_cliente, fecha_venta, total, estado) VALUES (?, ?, ?, ?)',
      [id_cliente, fecha_venta, total, estado]
    );
    res.status(201).json({ id_venta: result.insertId, id_cliente, fecha_venta, total, estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la venta' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id_cliente, fecha_venta, total, estado } = req.body;
    await db.query(
      'UPDATE ventas SET id_cliente = ?, fecha_venta = ?, total = ?, estado = ? WHERE id_venta = ?',
      [id_cliente, fecha_venta, total, estado, req.params.id]
    );
    res.json({ mensaje: 'Venta actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ventas WHERE id_venta = ?', [req.params.id]);
    res.json({ mensaje: 'Venta eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
});

module.exports = router;
