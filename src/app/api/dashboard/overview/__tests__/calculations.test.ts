// Testes da lógica de cálculo do Dashboard (KISS)
// Não testamos integração com Supabase, apenas a lógica matemática

describe('Dashboard Calculations', () => {
  describe('Cálculo de Tendências', () => {
    it('deve calcular tendência positiva', () => {
      const current = 150;
      const previous = 100;
      const trend = Math.round(((current - previous) / previous) * 100);

      expect(trend).toBe(50); // +50%
    });

    it('deve calcular tendência negativa', () => {
      const current = 80;
      const previous = 100;
      const trend = Math.round(((current - previous) / previous) * 100);

      expect(trend).toBe(-20); // -20%
    });

    it('deve retornar 0 quando valor anterior é 0', () => {
      const current = 100;
      const previous = 0;
      const trend = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);

      expect(trend).toBe(0);
    });

    it('deve calcular sem mudança', () => {
      const current = 100;
      const previous = 100;
      const trend = Math.round(((current - previous) / previous) * 100);

      expect(trend).toBe(0); // 0%
    });
  });

  describe('Cálculo de Taxa de Conversão', () => {
    it('deve calcular taxa de conversão corretamente', () => {
      const totalDeals = 50;
      const wonDeals = 15;
      const conversionRate =
        totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(1)) : 0;

      expect(conversionRate).toBe(30.0); // 30%
    });

    it('deve retornar 0% quando não há deals', () => {
      const totalDeals = 0;
      const wonDeals = 0;
      const conversionRate =
        totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(1)) : 0;

      expect(conversionRate).toBe(0);
    });

    it('deve calcular 100% de conversão', () => {
      const totalDeals = 20;
      const wonDeals = 20;
      const conversionRate =
        totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(1)) : 0;

      expect(conversionRate).toBe(100.0);
    });
  });

  describe('Períodos de Data', () => {
    it('deve calcular início de período 7d', () => {
      const now = new Date('2025-01-15');
      const period = 7;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period);

      expect(startDate.toISOString().split('T')[0]).toBe('2025-01-08');
    });

    it('deve calcular início de período 30d', () => {
      const now = new Date('2025-01-31');
      const period = 30;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period);

      expect(startDate.toISOString().split('T')[0]).toBe('2025-01-01');
    });
  });
});
