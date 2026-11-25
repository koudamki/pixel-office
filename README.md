# Pixel Office

A living isometric pixel office: main office, corridor, meeting room, server room and cafeteria, with a day-and-night cycle, a squad of data-science agents and an Ask AI assistant.

Built on [Claude-Office](https://github.com/W17ant/Claude-Office) by W17ANT (MIT licence, kept in `LICENSE`, credits in `NOTICE.md`). The new furniture sprites, the data-science squad, the meeting gathering, the repairable server room, the Ask AI panel and the hosting setup are added on top.

## Run it
```bash
npm ci --ignore-scripts
npm run build      # type-check and build into dist/
npx vitest run     # tests
```
The hosted site starts in the built-in simulation. Add `?sim&rooms=all` to any address to force it.

## Ask AI
`public/ai.js` is the chat panel and `api/ask.js` the server function. Without a key it answers from Wikipedia. With `GROQ_API_KEY` set in Vercel (or a key pasted in the panel) it splits a question into searches, runs them together and answers with tables.

## Security
Headers and caching are set in `vercel.json`. See `SECURITY.md`.
