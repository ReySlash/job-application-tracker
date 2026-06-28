if (process.env.NODE_ENV !== 'production') {
  const { config: loadEnv } = await import('dotenv');
  const { dirname, resolve } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const currentDir = dirname(fileURLToPath(import.meta.url));

  loadEnv({
    path: resolve(currentDir, '../.env'),
  });
}