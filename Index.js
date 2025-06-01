import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = '8099674270:AAENXxI8xrQIITQqoFDLu6HQe2Dogv2NGjg';
const CHAT_ID = '887930144';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const SEEK_URL = 'https://www.seek.com.au/construction-labourer-jobs/in-Queensland-QLD?sortmode=ListedDate';

const memory = new Set();

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(SEEK_URL, { waitUntil: 'networkidle2' });

  const offers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article')).map(job => {
      const title = job.querySelector('[data-automation="jobTitle"]')?.innerText || '';
      const link = 'https://www.seek.com.au' + job.querySelector('a')?.getAttribute('href');
      const company = job.querySelector('[data-automation="jobCompany"]')?.innerText || '';
      const location = job.querySelector('[data-automation="jobLocation"]')?.innerText || '';
      return { title, link, company, location };
    });
  });

  for (const offer of offers) {
    if (!memory.has(offer.link)) {
      memory.add(offer.link);
      const msg = `👷 Nouvelle offre détectée\n📌 ${offer.title}\n🏢 ${offer.company}\n📍 ${offer.location}\n🔗 ${offer.link}`;
      await bot.sendMessage(CHAT_ID, msg);
    }
  }

  await browser.close();
}

scrape();
