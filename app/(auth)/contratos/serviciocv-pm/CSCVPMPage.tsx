'use client';

import { useState } from 'react';
import PSBGPMForm from '@/app/(auth)/contratos/serviciocv-pm/ContratoForm';
import ContratoPSBGPM from '@/app/(auth)/contratos/serviciocv-pm/GenerarContrato';
import type { PSBGPMFormValues } from '@/app/(auth)/contratos/serviciocv-pm/tipos';

export default function PSBGPMPage() {
  const [values, setValues] = useState<PSBGPMFormValues | null>(null);

  return (
    <div className="space-y-6">
      <PSBGPMForm onSubmit={(payload) => setValues(payload)} />
      {values && (
        <ContratoPSBGPM
          values={values}
          autoExportOnValuesChange
          onExportDone={() => setValues(null)}
        />
      )}
    </div>
  );
}
