# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Sales automation system for **Bambu Tech Services** (CGO: Roberto Esparza). The "codebase" consists of JavaScript Code Nodes for n8n, importable n8n workflow JSONs, HTML email templates, and setup guides. There is no build system, package manager, or test runner.

**Stack:** Pipedrive CRM → n8n Cloud → Claude AI + Gmail SMTP + Google Sheets

## Deploying changes to n8n

Code Node JS files are **not auto-synced** to n8n. After editing a `.js` file, deploy via n8n REST API:

```bash
# Get workflow JSON, update the Code node's source, then PUT it back
curl -X PUT "https://bambu-techservices.app.n8n.cloud/api/v1/workflows/{WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: <token from MEMORY.md>" \
  -H "Content-Type: application/json" \
  -d @Workflows/WF-XX-n8n.json
```

Alternatively, copy-paste the JS content directly into the n8n UI Code node.

**Important:** After an n8n UI save, manually-deployed code may be reverted. Re-apply via API if this happens (documented for WF-01 Decay fix).

## Workflow architecture

Each workflow lives in `Workflows/` with these files:

| File pattern | Purpose |
|---|---|
| `WF-XX-Code-Node.js` | JavaScript for the n8n Code node (Run Once for All Items) |
| `WF-XX-n8n.json` | Full workflow export — import into n8n or deploy via API |
| `WF-XX-Setup-Guide.md` | Step-by-step setup, Pipedrive field keys, Sheet IDs |
| `WF-XX-Claude-Prompt.md` | Claude prompts used inside the workflow (if applicable) |
| `Templates/` | HTML email templates (T1, T5, T6...) |

## Workflow status and n8n IDs

| Workflow | n8n ID | Status | Schedule |
|---|---|---|---|
| WF-01 Score Engine | `iVwOKx4u2DfTIEh1` | ✅ Production | Pipedrive webhook |
| WF-01 Decay Engine | `ZoLNIwz4JXGGBZsA` | ✅ Production | Daily 7am CDMX |
| WF-01B Batch Score | `SyiRAjgRg4zuBwrI` | ✅ Active | Manual |
| WF-03 Deal Alerts | `6TPI34SWpI7ZXwBW` | ✅ Production | Mon/Wed/Fri 8am CDMX |
| WF-08 Coaching Digest | `WWDuIRSoSYVMEAe9` | ✅ Production | Fri 5pm CDMX |
| WF-10 ANALYSIS | `RZZUNgV1phne8pfe` | ✅ Active | Manual |
| WF-10A Intel Brief | `rn5jxvlxxxmQ3ih8` | ✅ Active | Mon-Fri 6:30am CDMX |
| WF-10B Campaign Creator | `gdbczgw1BIYHIxiT` | 🟡 Pending activation | On Sheet approval |
| WF-10B Engagement Handler | `RGcc5DjDxqOu2i2O` | ✅ Active | Realtime |
| WF-10C Inbound Lead | `HlsRw5eE5AgAcmiP` | ✅ Active | Realtime webhook |
| WF-11 Phase 1 | `schcpIQOT95s9EB7` | ✅ Tested | Mon 8am CDMX (schedule inactive — pending activation) |
| WF-11 Phase 2 | `ndXrVQTykWbnErwW` | ⏳ Pending test | Every 5 min polling |
| WF-02 Outbound | — | ⏳ In development | — |

## Pipedrive config

- **Subdomain:** `bambumobile`
- **Pipeline ID:** `1`
- **Stage IDs:** `8`=MQL, `1`=Lead In BANT, `2`=Presentar Credenciales, `3`=Taller Requerimientos, `4`=Realizando Propuesta, `16`=Propuesta Enviada, `5`=Negociaciones, `9`=Calientes, `7`=Re-contactar
- **All team emails:** `@bambu-techservices.com` (legacy `@bambu-mobile.com` no longer works since 2026-04-10)
- **CGO user_id:** `14406657`

## n8n Code Node conventions

- **Mode:** Always `Run Once for All Items`
- **No imports:** Code Nodes run in a sandboxed JS environment — no `require()`, no npm packages
- **Output:** Must `return` an array of objects: `return [{ json: { ... } }]`
- **n8n expression access:** Use `$input.all()`, `$input.first()`, `$('NodeName').all()` — not DOM APIs
- **Post-Aggregate pattern:** After an Aggregate node, there is only 1 item with shape `{ field: [...] }`. Use `$input.first().json.field` (not `$input.all()` iterating individual items). This was the root cause of the WF-11 BuildCGOSummary bug.

## Google Sheets (active)

