export const runScraper = async () => {
  const startUrls = [
    'https://www.monad.xyz/',
    'https://docs.monad.xyz/'
  ];

  visited.clear();
  pageCount = 0;

  const outputStream = fs.createWriteStream('./scraping/monad.txt', { flags: 'w' });
  const staticContent = fs.readFileSync('../staticContent.txt', 'utf-8');
  outputStream.write(staticContent + '\n\n---\nLast scraped: ' + new Date().toISOString().split('T')[0] + '\n\n---\n');

  for (const url of startUrls) {
    await crawl(url, 0, 2, outputStream);
  }

  outputStream.end();
  console.log('\n🔄 monad.txt updated with new dynamic content and timestamp.');
};

async function crawl(url, depth = 0, maxDepth = 2, outputStream) {
  if (visited.has(url) || pageCount >= maxPages || depth > maxDepth) return;
  visited.add(url);
  pageCount++;

  const html = await fetchHTML(url);
  if (!html) return;

  const type = guessType(url);
  const content = extractText(type, html).trim().slice(0, 10000);

  outputStream.write(`URL: ${url}\nType: ${type}\nContent:\n${content}\n\n---\n`);
  console.log(`✅ Crawled (${pageCount}): ${url}`);

  const links = extractInternalLinks(url, html);
  for (const link of links) {
    await crawl(link, depth + 1, maxDepth, outputStream);
  }
}

runScraper()