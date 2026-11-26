import type { AvailabilityQuery, AvailabilityResult } from "../types/availability";

export interface AvailabilityService {
  /**
   * Devuelve null para un restaurante desconocido y una lista vacía de horarios
   * para una consulta válida sin disponibilidad. Una consulta inválida se rechaza.
   */
  getAvailability(query: AvailabilityQuery): Promise<AvailabilityResult | null>;
}
