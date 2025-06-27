#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function testConsoleLogs() {
  console.log('🧪 TESTING CONSOLE LOG CAPTURE\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
      const logText = `[${msg.type()}] ${msg.text()}`;
      logs.push(logText);
      console.log('CAPTURED:', logText);
    });
    
    console.log('1. Navigating to exercise browser...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    
    console.log('2. Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('3. Injecting test console logs...');
    await page.evaluate(() => {
      console.log('TEST: This is a test log from browser');
      console.warn('TEST: This is a test warning');
      console.error('TEST: This is a test error');
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n📊 CONSOLE LOG SUMMARY:');
    console.log(`Total logs captured: ${logs.length}`);
    logs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    
    if (logs.some(log => log.includes('TEST: This is a test log'))) {
      console.log('\n✅ CONSOLE LOG CAPTURE: WORKING');
    } else {
      console.log('\n❌ CONSOLE LOG CAPTURE: NOT WORKING');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConsoleLogs().catch(console.error);