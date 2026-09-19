const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM productos WHERE id_producto = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nomProducto, cantidad, precio } = req.body;
    const [result] = await db.query(
      'INSERT INTO productos (nomProducto, cantidad, precio) VALUES (?, ?, ?)',
      [nomProducto, cantidad, precio]
    );
    res.status(201).json({ id_producto: result.insertId, nomProducto, cantidad, precio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nomProducto, cantidad, precio } = req.body;
    await db.query(
      'UPDATE productos SET nomProducto = ?, cantidad = ?, precio = ? WHERE id_producto = ?',
      [nomProducto, cantidad, precio, req.params.id]
    );
    res.json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
