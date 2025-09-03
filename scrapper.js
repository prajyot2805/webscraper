// scraper.js
import puppeteer from "puppeteer";

async function scrapeScreener() {
    const url = "https://www.screener.in/screens/2887606/gpt-v2/";

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process", // <- may be needed on free plan
            "--disable-gpu"
        ],
        // headless: true, // set to false for debugging
        // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the stock table to load
    await page.waitForSelector("table.data-table");

    // Extract data
    const data = await page.evaluate(() => {
        const rows = [];
        document.querySelectorAll("table.data-table tbody tr").forEach((row) => {
            const cols = Array.from(row.querySelectorAll("td")).map((td) =>
                td.innerText.trim()
            );
            if (cols.length > 0) {
                rows.push(cols);
            }
        });
        return rows;
    });

    await browser.close();

    return data;
}

scrapeScreener()
    .then((stocks) => {
        console.log("✅ Scraped Data:");
        console.table(stocks); // prints as a nice table
    })
    .catch((err) => {
        console.error("❌ Error scraping:", err);
    });
