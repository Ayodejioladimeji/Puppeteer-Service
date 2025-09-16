import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "10mb" }));

// Allow CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

app.post("/generate-pdf", async (req, res) => {
    let browser = null;
    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ error: "Provide html or url in request body" });
        }

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        if (html) {
            await page.setContent(html, { waitUntil: "networkidle0" });
        } else {
            await page.goto(url, { waitUntil: "networkidle0" });
        }

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0.5in",
                right: "0.5in",
                bottom: "0.5in",
                left: "0.5in",
            },
        })

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.end(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "PDF generation failed", details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => console.log(`PDF service running at http://localhost:${port}`));