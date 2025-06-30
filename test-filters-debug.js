const puppeteer = require('puppeteer');

async function debugFilters() {
  const browser = await puppeteer.launch({ headless: false }); // Run with UI
  const page = await browser.newPage();
  
  try {
    // Navigate to exercise browser
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    console.log('Page loaded. Opening Equipment dropdown...');
    
    // Click Equipment dropdown
    const equipmentDropdown = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.trim() === 'Equipment');
    });
    
    if (equipmentDropdown && equipmentDropdown.asElement()) {
      await equipmentDropdown.click();
      await new Promise(r => setTimeout(r, 1000));
      
      // Get dropdown content
      const dropdownContent = await page.evaluate(() => {
        // Find all elements that might be dropdown items
        const allText = [];
        
        // Look for checkbox labels
        document.querySelectorAll('label').forEach(label => {
          if (label.textContent) allText.push('Label: ' + label.textContent.trim());
        });
        
        // Look for any dropdown divs
        document.querySelectorAll('[role="menu"], [role="listbox"], .dropdown-content').forEach(el => {
          allText.push('Dropdown element found: ' + el.className);
        });
        
        // Look for checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
          const parent = cb.parentElement;
          const label = parent?.textContent || 'No label';
          allText.push(`Checkbox ${i}: ${label}`);
        });
        
        return allText;
      });
      
      console.log('Dropdown content:', dropdownContent);
      
      // Take screenshot
      await page.screenshot({ path: 'equipment-dropdown.png' });
      console.log('Screenshot saved as equipment-dropdown.png');
    }
    
    console.log('\nKeeping browser open for 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugFilters();