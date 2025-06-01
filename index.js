import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = '8099674270:AAENXxI8xrQIITQqoFDLu6HQe2Dogv2NGjg';
const CHAT_ID = '887930144';
const SEEK_URL = 'https://www.seek.com.au/construction-labourer-jobs/in-Queensland-QLD?sortmode=ListedDate';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

(async () => {
  try {
    await bot.sendMessage(CHAT_ID, '🤖 Le scraper Seek est en cours de lancement…');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.goto(SEEK_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const articles = document.querySelectorAll('article');
      return Array.from(articles).slice(0, 5).map(el => {
        const title = el.querySelector('[data-automation="jobTitle"]')?.innerText || '';
        const link = el.querySelector('a')?.getAttribute('href') || '';
        const fullLink = link ? 'https://www.seek.com.au' + link : '';
        const company = el.querySelector('[data-automation="jobCompany"]')?.innerText || '';
        const location = el.querySelector('[data-automation="jobLocation"]')?.innerText || '';
        return { title, company, location, link: fullLink };
      });
    });

    if (jobs.length === 0) {
      await bot.sendMessage(CHAT_ID, '⚠️ Aucun job détecté. Soit le site est vide, soit bloqué.');
    } else {
      for (const job of jobs) {
        const msg = `👷 Nouvelle offre\n📌 ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n🔗 ${job.link}`;
        await bot.sendMessage(CHAT_ID, msg);
      }
    }

    await browser.close();
    await bot.sendMessage(CHAT_ID, `✅ Fin d'exécution du scraper Seek (${new Date().toLocaleString()})`);

  } catch (error) {
    await bot.sendMessage(CHAT_ID, `❌ Erreur dans le scraper : ${error.message}`);
    console.error(error);
  }
})();
