const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /clientes -> lista todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar clientes' });
  }
});

// GET /clientes/:id -> un cliente puntual
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM clientes WHERE id_cliente = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el cliente' });
  }
});

// POST /clientes -> crear cliente
router.post('/', async (req, res) => {
  try {
    const { nomCliente, contacto, departamento, ciudad } = req.body;
    const [result] = await db.query(
      'INSERT INTO clientes (nomCliente, contacto, departamento, ciudad) VALUES (?, ?, ?, ?)',
      [nomCliente, contacto, departamento, ciudad]
    );
    res.status(201).json({ id_cliente: result.insertId, nomCliente, contacto, departamento, ciudad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
});

// PUT /clientes/:id -> actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { nomCliente, contacto, departamento, ciudad } = req.body;
    await db.query(
      'UPDATE clientes SET nomCliente = ?, contacto = ?, departamento = ?, ciudad = ? WHERE id_cliente = ?',
      [nomCliente, contacto, departamento, ciudad, req.params.id]
    );
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// DELETE /clientes/:id -> eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;
