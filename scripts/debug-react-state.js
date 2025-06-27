#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function debugReactState() {
  console.log('🔍 DEBUGGING REACT STATE MANAGEMENT\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    console.log('1. Initial state...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n2. Clicking Equipment button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentButton = buttons.find(btn => btn.textContent.includes('Equipment'));
      if (equipmentButton) equipmentButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n3. Clicking Dumbbell option...');
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div, button, span'));
      const dumbbellOption = options.find(el => el.textContent === 'Dumbbell');
      if (dumbbellOption) dumbbellOption.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n4. Checking final count...');
    const finalCount = await page.$$eval('h3.font-semibold', els => els.length);
    console.log(`Final exercise count: ${finalCount} (should be 11)`);
    
    // Keep browser open to inspect
    console.log('\nBrowser open for inspection...');
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugReactState().catch(console.error);