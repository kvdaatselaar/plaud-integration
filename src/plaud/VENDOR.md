# Vendored from plaud-toolkit

Source: https://github.com/sergivalverde/plaud-toolkit/tree/main/packages/core

This directory contains files copied from the `@plaud/core` package of
`plaud-toolkit` by Sergi Valverde. The upstream project declares itself
as an unofficial, public TypeScript toolkit. Minor modifications made
here (stricter `any` on fetch JSON result) are noted inline.

Keep this directory in sync manually when upstream changes; re-copy the
5 source files from `packages/core/src/`.

Additions in this repo (not upstream), marked inline in `client.ts` and `types.ts`: `getTaskInfo`,
`listFileTasks`, `getRecentLanguages`, `getRemainingTranscriptionSeconds`, `startTranscription` (the web
app's "Generate": `POST /ai/transsumm/{id}`) and `saveTranscriptionResult` (what the web app does when a
task it started completes: `POST /ai/update_note_info` per note and `PATCH /file/{id}`), with the
`PlaudTaskInfo`, `PlaudFileTasks` and `PlaudTranscribeOptions` types.
