'use client';

import { useState } from 'react';
import PSTPFForm from '@/app/(auth)/contratos/servicio-pf/ContratoForm';
import ContratoPSTPF from '@/app/(auth)/contratos/servicio-pf/GenerarContrato';
import type { PSTPFFormValues } from '@/app/(auth)/contratos/servicio-pf/tipos';

export default function PSTPFPage() {
  const [values, setValues] = useState<PSTPFFormValues | null>(null);

  return (
    <div className="space-y-6">
      <PSTPFForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoPSTPF
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)} 
        />
      )}
    </div>
  );
}
