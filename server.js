// import express from "express";
// import bodyParser from "body-parser";
// import puppeteer from "puppeteer";

// const app = express();
// app.use(bodyParser.json({ limit: "10mb" }));

// app.post("/generate-pdf", async (req, res) => {
//     const { html } = req.body;

//     if (!html) {
//         return res.status(400).send("Missing HTML content");
//     }

//     try {
//         const browser = await puppeteer.launch({
//             headless: "new",
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         });
//         const page = await browser.newPage();

//         // Set content and wait until all resources load
//         await page.setContent(html, {
//             waitUntil: ["domcontentloaded", "networkidle0"], // wait for fonts, CSS, etc.
//         });

//         // Give extra time for Google Fonts to render
//         await page.evaluateHandle("document.fonts.ready");

//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//         });

//         await browser.close();

//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": "inline; filename=cv.pdf",
//         });
//         res.send(pdfBuffer);
//     } catch (err) {
//         console.error("PDF generation failed:", err);
//         res.status(500).send("Failed to generate PDF");
//     }
// });

// app.listen(3000, () => {
//     console.log("Server running at http://localhost:3000");
// });

import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/generate-pdf", async (req, res) => {
    const { html } = req.body;
    if (!html) {
        return res.status(400).send("Missing HTML content");
    }

    try {
        const browser = await puppeteer.launch({
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--single-process"
            ],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=output.pdf");
        res.send(pdfBuffer);
    } catch (err) {
        console.error("PDF generation failed:", err);
        res.status(500).send("Failed to generate PDF");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

