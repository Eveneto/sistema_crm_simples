/**
 * Sistema de Logging Estruturado
 *
 * Logger que só exibe em desenvolvimento e pode ser integrado
 * com serviços externos (Sentry, LogRocket, etc.) em produção.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Log de erro crítico
   */
  error(message: string, context?: LogContext): void {
    if (this.isTest) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, context || '');
    } else {
      // Em produção, enviar para serviço de monitoramento
      this.sendToMonitoring('error', message, context);
    }
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext): void {
    if (this.isTest) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext): void {
    if (this.isTest) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, context || '');
    } else {
      this.sendToMonitoring('info', message, context);
    }
  }

  /**
   * Log de debug (apenas desenvolvimento)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Enviar logs para serviço de monitoramento em produção
   * (Sentry, LogRocket, Datadog, etc.)
   */
  private sendToMonitoring(_level: LogLevel, _message: string, _context?: LogContext): void {
    // TODO: Integrar com serviço de monitoramento
    // Exemplo com Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureMessage(_message, {
    //     level: _level,
    //     extra: _context,
    //   });
    // }
    // Por enquanto, apenas armazena em memória (pode ser enviado em batch)
    // Em produção real, você deve configurar Sentry ou similar
  }
}

export const logger = new Logger();
