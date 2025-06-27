const puppeteer = require('puppeteer');

async function debugFilterState() {
    console.log('🎯 SURGICAL DEBUG - Testing Filter State Updates');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        // Filter for our debug logs
        if (text.includes('🔥') || text.includes('🔧') || text.includes('handleEquipmentChange') || text.includes('Filter state')) {
            console.log(`[BROWSER-${type.toUpperCase()}] ${text}`);
        }
    });
    
    try {
        console.log('📍 Loading exercise browser page...');
        await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
        await page.waitForSelector('[data-testid="filter-dropdown"]', { timeout: 10000 });
        
        console.log('📍 Page loaded, looking for Equipment filter...');
        
        // Find and click Equipment filter
        const equipmentButton = await page.$('button:has-text("Equipment")');
        if (!equipmentButton) {
            console.log('❌ Equipment filter button not found - trying alternative selector');
            const buttons = await page.$$('button');
            for (let i = 0; i < buttons.length; i++) {
                const text = await buttons[i].evaluate(el => el.textContent);
                console.log(`Button ${i}: "${text}"`);
                if (text && text.includes('Equipment')) {
                    console.log('✅ Found Equipment button');
                    await buttons[i].click();
                    break;
                }
            }
        } else {
            console.log('✅ Found Equipment filter button, clicking...');
            await equipmentButton.click();
        }
        
        await page.waitForTimeout(1000); // Wait for dropdown to open
        
        console.log('📍 Looking for Dumbbell option...');
        
        // Try to click Dumbbell option
        const dumbbellOption = await page.$('text=Dumbbell');
        if (dumbbellOption) {
            console.log('✅ Found Dumbbell option, clicking...');
            await dumbbellOption.click();
        } else {
            console.log('❌ Dumbbell option not found - checking available options');
            const options = await page.$$eval('li', els => els.map(el => el.textContent));
            console.log('Available options:', options);
        }
        
        await page.waitForTimeout(2000); // Wait for state to update
        
        console.log('📊 INTERACTION TEST COMPLETE');
        console.log('Expected: filterState.equipment = ["Dumbbell"]');
        console.log('Check console logs above for actual state changes');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    }
    
    console.log('🔍 Closing browser after test...');
    await browser.close();
}

debugFilterState().catch(console.error);