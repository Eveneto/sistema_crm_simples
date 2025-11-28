'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import Papa from 'papaparse';

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({
  endpoint,
  filename,
  label = 'Exportar CSV',
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Buscar dados do endpoint
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados para exportação');
      }

      const result = await response.json();

      if (!result.data || result.data.length === 0) {
        alert('Não há dados para exportar');
        return;
      }

      // Converter para CSV usando papaparse
      const csv = Papa.unparse(result.data, {
        quotes: true,
        delimiter: ',',
        header: true,
      });

      // Criar blob e fazer download
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.info('Exportação realizada com sucesso', {
        endpoint,
        filename,
        count: result.count,
      });
    } catch (error) {
      logger.error('Erro ao exportar dados:', { error, endpoint });
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant={variant} size={size}>
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
