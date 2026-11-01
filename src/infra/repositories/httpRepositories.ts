import type { NewEndorsement } from '@/domain/entities';
import type {
  AuthRepository,
  CustomsBrokerRepository,
  DashboardRepository,
  DocumentRepository,
  DtaRepository,
  EndorsementRepository,
} from '@/domain/repositories';
import { unmask } from '@/domain/validation/masks';
import type { HttpClient } from '../http/httpClient';

export const createAuthRepository = (http: HttpClient): AuthRepository => ({
  login: (email, password) => http.post('/auth/login', { email, password }),
});

export const createDtaRepository = (http: HttpClient): DtaRepository => ({
  findByNumber: (number) => http.get(`/dtas/${unmask(number)}`),
});

export const createCustomsBrokerRepository = (http: HttpClient): CustomsBrokerRepository => ({
  list: () => http.get('/customs-brokers'),
});

function toFormData(data: NewEndorsement): FormData {
  const form = new FormData();
  form.append('dta', data.dta);
  form.append('processType', data.processType);
  form.append('customsBrokerId', data.customsBrokerId);
  form.append('foreignExchangeCoverage', String(data.foreignExchangeCoverage));
  if (data.referenceCode) form.append('referenceCode', data.referenceCode);
  form.append('pdf', data.pdf);

  if (data.processType === 'DUIMP') {
    form.append('duimpNumber', data.duimpNumber);
    form.append('accessKey', data.accessKey);
  } else {
    form.append('diNumber', data.diNumber);
    form.append('xml', data.xml);
  }
  return form;
}

export const createEndorsementRepository = (http: HttpClient): EndorsementRepository => ({
  submit: (data) => http.post('/endorsements', toFormData(data)),
  getStatus: (id) => http.get(`/endorsements/${id}/status`),
});

export const createDocumentRepository = (http: HttpClient): DocumentRepository => ({
  search: (term) => http.get(`/documents?q=${encodeURIComponent(unmask(term))}`),
  downloadFile: (fileId) => http.blob(`/files/${fileId}`),
});

export const createDashboardRepository = (http: HttpClient): DashboardRepository => ({
  getStats: () => http.get('/dashboard/stats'),
});
