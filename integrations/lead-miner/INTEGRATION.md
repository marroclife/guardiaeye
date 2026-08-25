# LEAD-Minner ↔ Nexus AI Integration

## Overview

O LEAD-Minner foi integrado como um **módulo de aquisição de leads** dentro do ecossistema NEXO's Eye (Nexus AI).

Ele funciona como um pipeline independente que:
1. **Minera** leads de alta ticket (hospedagem de luxo) via Google Places API.
2. **Qualifica** com Ollama Cloud (modelos `gemma4:31b-cloud` / `kimi-k2.5:cloud`).
3. Permite que o usuário **selecione** os leads desejados.
4. **Envia** os leads selecionados diretamente para a tabela `public.leads` do Nexus AI, entrando no status `triagem`.

## Estrutura

```
projects/nexos-eye/
├── integrations/
│   └── lead-miner/          ← LEAD-Minner integrado
│       ├── src/lib/nexus-bridge.ts   ← ponte com Supabase
│       ├── src/lib/ollama-qualifier.ts  ← qualificação via Ollama
│       ├── api/index.ts              ← entrypoint Vercel (Express bundle)
│       ├── server.ts                 ← servidor local/dev
│       ├── src/App.tsx               ← UI de seleção/envio
│       ├── src/components/LeadsTable.tsx
│       └── .env                      ← credenciais (não commitar)
├── supabase/migrations/     ← schema do Nexus
└── src/                     ← CRM Nexus
```

## Endpoints Adicionados

- `GET /api/health` — Verifica configuração de Ollama e Google Maps.
- `GET /api/nexus/health` — Verifica conexão com o Supabase do Nexus.
- `POST /api/leads/export-to-nexus` — Recebe array de `leadIds` e insere na tabela `public.leads`.

## URLs de Produção

- **Aplicativo:** `https://lead-miner-seven.vercel.app`
- **Vercel Project:** `marrocs-projects/lead-miner`

## Variáveis de Ambiente

Adicionadas em `.env`:

```
GOOGLE_MAPS_API_KEY="..."
OLLAMA_CLOUD_API_KEY="..."          # chave da Ollama Cloud
OLLAMA_MODEL="gemma4:31b-cloud"
OLLAMA_FALLBACK_MODEL="kimi-k2.5:cloud"

NEXUS_SUPABASE_URL="https://jifjcajdzpwqttgkswyp.supabase.co"
NEXUS_SUPABASE_SERVICE_KEY="..."
```

> Atenção: a `service_role` key e a `OLLAMA_CLOUD_API_KEY` nunca devem ser commitadas. Elas só são usadas no backend.

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

2. Instalar dependências:
   ```bash
   npm install
   ```

3. Configurar `.env` com as chaves.

4. Rodar localmente:
   ```bash
   npm run dev
   ```

5. Acessar `http://localhost:3000`.

6. Clicar em **Run Search** para minerar leads.

7. Selecionar os leads desejados com os checkboxes.

8. Clicar em **Enviar para Nexus AI** na barra flutuante.

9. Os leads aparecerão automaticamente na triagem do Nexus AI CRM.

## Deploy

```bash
cd projects/nexos-eye/integrations/lead-miner
vercel --prod
```

Build local:
```bash
npm run build
```

## Testes Realizados

- Data: 2026-08-25
- Deploy: `https://lead-miner-seven.vercel.app`
- Busca Google Places: ✅ retorna 20 leads reais de Tulum.
- Exportação para Nexus: ✅ lead "Islamorada Coral Villa Club" inserido com sucesso.

## Próximos Passos Sugeridos

1. Adicionar `OLLAMA_CLOUD_API_KEY` na Vercel para ativar qualificação por IA.
2. Expandir a constraint `source` do Nexus para aceitar valores como `'lead-miner'`.
3. Adicionar campos novos no schema do Nexus para capturar metadados ricos do LEAD-Minner.
4. Criar job automático/heartbeat para minerar hubs periodicamente.
