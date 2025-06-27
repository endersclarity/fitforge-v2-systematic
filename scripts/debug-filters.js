#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function debugFilters() {
  console.log('🔍 DEBUG: Filter Functionality\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    console.log('1. Loading page...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    // Test muscle filter
    console.log('\n2. Testing muscle filter...');
    
    // Click Target Muscle button
    const muscleButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const muscleButton = buttons.find(btn => btn.textContent.includes('Target Muscle'));
      if (muscleButton) {
        console.log('Found muscle button:', muscleButton.textContent);
        muscleButton.click();
        return true;
      }
      console.log('Could not find muscle button');
      return false;
    });
    
    if (muscleButtonClicked) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check what options are available
      const muscleOptions = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('[role="menuitem"], button'));
        return options.map(el => el.textContent).filter(text => text && text.trim());
      });
      
      console.log('Available muscle options:', muscleOptions);
      
      // Try to click Chest
      const chestClicked = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('button, div, span'));
        const chestOption = options.find(el => el.textContent === 'Chest');
        if (chestOption) {
          console.log('Clicking Chest option');
          chestOption.click();
          return true;
        }
        console.log('Could not find Chest option');
        return false;
      });
      
      if (chestClicked) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const count = await page.$$eval('h3.font-semibold', els => els.length);
        console.log(`After Chest filter: ${count} exercises (expected <38)`);
      }
    }
    
    // Check filter state
    console.log('\n3. Checking filter state...');
    const filterState = await page.evaluate(() => {
      // Try to access React props/state if possible
      const filterBar = document.querySelector('[class*="filter"]');
      console.log('Filter bar element:', filterBar);
      return 'Check browser console for details';
    });
    
    console.log('Filter state:', filterState);
    
    console.log('\nPress Ctrl+C to close browser...');
    await new Promise(() => {}); // Keep browser open
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugFilters().catch(console.error);