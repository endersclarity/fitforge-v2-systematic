const puppeteer = require('puppeteer');

async function simpleClickTest() {
    console.log('🎯 SIMPLE CLICK TEST - Find and click Equipment filter');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🔥') || text.includes('🔧') || text.includes('handleEquipmentChange')) {
            console.log(`[BROWSER] ${text}`);
        }
    });
    
    try {
        await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for page to load
        
        console.log('📍 Getting page content...');
        
        // Get all button text
        const buttons = await page.$$eval('button', buttons => 
            buttons.map(button => button.textContent?.trim())
        );
        console.log('Available buttons:', buttons);
        
        // Look for Equipment button specifically
        const equipmentButtons = await page.$$eval('button', buttons => 
            buttons.filter(button => button.textContent?.includes('Equipment'))
                   .map(button => button.textContent?.trim())
        );
        console.log('Equipment buttons found:', equipmentButtons);
        
        if (equipmentButtons.length > 0) {
            console.log('✅ Found Equipment button, attempting click...');
            
            // Click the Equipment button
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const equipmentButton = buttons.find(button => 
                    button.textContent?.includes('Equipment')
                );
                if (equipmentButton) {
                    console.log('🔥 [CLICK] Equipment button clicked');
                    equipmentButton.click();
                    return true;
                }
                return false;
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any state changes
            console.log('📊 Click completed - check console logs for state changes');
            
        } else {
            console.log('❌ No Equipment button found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    await browser.close();
}

simpleClickTest().catch(console.error);