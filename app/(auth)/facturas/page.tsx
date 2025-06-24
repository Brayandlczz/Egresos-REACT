'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Edit2, Trash2, FileText, FileImage, File } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';  
import { Input } from '@/components/ui/input';   

interface Factura {
  id: string;
  folio: string;
  fecha_pago: string;
  mes_pago: string;
  importe: number;
  forma_pago: string;
  docente_relation: {
    asignatura: { nombre_asignatura: string };
    oferta_educativa: { nombre_oferta: string };
    periodo_pago_id: { concatenado: string };
    plantel: { nombre_plantel: string };
    docente: { nombre_docente: string };
  };
  cuenta_banco: { banco: string };
  concepto_pago_id: { descripcion: string };
  facturas_archivos: {
    path: string;
    nombre_original: string;
    nombre_unico: string;
  }[];
  seleccionado?: boolean;
}

const FacturaList = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchFacturas = async () => {
      const { data, error } = await supabase
        .from('factura')
        .select(`
          id,
          folio,
          fecha_pago,
          mes_pago,
          importe,
          forma_pago,
          docente_relation:docente_relation_id(
            asignatura(nombre_asignatura),
            oferta_educativa(nombre_oferta),
            periodo_pago_id(concatenado),
            plantel(nombre_plantel),
            docente(nombre_docente)
          ),
          cuenta_banco:cuenta_banco_id(banco),
          concepto_pago_id:concepto_pago_id(descripcion),
          facturas_archivos(path, nombre_original, nombre_unico)
        `);

      if (error) {
        console.error('Error al obtener facturas:', error.message);
        return;
      }

      const facturasSinUrls = (data as any[]).map((factura) => ({
        ...factura,
        seleccionado: false,
      }));

      setFacturas(facturasSinUrls as Factura[]);
    };

    fetchFacturas();
  }, [supabase]);

  const abrirArchivo = async (archivoPath: string) => {
    const { data: urlData, error: urlError } = await supabase.storage
      .from('facturas')
      .createSignedUrl(archivoPath, 60 * 60);

    if (urlError) {
      console.error('Error al obtener URL firmada:', urlError.message);
      alert('No se pudo abrir el archivo.');
      return;
    }

    window.open(urlData.signedUrl, '_blank');
  };

  const handleSeleccionar = (id: string) => {
    setFacturas(prev =>
      prev.map(f => (f.id === id ? { ...f, seleccionado: !f.seleccionado } : f))
    );
  };

  const handleEliminarSeleccionados = () => {
    setFacturas(prev => prev.filter(f => !f.seleccionado));
  };

  const handleEditar = (id: string) => {
    router.push(`/facturas/edit/${id}`);
  };

  const handleEliminar = (id: string) => {
    setFacturas(prev => prev.filter(f => f.id !== id));
  };

  const resultados = facturas.filter(f =>
    f.folio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl text-center font-bold text-blue-800 mb-6">Listado de facturas</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por folio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w"
        />
      </div>
      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
        <Link
          href="/facturas/registro"
          className="bg-green-600 text-white text-nowrap px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          Agregar factura
        </Link>
        <button
          onClick={handleEliminarSeleccionados}
          className="bg-red-600 text-white text-nowrap px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
        >
          Eliminar seleccionados
        </button>
      </div>
      <div className="rounded shadow bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-center text-nowrap">Folio</th>
              <th className="p-3 text-center text-nowrap">Plantel</th>
              <th className="p-3 text-center text-nowrap">Docente</th>
              <th className="p-3 text-center text-nowrap">Oferta educativa</th>
              <th className="p-3 text-center text-nowrap">Asignatura</th>
              <th className="p-3 text-center text-nowrap">Periodo de pago</th>
              <th className="p-3 text-center text-nowrap">Concepto de pago</th>
              <th className="p-3 text-center text-nowrap">Fecha de pago</th>
              <th className="p-3 text-center text-nowrap">Mes de pago</th>
              <th className="p-3 text-center text-nowrap">Forma de pago</th>
              <th className="p-3 text-center text-nowrap">Banco</th>
              <th className="p-3 text-center text-nowrap">Importe</th>
              <th className="p-3 text-center text-nowrap">Documentos</th>
              <th className="p-3 text-center text-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-4 text-center text-gray-500">
                  No hay facturas registradas...
                </td>
              </tr>
            ) : (
              resultados.map(factura => (
                <tr key={factura.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={factura.seleccionado || false}
                      onChange={() => handleSeleccionar(factura.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{factura.folio}</td>
                  <td className="p-3 text-center text-nowrap">{factura.docente_relation.plantel.nombre_plantel}</td>
                  <td className="p-3 text-center text-nowrap">{factura.docente_relation.docente.nombre_docente}</td>
                  <td className="p-3 text-center text-nowrap">{factura.docente_relation.oferta_educativa.nombre_oferta}</td>
                  <td className="p-3 text-center text-nowrap">{factura.docente_relation.asignatura.nombre_asignatura}</td>
                  <td className="p-3 text-center text-nowrap">{factura.docente_relation.periodo_pago_id.concatenado}</td>
                  <td className="p-3 text-center text-nowrap">{factura.concepto_pago_id.descripcion}</td>
                  <td className="p-3 text-center text-nowrap">{factura.fecha_pago}</td>
                  <td className="p-3 text-center text-nowrap">{factura.mes_pago}</td>
                  <td className="p-3 text-center text-nowrap">{factura.forma_pago}</td>
                  <td className="p-3 text-center text-nowrap">{factura.cuenta_banco.banco}</td>
                  <td className="p-3 text-center text-nowrap">${factura.importe.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    {factura.facturas_archivos.length > 0 ? (
                      factura.facturas_archivos.map((archivo) => {
                        const ext = archivo.nombre_unico.split('.').pop()?.toLowerCase();
                        const Icon = ext === 'pdf' ? FileText :
                                     ['jpg','jpeg','png'].includes(ext || '') ? FileImage :
                                     File;
                        return (
                          <button
                            key={archivo.nombre_unico}
                            onClick={() => abrirArchivo(archivo.path)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline mr-2"
                            title={archivo.nombre_original}
                            type="button"
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })
                    ) : (
                      <span>No hay archivos</span>
                    )}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                      onClick={() => handleEditar(factura.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-600 hover:bg-red-700  p-2 rounded text-white"
                      onClick={() => handleEliminar(factura.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacturaList;
