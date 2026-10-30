// fx.js: public-safe entry point. It tries to load optional modules if they exist,
// then boots the office scene in a way that works even when no host app is present.
try {
  await import('./pro.js');
} catch (err) {
  console.info('No pro.js module loaded; continuing without it.', err);
}

try {
  await import('./byok.js');
} catch (err) {
  console.info('No byok.js module loaded; continuing without it.', err);
}

await import('./scene.js');
