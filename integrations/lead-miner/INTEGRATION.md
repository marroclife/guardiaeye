# LEAD-Minner ↔ Nexus AI Integration

## Overview

O LEAD-Minner foi integrado como um **módulo de aquisição de leads** dentro do ecossistema NEXO's Eye (Nexus AI).

Ele funciona como um pipeline independente que:
1. **Minera** leads de alta ticket (hospedagem de luxo) via Google Places API.
2. **Qualifica** com Gemini (diagnóstico de dor, perda estimada, stack detectado).
3. Permite que o usuário **selecione** os leads desejados.
4. **Envia** os leads selecionados diretamente para a tabela `public.leads` do Nexus AI, entrando no status `triagem`.

## Estrutura

```
projects/nexos-eye/
├── integrations/
│   └── lead-miner/          ← LEAD-Minner integrado
│       ├── src/lib/nexus-bridge.ts   ← ponte com Supabase
│       ├── server.ts                   ← rotas de API
│       ├── src/App.tsx                 ← UI de seleção/envio
│       ├── src/components/LeadsTable.tsx
│       └── .env                        ← credenciais
├── supabase/migrations/     ← schema do Nexus
└── src/                     ← CRM Nexus
```

## Endpoints Adicionados

- `GET /api/nexus/health` — Verifica se a conexão com o Supabase do Nexus está configurada.
- `POST /api/leads/export-to-nexus` — Recebe um array de `leadIds` e insere os leads na tabela `public.leads` do Nexus.

## Variáveis de Ambiente

Adicionadas em `.env`:

```
NEXUS_SUPABASE_URL="https://jifjcajdzpwqttgkswyp.supabase.co"
NEXUS_SUPABASE_SERVICE_KEY="<service_role_key>"
```

> Atenção: a `service_role` key nunca deve ser commitada. Ela só é usada no backend.

## Mapeamento de Campos

| LEAD-Minner            | Nexus AI (`public.leads`) |
|------------------------|----------------------------|
| `name`                 | `name`, `company`          |
| `category`             | `role`                     |
| `phone`                | `phone`                    |
| `website`              | `website`                  |
| `priority` (HIGH/MED)  | `priority` (high/medium)   |
| `painPoint` + `estimatedLoss` + `techStackDetected` | `ai_summary` |
| `mapsUrl`, pitches, notas | `obs`                   |
| fixo                   | `status` = `triagem`       |
| fixo                   | `source` = `manual`*       |

\* O schema atual do Nexus restringe a coluna `source`. A origem real ("LEAD-Minner") é registrada dentro do campo `obs`.

## Como Usar

1. Entrar na pasta:
   ```bash
   cd projects/nexos-eye/integrations/lead-miner
   ```

2. Instalar dependências (já feito):
   ```bash
   npm install
   ```

3. Configurar `.env` com `GOOGLE_MAPS_API_KEY`, `GEMINI_API_KEY` e `NEXUS_SUPABASE_SERVICE_KEY`.

4. Rodar o servidor:
   ```bash
   npm run dev
   ```

5. Acessar `http://localhost:3000`.

6. Clicar em **Run Search** para minerar leads.

7. Selecionar os leads desejados com os checkboxes.

8. Clicar em **Enviar para Nexus AI** na barra flutuante.

9. Os leads aparecerão automaticamente na triagem do Nexus AI CRM.

## Teste Realizado

Data: 2026-08-25
Lead enviado: `Villa Paraiso Papagayo` (Guanacaste, Costa Rica)
ID no Nexus: `33cc48bf-c148-428e-8657-c647dc958643`
Status: `triagem` | Prioridade: `high`

## Próximos Passos Sugeridos

1. Expandir a constraint `source` do Nexus para aceitar valores como `'lead-miner'`, `'eye-landing'`, `'manual'`, etc.
2. Adicionar campos novos no schema do Nexus para capturar metadados ricos do LEAD-Minner (ex: `maps_url`, `google_rating`, `pain_point`, `estimated_loss`).
3. Criar um job automático/heartbeat para minerar hubs periodicamente.
