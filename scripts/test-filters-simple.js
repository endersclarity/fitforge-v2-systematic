#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function testFilters() {
  console.log('🧪 Simple Filter Test with Puppeteer\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Load page
    console.log('1. Loading page...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3', { timeout: 5000 });
    
    // Count initial exercises
    const titles = await page.$$eval('h3', elements => 
      elements.filter(el => el.className.includes('font-semibold')).map(el => el.textContent)
    );
    console.log(`   Found ${titles.length} exercises`);
    console.log(`   First few: ${titles.slice(0, 5).join(', ')}\n`);
    
    // Find all buttons and their text
    console.log('2. Finding filter buttons...');
    const buttons = await page.$$eval('button', elements => 
      elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
    );
    console.log(`   Available buttons: ${buttons.join(', ')}\n`);
    
    // Try to interact with page
    console.log('3. Page interaction test...');
    
    // Take screenshot for evidence
    await page.screenshot({ path: 'filter-test-evidence.png', fullPage: true });
    console.log('   Screenshot saved: filter-test-evidence.png\n');
    
    // Get page content for analysis
    const pageContent = await page.content();
    const hasEquipmentText = pageContent.includes('Equipment');
    const hasDumbbellText = pageContent.includes('Dumbbell');
    
    console.log(`   Page contains "Equipment": ${hasEquipmentText}`);
    console.log(`   Page contains "Dumbbell": ${hasDumbbellText}`);
    
    // Check URL after theoretical filter
    console.log('\n4. Testing filtered URL directly...');
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser?equipment=Dumbbell');
    await page.waitForSelector('h3', { timeout: 5000 });
    
    const filteredTitles = await page.$$eval('h3', elements => 
      elements.filter(el => el.className.includes('font-semibold')).map(el => el.textContent)
    );
    console.log(`   Filtered count: ${filteredTitles.length}`);
    console.log(`   Still shows all exercises: ${filteredTitles.length === 38 ? 'YES (BROKEN)' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testFilters().catch(console.error);