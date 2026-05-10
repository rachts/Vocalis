const puppeteer = require('puppeteer');

/**
 * Uses a headless browser to search the web and extract the top snippets.
 * @param {string} query The search query
 * @returns {Promise<string>} Combined text from the top search results
 */
async function searchWebAndSummarize(query) {
  let browser = null;
  try {
    console.log(`BrowserAgent: Searching for "${query}"`);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // We use DuckDuckGo HTML version for fast, easy scraping without JS execution blocks
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const results = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.result__snippet')).slice(0, 3);
      return nodes.map((el, i) => `Result ${i+1}: ${el.textContent.trim()}`).join('\n\n');
    });

    return results || "No reliable search results found.";
  } catch (err) {
    console.error("Browser Agent Error:", err);
    return `Error executing web search: ${err.message}`;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  searchWebAndSummarize
};
