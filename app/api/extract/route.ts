import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // Validate URL
    const urlPattern = new RegExp('^https?:\\/\\/.+'); // Simplified to just check http/https protocol
    
    if (!urlPattern.test(url)) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: Invalid URL format' }, { status: 400 });
    }
    
    let html;
    try {
      // First attempt with fetch
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      html = await fetchResponse.text();
    } catch (fetchError) {
      // Fallback to Puppeteer if fetch fails
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
        ignoreHTTPSErrors: true
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('body', { timeout: 30000 });
      } catch (error) {
        await browser.close();
        return NextResponse.json(
          { error: 'API_ERROR: Page navigation timeout' },
          { status: 408 }
        );
      }
      html = await page.content();
      await browser.close();
    }
    
    // Parse with Readability
    const dom = new JSDOM(html, {
      url,
      pretendToBeVisual: true,
      runScripts: 'dangerously'
    });
    const article = new Readability(dom.window.document, {
      charThreshold: 500,
      stripUnlikelyCandidates: false,
      nukeXML: true
    }).parse();
    
    if (!article || !article.textContent?.trim()) {
      return NextResponse.json({ error: 'API_ERROR: No extractable content found, try copy and paste text instead' }, { status: 400 });
    }
    
    return NextResponse.json({ content: article.textContent });
  } catch (error) {
    console.error('Error extracting content:', error);
    return NextResponse.json(
      { error: 'API_ERROR: Failed to extract content from URL' },
      { status: 500 }
    );
  }
}