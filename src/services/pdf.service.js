import puppeteer from "puppeteer"

/* =========================
   GENERATE RESUME PDF
========================= */
export const generateResumePDF = async ({
  url,
  html,
  filename = "resume.pdf",
}) => {
  let browser

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    })

    const page = await browser.newPage()

    /* =========================
       LOAD CONTENT
    ========================= */
    if (url) {
      await page.goto(url, {
        waitUntil: "networkidle0",
      })
    } else if (html) {
      await page.setContent(html, {
        waitUntil: "networkidle0",
      })
    } else {
      throw new Error("PDF requires either url or html")
    }

    /* =========================
       PDF OPTIONS
    ========================= */
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    })

    return pdfBuffer
  } catch (error) {
    console.error("❌ PDF generation failed:", error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
