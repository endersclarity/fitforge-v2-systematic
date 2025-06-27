#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function testPuppeteerBasic() {
  console.log('🧪 TESTING PUPPETEER BASIC FUNCTIONALITY\n');
  
  try {
    console.log('1. Launching browser...');
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched successfully');
    
    console.log('2. Creating new page...');
    const page = await browser.newPage();
    console.log('✅ Page created');
    
    console.log('3. Testing navigation to Google...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 10000 });
    const title = await page.title();
    console.log(`✅ Navigated to: ${title}`);
    
    console.log('4. Testing element selection...');
    const searchBox = await page.$('input[name="q"]');
    if (searchBox) {
      console.log('✅ Found Google search box');
    } else {
      console.log('❌ Could not find Google search box');
    }
    
    console.log('5. Testing local FitForge site...');
    try {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle2', timeout: 5000 });
      const localTitle = await page.title();
      console.log(`✅ Local site accessible: ${localTitle}`);
      
      // Test if we can find any elements
      const elements = await page.$$('*');
      console.log(`✅ Found ${elements.length} DOM elements on local site`);
      
    } catch (localError) {
      console.log('❌ Local site not accessible:', localError.message);
    }
    
    console.log('6. Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
    
    console.log('\n🎯 PUPPETEER VERDICT: FULLY FUNCTIONAL ✅');
    
  } catch (error) {
    console.error('❌ PUPPETEER ERROR:', error.message);
    console.log('\n🎯 PUPPETEER VERDICT: NOT WORKING ❌');
  }
}

testPuppeteerBasic().catch(console.error);