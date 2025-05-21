import React from "react";

type Employee = {
  name: string;
  period: number;
  available: number;
  used: number;
};

type VacationRequest = {
  name: string;
  from: string;
  to: string;
  days: number;
  status: "Pendiente" | "Aprobado";
};

const VacationAdmin: React.FC = () => {
  const employees: Employee[] = [
    { name: "Gabriela Ozuna", period: 2025, available: 15, used: 5 },
    { name: "Fabiola Perez", period: 2025, available: 20, used: 8 },
    { name: "Martha González", period: 2025, available: 25, used: 10 },
  ];

  const requests: VacationRequest[] = [
    {
      name: "Gabriela Ozuna",
      from: "9/3/2025",
      to: "13/3/2025",
      days: 5,
      status: "Pendiente",
    },
    {
      name: "Fabiola Perez",
      from: "4/4/2025",
      to: "8/4/2025",
      days: 5,
      status: "Aprobado",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Vacaciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Saldos de Vacaciones</h2>
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              + Asignar Días
            </button>
          </div>
          <input
            type="text"
            placeholder="Buscar empleado..."
            className="w-full border px-3 py-1 mb-4 rounded"
          />
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th>Empleado</th>
                <th>Periodo</th>
                <th>Disponibles</th>
                <th>Utilizados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-4">{e.name}</td>
                  <td>{e.period}</td>
                  <td>{e.available}</td>
                  <td>{e.used}</td>
                  <td>
                    <button className="border px-2 py-1 rounded hover:bg-gray-300">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Solicitudes Pendientes</h2>
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th>Empleado</th>
                <th>Periodo</th>
                <th>Días</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-4">{r.name}</td>
                  <td>{`${r.from} - ${r.to}`}</td>
                  <td>{r.days}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.status === "Pendiente"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "Pendiente" ? (
                      <div className="flex gap-2">
                        <button className="text-green-600 border border-green-600 px-2 py-1 rounded hover:bg-green-100">
                          ✔
                        </button>
                        <button className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-100">
                          ✖
                        </button>
                      </div>
                    ) : (
                      <button className="border px-2 py-1 rounded hover:bg-gray-300">
                        Detalles
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VacationAdmin;
