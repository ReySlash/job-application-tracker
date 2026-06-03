import './load-env.js';
import { createApp } from './app.js';
import { startDemoUserCleanupScheduler } from './demo/demo-cleanup-scheduler.js';

const DEFAULT_PORT = 4000;
const port = Number(process.env.PORT || DEFAULT_PORT);

const app = createApp();
startDemoUserCleanupScheduler();

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
