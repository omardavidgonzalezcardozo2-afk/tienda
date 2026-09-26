import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api';

interface Cliente {
  id_cliente: number;
  nomCliente: string;
  contacto: string;
  departamento: string;
  ciudad: string;
}

// Estado inicial vacío para el formulario (modo "crear")
const formVacio = { nomCliente: '', contacto: '', departamento: '', ciudad: '' };

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(formVacio);
  // Si tiene valor, estamos editando ese id_cliente; si es null, estamos creando uno nuevo
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const cargarClientes = () => {
    setCargando(true);
    api.get<Cliente[]>('/clientes')
      .then(response => {
        setClientes(response.data);
        setError(null);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de clientes');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (campo: keyof typeof form, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const empezarEdicion = (c: Cliente) => {
    setEditandoId(c.id_cliente);
    setForm({
      nomCliente: c.nomCliente,
      contacto: c.contacto,
      departamento: c.departamento,
      ciudad: c.ciudad,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(formVacio);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nomCliente.trim()) {
      alert('El nombre del cliente es obligatorio');
      return;
    }

    setGuardando(true);
    try {
      if (editandoId !== null) {
        // Editar cliente existente
        await api.put(`/clientes/${editandoId}`, form);
      } else {
        // Crear cliente nuevo
        await api.post('/clientes', form);
      }
      setForm(formVacio);
      setEditandoId(null);
      cargarClientes();
    } catch (err) {
      alert('Ocurrió un error al guardar el cliente');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      if (editandoId === id) cancelarEdicion();
      cargarClientes();
    } catch (err) {
      alert('Ocurrió un error al eliminar el cliente');
      console.error(err);
    }
  };

  if (cargando) return <p>Cargando clientes...</p>;

  return (
    <div>
      <h2>Listado de Clientes</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <h3>{editandoId !== null ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={form.nomCliente}
            onChange={e => handleChange('nomCliente', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Contacto (teléfono/correo)"
            value={form.contacto}
            onChange={e => handleChange('contacto', e.target.value)}
          />
          <input
            type="text"
            placeholder="Departamento"
            value={form.departamento}
            onChange={e => handleChange('departamento', e.target.value)}
          />
          <input
            type="text"
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={e => handleChange('ciudad', e.target.value)}
          />
          <button type="submit" disabled={guardando}>
            {editandoId !== null ? 'Guardar cambios' : 'Crear cliente'}
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
            <th>Contacto</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td>
              <td>{c.nomCliente}</td>
              <td>{c.contacto}</td>
              <td>{c.departamento}</td>
              <td>{c.ciudad}</td>
              <td>
                <button onClick={() => empezarEdicion(c)}>Editar</button>{' '}
                <button onClick={() => handleEliminar(c.id_cliente)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>No hay clientes registrados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
