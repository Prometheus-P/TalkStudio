/**
 * OG Image Generator for TalkStudio
 * Captures the og-image HTML template as a 1200x630 PNG
 */

const { chromium } = require('playwright');
const path = require('path');

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to OG image dimensions
  await page.setViewportSize({ width: 1200, height: 630 });

  // Load the HTML template
  const htmlPath = path.join(__dirname, 'generate-og-image.html');
  await page.goto(`file://${htmlPath}`);

  // Wait for fonts to load
  await page.waitForTimeout(500);

  // Capture screenshot
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  console.log(`OG image saved to: ${outputPath}`);

  await browser.close();
}

generateOgImage().catch(console.error);
