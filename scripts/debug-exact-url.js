const puppeteer = require('puppeteer');

async function debugExactURL() {
    console.log('🎯 DEBUGGING EXACT URL: http://localhost:8080/flows-experimental/exercise-browser');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    try {
        // Go to the EXACT URL you specified
        console.log('📍 Loading EXACT URL...');
        await page.goto('http://localhost:8080/flows-experimental/exercise-browser', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for full load
        
        // Screenshot the actual page
        await page.screenshot({ path: 'debug-real-url.png', fullPage: true });
        console.log('📸 Screenshot saved: debug-real-url.png');
        
        // Get the page title and URL to confirm we're on the right page
        const title = await page.title();
        const url = await page.url();
        console.log('Page title:', title);
        console.log('Actual URL:', url);
        
        // Get the exercise count from the page
        const exerciseCount = await page.$eval('h1, h2, .exercise-count, [data-testid="exercise-count"]', el => el.textContent).catch(() => 'NOT FOUND');
        console.log('Exercise count text:', exerciseCount);
        
        // Count actual exercise cards/items on the page
        const exerciseElements = await page.$$eval('[data-testid="exercise-card"], .exercise-card, .exercise-item', els => els.length).catch(() => 0);
        console.log('Exercise elements found:', exerciseElements);
        
        // Get all button text to see what's actually clickable
        const buttons = await page.$$eval('button', buttons => 
            buttons.map(button => button.textContent?.trim())
        );
        console.log('Available buttons:', buttons);
        
        // Get page HTML snippet to see structure
        const bodyHTML = await page.$eval('body', el => el.innerHTML.substring(0, 500));
        console.log('Page HTML start:', bodyHTML);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Screenshot even if there's an error
        await page.screenshot({ path: 'debug-error-page.png', fullPage: true });
        console.log('📸 Error screenshot saved: debug-error-page.png');
    }
    
    await browser.close();
}

debugExactURL().catch(console.error);