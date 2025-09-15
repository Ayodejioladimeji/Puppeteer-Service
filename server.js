import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

const app = express();

app.use(express.json());

async function launchBrowser() {
    return puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless, // true on Render
    });
}

app.post("/generate-pdf", async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ error: "Provide html in body" });

        const browser = await launchBrowser();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({ format: "A4", printBackground: true });
        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=output.pdf",
        });
        res.send(pdf);
    } catch (err) {
        console.error("PDF error:", err);
        res.status(500).json({ error: "PDF generation failed", details: err.message });
    }
});

app.listen(3000, () => console.log("PDF service running on port 3000"));
