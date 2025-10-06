'use client';

import { useState } from 'react';
import CompraventaPMForm from '@/app/(auth)/contratos/compraventa-pm/ContratoForm';
import ContratoCompraventaPM from '@/app/(auth)/contratos/compraventa-pm/GenerarContrato';
import type { CompraventaPMFormValues } from '@/app/(auth)/contratos/compraventa-pm/tipos';

export default function CCVPMPage() {
  const [values, setValues] = useState<CompraventaPMFormValues | null>(null);

  return (
    <div className="space-y-6">
      <CompraventaPMForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoCompraventaPM
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)}
        />
      )}
    </div>
  );
}
