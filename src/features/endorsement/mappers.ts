import type { NewEndorsement } from '@/domain/entities';
import type { EndorsementOutput } from '@/domain/validation/schemas';

/** Converts the validated form data into the domain payload. */
export function toNewEndorsement(dta: string, data: EndorsementOutput): NewEndorsement {
  const base = {
    dta,
    customsBrokerId: data.customsBrokerId,
    referenceCode: data.referenceCode || undefined,
    foreignExchangeCoverage: data.foreignExchangeCoverage === 'YES',
    pdf: data.pdf,
  };

  return data.processType === 'DUIMP'
    ? { ...base, processType: 'DUIMP', duimpNumber: data.duimpNumber, accessKey: data.accessKey }
    : { ...base, processType: 'DI', diNumber: data.diNumber, xml: data.xml };
}
