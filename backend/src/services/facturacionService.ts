import { facturacionRepository } from '../repositories/facturacionRepository';

export const facturacionService = {
  async getResumen() {
    return facturacionRepository.getResumen();
  },
};
