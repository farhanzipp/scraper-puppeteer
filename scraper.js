const puppeteer = require('puppeteer');

const query = "Toko pertanian di sidoarjo";
const Url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                const element = document.querySelectorAll('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd')[1]
                var scrollHeight = element.scrollHeight;
                element.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

async function parsePlaces(page) {
    let places = [];
    const elements = await page.$$('.Nv2PK'); //UaQhfb
    if (elements && elements.length) {
        for (const el of elements) {
            const data = await page.evaluate(element => {
                const nameElement = element.querySelector('.qBF1Pd');
                const noElement = element.querySelector('.UsdlK');
                const linkElement = element.querySelector('.hfpxzc');
                return {
                    name: nameElement ? nameElement.textContent.trim() : '',
                    no: noElement ? noElement.textContent.trim() : '',
                    link: linkElement ? linkElement.getAttribute('href') : ''
                }
            },el);
            places.push({ data });
        }
    }
    return places;
}

async

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(Url);

    await autoScroll(page);
    const places = await parsePlaces(page);
    console.log(places);
    await browser.close();
})();