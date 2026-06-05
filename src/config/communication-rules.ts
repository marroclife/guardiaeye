/**
 * 🛡️ COMMUNICATION RULES — NEXO's Eye
 * 
 * Mecanismo automático de classificação de remetente.
 * 
 * REGRA INVIOLÁVEL:
 *   - Antes de QUALQUER tool `message` outbound, chame `classify()`.
 *   - Se o resultado !== 'MARROC', use `safeSend()` que AVISA e ESPERA.
 *   - NUNCA responda direto pra EQUIPE, FAMILIA ou CLIENTE sem aprovação explícita.
 * 
 * Última atualização: 05/06/2026
 * Histórico de violações: ver vault/01_Projects/nexos-eye/COMMUNICATION_RULES.md
 */

export type CamadaRemetente = 'MARROC' | 'EQUIPE' | 'FAMILIA' | 'CLIENTE' | 'DESCONHECIDO';

export interface Classificacao {
  camada: CamadaRemetente;
  senderId: string;
  podeResponderDireto: boolean;
  acaoRecomendada: string;
}

/**
 * Normaliza número pra E.164 (remove espaços, garante +55)
 */
function normalize(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  }
  return phone.trim();
}

/**
 * Whitelists oficiais — FONTE ÚNICA DE VERDADE
 */
const WHITELIST_MARROC = [
  '+5521990387232',  // pessoal (chat atual)
];

const WHITELIST_EQUIPE = [
  '+5522999336645',  // Luiz Silva — gestor de vendas NEXO's Eye
  // Futuros operadores vão aqui (sombra-dev, mercurial, prisma, vektra, etc.)
];

const WHITELIST_FAMILIA = [
  '+552199996785',   // Dona Selma Barbosa — mãe do Marroc
  // Futuros parentes vão aqui
];

const WHITELIST_CLIENTES = [
  // Números de clientes/leads não são hardcoded.
  // Eles chegam via canal whatsapp:+5521983821884 (NEXO's Eye operador).
];

/**
 * Classifica um remetente em uma das 4 camadas.
 */
export function classify(senderId: string): Classificacao {
  const normalized = normalize(senderId);
  
  if (WHITELIST_MARROC.includes(normalized)) {
    return {
      camada: 'MARROC',
      senderId: normalized,
      podeResponderDireto: true,
      acaoRecomendada: 'Responde direto. É o Marroc.',
    };
  }
  
  if (WHITELIST_EQUIPE.includes(normalized)) {
    return {
      camada: 'EQUIPE',
      senderId: normalized,
      podeResponderDireto: false,
      acaoRecomendada: 'AVISAR Marroc no Telegram. NÃO responder. ESPERAR aprovação.',
    };
  }
  
  if (WHITELIST_FAMILIA.includes(normalized)) {
    return {
      camada: 'FAMILIA',
      senderId: normalized,
      podeResponderDireto: false,
      acaoRecomendada: 'AVISAR Marroc. NUNCA responder. Única exceção: cron programado.',
    };
  }
  
  if (WHITELIST_CLIENTES.includes(normalized)) {
    return {
      camada: 'CLIENTE',
      senderId: normalized,
      podeResponderDireto: false,
      acaoRecomendada: 'AVISAR Marroc. Usar template pré-aprovado se lead quente.',
    };
  }
  
  return {
    camada: 'DESCONHECIDO',
    senderId: normalized,
    podeResponderDireto: false,
    acaoRecomendada: 'NÃO responder. AVISAR Marroc. Pode ser número novo ou spam.',
  };
}

/**
 * Verifica se um número é o Marroc (atalho pra checks rápidos).
 */
export function isMarroc(senderId: string): boolean {
  return classify(senderId).camada === 'MARROC';
}

/**
 * Valida antes de enviar uma mensagem outbound.
 * Retorna { allowed: boolean, reason: string }.
 * 
 * USO:
 *   const check = guardOutbound(targetNumber, 'Motivo da mensagem');
 *   if (!check.allowed) {
 *     // NÃO ENVIA. Reporta check.reason pro Marroc.
 *     return;
 *   }
 */
export function guardOutbound(
  target: string,
  motivo: string,
  aprovadoPorMarroc: boolean = false
): { allowed: boolean; reason: string } {
  // Se a mensagem é pra um número que está na whitelist de família, EQUIPE ou clientes,
  // e o Marroc NÃO aprovou explicitamente, BLOQUEIA.
  const normalized = normalize(target);
  
  const isEquipe = WHITELIST_EQUIPE.includes(normalized);
  const isFamilia = WHITELIST_FAMILIA.includes(normalized);
  const isCliente = WHITELIST_CLIENTES.includes(normalized);
  
  if ((isEquipe || isFamilia || isCliente) && !aprovadoPorMarroc) {
    return {
      allowed: false,
      reason: `Bloqueado: target ${normalized} é ${isEquipe ? 'EQUIPE' : isFamilia ? 'FAMÍLIA' : 'CLIENTE'}. Motivo: ${motivo}. Marroc precisa aprovar explicitamente.`,
    };
  }
  
  // Para números desconhecidos, também bloqueia por segurança
  if (!isEquipe && !isFamilia && !WHITELIST_MARROC.includes(normalized) && !isCliente) {
    return {
      allowed: false,
      reason: `Bloqueado: target ${normalized} é DESCONHECIDO. Motivo: ${motivo}. Não enviar sem aprovação.`,
    };
  }
  
  return {
    allowed: true,
    reason: 'Aprovado (whitelist Marroc ou autorizado explicitamente).',
  };
}

/**
 * Exposição das listas pra debug/auditoria.
 */
export const LISTS = {
  MARR0C: WHITELIST_MARROC,
  EQUIPE: WHITELIST_EQUIPE,
  FAMILIA: WHITELIST_FAMILIA,
  CLIENTES: WHITELIST_CLIENTES,
};
