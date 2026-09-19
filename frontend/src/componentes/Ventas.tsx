import { useEffect, useState } from 'react';
import api from '../services/api';

interface Venta {
  id_venta: number;
  id_cliente: number;
  fecha_venta: string;
  total: number;
  estado: string;
}

function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Venta[]>('/ventas')
      .then(response => {
        setVentas(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de ventas');
        setCargando(false);
        console.error(err);
      });
  }, []);

  if (cargando) return <p>Cargando ventas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Listado de Ventas</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>ID Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id_venta}>
              <td>{v.id_venta}</td>
              <td>{v.id_cliente}</td>
              <td>{v.fecha_venta}</td>
              <td>{v.total}</td>
              <td>{v.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ventas;
