const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

const query = "Toko pertanian di sawentar kanigoro";
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
            }, 100);
        });
    });
}

async function parsePlaces(page) {
    let places = [];
    const elements = await page.$$('.Nv2PK'); //UaQhfb
    if (elements && elements.length) {
        for (const el of elements) {
            const data = await page.evaluate(element => {
                const kontakEl = element.querySelector('.UsdlK');
                return {
                    // name: element.querySelector('.qBF1Pd') ? element.querySelector('.qBF1Pd').textContent.trim() : '',
                    kontak: kontakEl ? kontakEl.textContent.trim() : '',
                    link: element.querySelector('.hfpxzc') ? element.querySelector('.hfpxzc').getAttribute('href') : '',
                }
            }, el);
            places.push({ data });
        }
    }
    return places;
}


async function detailing(arr) {
    const browser = await puppeteer.launch({ headless: false });
    let results = [];

    for (const val of arr) {
        const page = await browser.newPage();
        await page.goto(val.data.link);

        const data = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.Io6YTe'));
            const nama = document.querySelector('.DUwDvf') ? document.querySelector('.DUwDvf').textContent.trim() : null;
            const alamat = items[0] ? items[0].textContent.trim() : null;
            const jenis = document.querySelector('.DkEaL') ? document.querySelector('.DkEaL').textContent.trim() : null;
            const rating = document.querySelector('.F7nice') ? document.querySelector('.F7nice').textContent.trim() : null;

            return { nama, alamat, jenis, rating };
        })

        const dataKontak = val.data.kontak; 

        results.push({ ...data, kontak: dataKontak });

        await page.close();
    }
    await browser.close();
    return results;
}

function writeToXlsx(data, outputPath) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, outputPath);
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(Url);

    await autoScroll(page);
    const places = await parsePlaces(page);

    const final = await detailing(places);
    console.log(final);

    await browser.close();
    writeToXlsx(final, 'output.xlsx');
})();


