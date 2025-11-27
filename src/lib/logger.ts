/**
 * Sistema de Logging Estruturado
 *
 * - Development: Console com cores e detalhes
 * - Production: Apenas erros críticos (preparado para Sentry/LogRocket)
 */

interface LogContext {
  [key: string]: unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('🔍 [DEBUG]', message, context || '');
    }
  }

  /**
   * Log informativo (apenas em desenvolvimento)
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info('ℹ️ [INFO]', message, context || '');
    }
  }

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ [WARN]', message, context || '');
    }
  }

  /**
   * Log de erro (sempre registra, mas protege detalhes em produção)
   */
  error(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error('❌ [ERROR]', message, context || '');
    } else {
      // Em produção: apenas mensagem sem detalhes sensíveis
      // eslint-disable-next-line no-console
      console.error('[ERROR]', message);

      // TODO: Integrar com serviço de monitoramento
      // Sentry.captureException(new Error(message), { extra: context });
      // LogRocket.captureException(new Error(message), { extra: context });
    }
  }

  /**
   * Log de erro crítico (sempre registra)
   */
  critical(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.error('🚨 [CRITICAL]', message, context || '');

    // TODO: Alertar equipe (Slack, PagerDuty, etc)
  }
}

export const logger = new Logger();
