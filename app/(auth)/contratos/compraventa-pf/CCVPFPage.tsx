'use client';

import { useState } from 'react';
import CompraventaPFForm from '@/app/(auth)/contratos/compraventa-pf/ContratoForm';
import ContratoCompraventaPF from '@/app/(auth)/contratos/compraventa-pf/GenerarContrato';
import type { CompraventaPFFormValues } from '@/app/(auth)/contratos/compraventa-pf/tipos';

export default function CCVPFPage() {
  const [values, setValues] = useState<CompraventaPFFormValues | null>(null);

  return (
    <div className="space-y-6">
      <CompraventaPFForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoCompraventaPF
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)}
        />
      )}
    </div>
  );
}
