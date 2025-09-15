import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// Simple CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

async function launchBrowser() {
    const execPath = await chromium.executablePath(); // ✅ Use sparticuz chromium path
    return puppeteer.launch({
        args: chromium.args,
        executablePath: execPath,
        headless: chromium.headless,
        defaultViewport: null
    });
}

app.post("/generate-pdf", async (req, res) => {
    try {
        const { html, url, filename = "document.pdf" } = req.body || {};
        if (!html && !url) return res.status(400).json({ error: "Provide html or url" });

        const browser = await launchBrowser();
        const page = await browser.newPage();

        if (html) await page.setContent(html, { waitUntil: "networkidle2" });
        else await page.goto(url, { waitUntil: "networkidle2" });

        try { await page.emulateMediaType("print"); } catch { }

        const buffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" }
        });

        await page.close();
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length);
        return res.end(buffer);
    } catch (err) {
        console.error("PDF error:", err);
        res.status(500).json({ error: "PDF generation failed", details: String(err) });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
