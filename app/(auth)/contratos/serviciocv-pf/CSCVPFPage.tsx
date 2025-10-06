'use client';

import { useState } from 'react';
import PSBGPFForm from '@/app/(auth)/contratos/serviciocv-pf/ContratoForm';
import ContratoPSBGPF from '@/app/(auth)/contratos/serviciocv-pf/GenerarContrato';
import type { PSBGPFFormValues } from '@/app/(auth)/contratos/serviciocv-pf/tipos';

export default function PSBGPFPage() {
  const [values, setValues] = useState<PSBGPFFormValues | null>(null);

  return (
    <div className="space-y-6">
      <PSBGPFForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoPSBGPF
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)}
        />
      )}
    </div>
  );
}
