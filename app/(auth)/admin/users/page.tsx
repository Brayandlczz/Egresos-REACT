"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

const users = [
  {
    name: "Gabriela Ozuna",
    email: "sistemas@unici.edu.mx",
    role: "Administrador RH",
    department: "Sistemas",
    status: "Activo",
  },
  {
    name: "Fabiola Perez",
    email: "admon.egresos@unici.edu.mx",
    role: "Administrador RH",
    department: "Contabilidad y RH",
    status: "Activo",
  },
  {
    name: "Martha González",
    email: "martha.gonzalez@unici.edu.mx",
    role: "Director",
    department: "Dirección Administrativa",
    status: "Activo",
  },
];

const UserManagementView: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState("Todos los roles");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(user =>
    (roleFilter === "Todos los roles" || user.role === roleFilter) &&
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gestión de Usuarios</h2>
        <Button className="bg-blue-600 text-white">+ Agregar Usuario</Button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Buscar usuarios..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos los roles">Todos los roles</SelectItem>
              <SelectItem value="Administrador RH">Administrador RH</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <table className="w-full table-auto border-t">
          <thead>
            <tr className="text-left">
              <th className="py-2">Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 flex items-center gap-2">
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {user.role}
                  </span>
                </td>
                <td>{user.department}</td>
                <td>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {user.status}
                  </span>
                </td>
                <td className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementView;
