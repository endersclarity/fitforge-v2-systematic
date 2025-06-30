#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function simpleClickTest() {
  console.log('🔍 SIMPLE CLICK TEST - Equipment Filter');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', (msg) => {
      console.log(`BROWSER: ${msg.text()}`);
    });

    await page.goto('http://localhost:8080/flows-experimental/exercise-browser', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\nClickin Equipment button...');
    
    // Direct button click
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentButton = buttons.find(btn => btn.textContent?.includes('Equipment'));
      if (equipmentButton) {
        console.log('Found Equipment button, clicking...');
        equipmentButton.click();
      } else {
        console.log('Equipment button not found');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\nClicking Dumbbell option...');
    
    // Click Dumbbell
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent?.trim() === 'Dumbbell' && element.tagName === 'BUTTON') {
          console.log('Found Dumbbell button, clicking...');
          element.click();
          return;
        }
      }
      console.log('Dumbbell button not found');
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nDone - check console logs above');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

simpleClickTest();