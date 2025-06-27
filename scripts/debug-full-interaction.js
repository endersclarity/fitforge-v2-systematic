const puppeteer = require('puppeteer');

async function fullInteractionTest() {
    console.log('🎯 FULL INTERACTION TEST - Equipment Filter → Dumbbell Selection');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Capture ALL console logs for debugging
    page.on('console', msg => {
        const text = msg.text();
        console.log(`[BROWSER] ${text}`);
    });
    
    try {
        await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page to load
        
        // Screenshot 1: Initial page load
        await page.screenshot({ path: 'debug-01-initial.png', fullPage: true });
        console.log('📸 Screenshot 1: Initial page saved as debug-01-initial.png');
        
        console.log('📍 Step 1: Click Equipment button to open dropdown...');
        
        // Click Equipment button to open dropdown
        const equipmentClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const equipmentButton = buttons.find(button => 
                button.textContent?.includes('Equipment')
            );
            if (equipmentButton) {
                equipmentButton.click();
                return true;
            }
            return false;
        });
        
        if (!equipmentClicked) {
            console.log('❌ Equipment button not found');
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for dropdown to open
        
        // Screenshot 2: After clicking Equipment button
        await page.screenshot({ path: 'debug-02-dropdown-open.png', fullPage: true });
        console.log('📸 Screenshot 2: After Equipment click saved as debug-02-dropdown-open.png');
        
        console.log('📍 Step 2: Looking for dropdown options...');
        
        // Get all clickable elements that might be dropdown options
        const dropdownOptions = await page.$$eval('li, div[role="option"], [data-option]', elements => 
            elements.map(el => ({
                text: el.textContent?.trim(),
                tagName: el.tagName,
                className: el.className
            }))
        );
        
        console.log('Found dropdown elements:', dropdownOptions);
        
        // Try to find and click Dumbbell option
        console.log('📍 Step 3: Clicking Dumbbell option...');
        
        const dumbbellClicked = await page.evaluate(() => {
            // Look for any element containing "Dumbbell"
            const allElements = Array.from(document.querySelectorAll('*'));
            const dumbbellElement = allElements.find(el => 
                el.textContent?.trim() === 'Dumbbell' &&
                (el.tagName === 'LI' || el.tagName === 'DIV' || el.tagName === 'BUTTON')
            );
            
            if (dumbbellElement) {
                console.log('🔥 [CLICK] Clicking Dumbbell option');
                dumbbellElement.click();
                return true;
            }
            
            // Fallback: look for any clickable element with "Dumbbell" text
            const clickableElements = Array.from(document.querySelectorAll('li, button, div[onclick], [role="option"]'));
            const dumbbellClickable = clickableElements.find(el => 
                el.textContent?.includes('Dumbbell')
            );
            
            if (dumbbellClickable) {
                console.log('🔥 [CLICK] Clicking Dumbbell element (fallback)');
                dumbbellClickable.click();
                return true;
            }
            
            return false;
        });
        
        if (dumbbellClicked) {
            console.log('✅ Dumbbell option clicked');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for state changes
            
            // Screenshot 3: After clicking Dumbbell
            await page.screenshot({ path: 'debug-03-after-dumbbell.png', fullPage: true });
            console.log('📸 Screenshot 3: After Dumbbell click saved as debug-03-after-dumbbell.png');
            console.log('📊 INTERACTION COMPLETE - Check screenshots to see actual UI state');
        } else {
            console.log('❌ Dumbbell option not found');
            
            // Debug: show page HTML around dropdown area
            const pageHTML = await page.$eval('body', el => el.innerHTML);
            console.log('Page HTML length:', pageHTML.length);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    await browser.close();
}

fullInteractionTest().catch(console.error);