| Sheet name | Tab | Used by |
|---|---|---|
| `WF-03 Alert Log - Bambu` | Alertas | WF-03 |
| `WF-01 Lead Scoring Log` | Score, Decay | WF-01 |
| `WF-10 Campaign Engine - Bambu` (`1j6W7-gNrOmMrPNLG1UVPIcnaV3Z90qDRSocXMC8rGko`) | Intel Briefs, Campañas, Inbound Leads, Análisis CRM | WF-10A/B/C |
| `WF-11 Re-engagement Queue — Bambu` (`1QalHM3z6Ga4LiJtQXF3pVkb8THl3eUpNzZtaKtByZ18`) | Re-engagement Queue | WF-11 |

## n8n emailSend v2.1 gotcha

The `Send Email` node v2.1 in this n8n instance uses field `html` for the body, **not** `message`. This affects all 5 WF-10 workflows and WF-11.

## Lusha enrichment (WF-01)

Lusha is **active** as of 2026-06-11. The `Prepare Lusha` node was fixed with 3 bugs:

1. **`LUSHA_ENABLED` flag removed** — was hardcoded `false` since April. Flag no longer exists; enrichment runs automatically.
2. **Domain extraction** — `org.cc_email` is always `bambumobile@pipedrivemail.com` (Pipedrive's internal BCC address) for every Bambu deal. This blocked the fallback to the contact's email domain. Fix: extract domain from `person.email[0].value` first; only fall back to `org.cc_email` if it's not `pipedrivemail.com`.
3. **Pipedrive option ID type** — Pipedrive returns Single Option field values as **strings** (`'153'`, `'154'`), never as numbers. Strict equality `=== 154` always failed. Fix: use `String(lushaVal) === '154'`.

**Validation script:** `Workflows/test-lusha-validation.py` — tests 3 levels: direct Lusha API, end-to-end webhook trigger, and Pipedrive field verification. Run with:
```bash
python3 Workflows/test-lusha-validation.py --deal-id <ID>   # specific deal
python3 Workflows/test-lusha-validation.py --only-api        # API connectivity only
```

**Pipedrive gotcha (general):** All Single Option field values come back as strings from the API. Always use `String(val)` or `== ` (loose) when comparing option IDs.

## Batch outbound scripts (local only, excluded from git)

Two Python scripts exist locally in `Workflows/` but are in `.gitignore` because they contain Gmail App Password credentials:

- **`batch-mql-campaign.py`** — Scores all unscored MQL deals via Pipedrive API, then sends T6 email to eligible leads.
  - `--score`: pulls all 710 MQL deals, scores unscored ones, writes score to Pipedrive custom fields
  - `--send --dry-run`: previews which leads would receive email (filter: `lead_score > 12`)
  - `--send`: sends T6-gayosso-campaign.html from `roberto.esparza@bambu-techservices.com`, CC to assigned rep
  - Scoring is a behavioral proxy (activities, emails, last_activity_date) + firmographic keyword matching — no extra API calls per deal
  - **MQL outbound threshold is score > 12** (not the standard Tibio threshold of >26 — MQL cold leads without Lusha enrichment cluster at 8–22)
  - `infer_servicio()` maps company name keywords to 8 industry-specific service descriptions (Financial, Retail, Manufacturing, Health, Logistics, Food, Hospitality, General)

- **`test-lusha-validation.py`** — Lusha integration validator (see Lusha section above)

## Email templates

Located in `Workflows/Templates/`:

| Template | Purpose |
|---|---|
| `T1-newsletter-intel.html` | Weekly intel newsletter |
| `T5-nurturing-welcome.html` | Welcome nurturing sequence |
| `T6-gayosso-campaign.html` | Cold outbound — Gayosso case study as social proof. Subject: "Cómo Gayosso transformó su tecnología — ¿y [Empresa]?" |
| `T6-reactivacion.html` | Re-engagement for dormant deals |

Templates use `{{PLACEHOLDER}}` style variables replaced in Python scripts or n8n Set nodes before sending.

## Vercel deployment (Guía Visual)

`Guia-Visual-Sistema-Automatizacion-v1.0.html` is deployed to Vercel via GitHub integration on the `main` branch. Auto-deploys on every push to `main`.

- **`vercel.json`**: rewrites `/` → the HTML file; adds security headers
- **`.vercelignore`**: excludes all `.md` files, `Workflows/`, `KickOff/`, `Plan de Comisiones BDRs/` from the public deploy — only the HTML guide is publicly accessible
- To update the live guide: edit the HTML, merge to `main`, Vercel deploys automatically
