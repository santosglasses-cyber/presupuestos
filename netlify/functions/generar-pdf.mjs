import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const handler = async (event) => {
  const htmlName = event.queryStringParameters?.html || '';
  if (!htmlName) {
    return { statusCode: 400, body: 'Falta parametro ?html=...' };
  }
  
  const url = `https://santosglasses-cyber.github.io/presupuestos/${htmlName}`;
  
  // Esperar redes + 3s extra para imagenes y QR
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    printBackground: true,
    preferCSSPageSize: true,
  });
  
  await browser.close();
  
  // Devolver nombre igual que el HTML pero .pdf
  const pdfName = htmlName.replace(/\.html$/i, '.pdf');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pdfName}"`,
    },
    body: pdf.toString('base64'),
    isBase64Encoded: true,
  };
};
