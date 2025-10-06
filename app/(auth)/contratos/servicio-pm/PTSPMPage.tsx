'use client';

import { useState } from 'react';
import PSTPMForm from '@/app/(auth)/contratos/servicio-pm/ContratoForm';
import ContratoPSTPM from '@/app/(auth)/contratos/servicio-pm/GenerarContrato';
import type { PSTPMFormValues } from '@/app/(auth)/contratos/servicio-pm/tipos';

export default function PSTPFPage() {
  const [values, setValues] = useState<PSTPMFormValues | null>(null);

  return (
    <div className="space-y-6">
      <PSTPMForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoPSTPM
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)} 
        />
      )}
    </div>
  );
}
