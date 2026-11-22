---
name: ds-squad
description: Plan or run a data-science project with the squad protocol: gates, tickets, who owns what, and quality standards. Use when the user wants a project spec, a ticket, a delivery plan, or asks who should do a data-science task.
---

# Data-science squad protocol

**Gates, in order:** 0 business brief (Product Translator) -> 1 spec lock (SDS: target, split boundaries, metric, baseline) -> 2 architecture review (Principal DS, before heavy compute) -> 3 data contract (Data Engineer) -> 4 EDA and leakage check (Data Analyst) -> 5 model and serving build (ML Engineer) -> 6 adversarial audit (QA Critic; any [BLOCKER] freezes release) -> 7 final report and sign-off (SDS, Principal DS, then delivery).

**Ownership:** one writer per file. `data/raw/` is read-only. Data Engineer owns `src/data/` and `docs/DATA_CONTRACT.md`; Data Analyst owns `notebooks/` and `docs/EDA_SUMMARY.md`; ML Engineer owns `src/models/`, `src/api/`, `docs/MODEL_CARD.md` and the server inventory; QA Critic owns `tests/` and `docs/AUDIT_REPORT.md`.

**Ticket format:**
```text
[TICKET]
FROM: @Sender
TO: @Receiver
GATE: <0-7>
PRIORITY: <low | normal | urgent>
OBJECTIVE: <1-2 sentences>
INPUTS: <exact paths>
CONSTRAINTS: <split rules, memory limits, null handling>
DELIVERABLE: <script and markdown artefact paths>
```

**Standards:** fixed seed 42, fit transformers on training folds only, no hard-coded paths, typed Python 3.10+, pinned dependencies.

When asked for a spec or plan, give: target and horizon, validation split with explicit boundaries, primary metric and baseline, risks (leakage, imbalance), and the first three tickets.
