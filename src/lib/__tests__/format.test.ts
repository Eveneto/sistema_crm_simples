import { formatCurrency, formatCompactCurrency, formatPercentage, formatNumber } from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('deve formatar valor simples', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234');
      expect(result).toContain('56');
      expect(result).toContain('R$');
    });

    it('deve formatar zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
      expect(result).toContain('R$');
    });

    it('deve formatar valor grande', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1.000.000');
      expect(result).toContain('R$');
    });

    it('deve formatar valor negativo', () => {
      const result = formatCurrency(-500.5);
      expect(result).toContain('-');
      expect(result).toContain('500');
      expect(result).toContain('R$');
    });
  });

  describe('formatCompactCurrency', () => {
    it('deve formatar milhares', () => {
      const result = formatCompactCurrency(1234);
      expect(result).toContain('1,2');
      expect(result).toContain('R$');
      expect(result).toContain('mil');
    });

    it('deve formatar milhões', () => {
      const result = formatCompactCurrency(1500000);
      expect(result).toContain('1,5');
      expect(result).toContain('R$');
      expect(result).toContain('mi');
    });

    it('deve formatar bilhões', () => {
      const result = formatCompactCurrency(1000000000);
      expect(result).toContain('1');
      expect(result).toContain('R$');
      expect(result).toContain('bi');
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar percentual simples', () => {
      expect(formatPercentage(15.5)).toContain('15');
      expect(formatPercentage(15.5)).toContain('%');
    });

    it('deve formatar 100%', () => {
      expect(formatPercentage(100)).toContain('100');
      expect(formatPercentage(100)).toContain('%');
    });

    it('deve formatar zero', () => {
      expect(formatPercentage(0)).toContain('0');
      expect(formatPercentage(0)).toContain('%');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar número com separador', () => {
      expect(formatNumber(1234)).toContain('1.234');
    });

    it('deve formatar milhão', () => {
      expect(formatNumber(1000000)).toContain('1.000.000');
    });
  });
});
