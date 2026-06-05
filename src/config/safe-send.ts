/**
 * 🛡️ SAFE SEND — Wrapper de envio de mensagens com guard automático.
 * 
 * SEMPRE use este helper ao invés de chamar `message` diretamente.
 * Ele checa a classificação do target antes de enviar.
 * 
 * USO CORRETO:
 *   import { safeSend } from '@/config/safe-send';
 *   
 *   // Caso 1: target é o Marroc (responde direto)
 *   await safeSend({
 *     target: '+5521990387232',
 *     message: 'Tô aqui!',
 *     motivo: 'Resposta ao Marroc',
 *   });
 *   
 *   // Caso 2: target é família/equipe/cliente (bloqueia sem aprovação)
 *   const result = await safeSend({
 *     target: '+55 21 99996-6785',  // Dona Selma
 *     message: 'Oi mãe!',
 *     motivo: 'Saudação diária',
 *   });
 *   // result.allowed === false
 *   // result.reason explica por quê
 *   
 *   // Caso 3: target é cliente e Marroc aprovou explicitamente
 *   await safeSend({
 *     target: '+5522999336645',
 *     message: 'Oi Luiz',
 *     motivo: 'Aviso operacional',
 *     aprovadoPorMarroc: true,  // ← OBRIGATÓRIO pra clientes/equipe
 *   });
 */

import { classify, guardOutbound, CamadaRemetente } from './communication-rules';

export interface SafeSendParams {
  target: string;
  message: string;
  motivo: string;  // Por que tá enviando?
  aprovadoPorMarroc?: boolean;  // Só true se Marroc disse "pode mandar" explicitamente
  channel?: 'whatsapp' | 'telegram' | string;
}

export interface SafeSendResult {
  allowed: boolean;
  reason: string;
  camada: CamadaRemetente;
  blocked: boolean;
  sentAt?: string;
}

export async function safeSend(params: SafeSendParams): Promise<SafeSendResult> {
  const { target, message, motivo, aprovadoPorMarroc = false, channel = 'whatsapp' } = params;
  
  // 1. Classifica o target
  const classification = classify(target);
  
  // 2. Roda o guard
  const guard = guardOutbound(target, motivo, aprovadoPorMarroc);
  
  // 3. Se bloqueado, NÃO envia. Reporta.
  if (!guard.allowed) {
    // Log da tentativa bloqueada (audit trail)
    console.warn(`[safeSend BLOQUEADO] target=${target} camada=${classification.camada} motivo="${motivo}" aprovado=${aprovadoPorMarroc}`);
    
    return {
      allowed: false,
      reason: guard.reason,
      camada: classification.camada,
      blocked: true,
    };
  }
  
  // 4. Se permitido, chama a tool `message` real
  // (aqui a integração real seria via message tool, mas o helper retorna o "ok"
  // pra o chamador fazer a chamada)
  return {
    allowed: true,
    reason: guard.reason,
    camada: classification.camada,
    blocked: false,
    sentAt: new Date().toISOString(),
  };
}

/**
 * Helper rápido pra reportar uma tentativa bloqueada.
 * Chama isso quando o safeSend retornar blocked: true.
 */
export function reportBlocked(params: SafeSendParams, result: SafeSendResult): string {
  return `🚨 ENVIO BLOQUEADO pelo guard de comunicação

**Camada:** ${result.camada}
**Target:** ${params.target}
**Motivo declarado:** ${params.motiv}
**Mensagem:** "${params.message.substring(0, 100)}${params.message.length > 100 ? '...' : ''}"

**Por que bloqueou:** ${result.reason}

**Ação necessária:** Marroc precisa aprovar explicitamente com `aprovadoPorMarroc: true` se a mensagem for legítima.`;
}
