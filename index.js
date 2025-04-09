const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('It works!');
});

app.post('/check', async (req, res) => {
  const { page_id } = req.body;
  if (!page_id) {
    return res.json({ success: false, message: 'Missing page_id' });
  }

  const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&view_all_page_id=${page_id}`;

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const isVerified = await page.evaluate(() => {
      return document.body.innerText.includes("Meta Verified");
    });

    await browser.close();
    res.json({ success: true, page_id, is_verified: isVerified });
  } catch (err) {
    console.error("Puppeteer error:", err);
    res.json({ success: false, message: 'Puppeteer failed.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
