// scheduler.js
import cron from 'node-cron';
import { runScraper } from './scraper.js';
import { embedFullFile } from './embed.js';




console.log('⏳ Scheduler started...');

// Every Monday at 9:00 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('🔁 Starting weekly Monad scrape...');
  await runScraper();
  await embedFullFile()
  console.log('✅ Weekly scrape and embeddings completed.');
});
