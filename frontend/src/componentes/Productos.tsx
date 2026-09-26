import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api';

interface Producto {
  id_producto: number;
  nomProducto: string;
  cantidad: number;
  precio: number;
}

// Estado inicial vacío para el formulario (modo "crear")
const formVacio = { nomProducto: '', cantidad: '', precio: '' };

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario (texto porque vienen de inputs)
  const [form, setForm] = useState(formVacio);
  // Si tiene valor, estamos editando ese id_producto; si es null, estamos creando uno nuevo
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const cargarProductos = () => {
    setCargando(true);
    api.get<Producto[]>('/productos')
      .then(response => {
        setProductos(response.data);
        setError(null);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de productos');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (campo: keyof typeof form, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const empezarEdicion = (p: Producto) => {
    setEditandoId(p.id_producto);
    setForm({
      nomProducto: p.nomProducto,
      cantidad: String(p.cantidad),
      precio: String(p.precio),
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(formVacio);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nomProducto.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    const payload = {
      nomProducto: form.nomProducto,
      cantidad: Number(form.cantidad) || 0,
      precio: Number(form.precio) || 0,
    };

    setGuardando(true);
    try {
      if (editandoId !== null) {
        // Editar producto existente
        await api.put(`/productos/${editandoId}`, payload);
      } else {
        // Crear producto nuevo
        await api.post('/productos', payload);
      }
      setForm(formVacio);
      setEditandoId(null);
      cargarProductos();
    } catch (err) {
      alert('Ocurrió un error al guardar el producto');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      // Si estábamos editando justo el que se borró, limpiamos el formulario
      if (editandoId === id) cancelarEdicion();
      cargarProductos();
    } catch (err) {
      alert('Ocurrió un error al eliminar el producto');
      console.error(err);
    }
  };

  if (cargando) return <p>Cargando productos...</p>;

  return (
    <div>
      <h2>Listado de Productos</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <h3>{editandoId !== null ? 'Editar producto' : 'Nuevo producto'}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.nomProducto}
            onChange={e => handleChange('nomProducto', e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={form.cantidad}
            onChange={e => handleChange('cantidad', e.target.value)}
            min={0}
          />
          <input
            type="number"
            placeholder="Precio"
            step="0.01"
            value={form.precio}
            onChange={e => handleChange('precio', e.target.value)}
            min={0}
          />
          <button type="submit" disabled={guardando}>
            {editandoId !== null ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editandoId !== null && (
            <button type="button" onClick={cancelarEdicion} disabled={guardando}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nomProducto}</td>
              <td>{p.cantidad}</td>
              <td>{p.precio}</td>
              <td>
                <button onClick={() => empezarEdicion(p)}>Editar</button>{' '}
                <button onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>No hay productos registrados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
