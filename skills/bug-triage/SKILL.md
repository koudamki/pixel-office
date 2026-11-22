---
name: bug-triage
description: Diagnose software bugs, TypeScript or runtime errors and failing tests systematically. Use when the user shares a stack trace, an error message or code that behaves wrongly.
---

# Bug triage

1. State the observed failure and the suspected boundary in one or two lines.
2. List the top two or three root causes, ranked by likelihood, each tied to evidence in the code or error.
3. Give the smallest fix or check first, before any broad rewrite. Show it as a code block.
4. Call out edge cases and side effects.
5. If key information is missing (version, input, full trace), say exactly what to send.
