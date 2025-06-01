import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = '8099674270:AAENXxI8xrQIITQqoFDLu6HQe2Dogv2NGjg';
const CHAT_ID = '887930144';

const SEEK_URL = 'https://www.seek.com.au/construction-labourer-jobs/in-Queensland-QLD?sortmode=ListedDate';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

async function scrape() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(SEEK_URL, { waitUntil: 'networkidle2' });

    const jobs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article')).slice(0, 5).map(el => {
        const title = el.querySelector('[data-automation="jobTitle"]')?.innerText || '';
        const link = 'https://www.seek.com.au' + el.querySelector('a')?.getAttribute('href');
        const company = el.querySelector('[data-automation="jobCompany"]')?.innerText || '';
        const location = el.querySelector('[data-automation="jobLocation"]')?.innerText || '';
        return { title, link, company, location };
      });
    });

    for (const job of jobs) {
      const msg = `👷 Nouvelle offre détectée\n📌 ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n🔗 ${job.link}`;
      await bot.sendMessage(CHAT_ID, msg);
    }

    if (jobs.length === 0) {
      await bot.sendMessage(CHAT_ID, 'Aucune nouvelle offre trouvée.');
    }

    await browser.close();
  } catch (err) {
    await bot.sendMessage(CHAT_ID, `❌ Erreur dans le scraper : ${err.message}`);
    console.error(err);
  }
}

scrape();
