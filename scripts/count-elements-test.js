#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function countElementsTest() {
  console.log('🔍 ELEMENT COUNTING TEST');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();

    await page.goto('http://localhost:8080/flows-experimental/exercise-browser', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n1. INITIAL COUNT (multiple selectors):');
    
    // Try different selectors
    const selectors = [
      '[data-testid="exercise-card"]',
      '.exercise-card', 
      '[class*="exercise"]',
      '[class*="card"]',
      '[class*="Card"]',
      'div[class*="card"]',
      'div[class*="Card"]'
    ];
    
    for (const selector of selectors) {
      const count = await page.$$eval(selector, elements => elements.length);
      console.log(`  ${selector}: ${count} elements`);
    }
    
    // More specific search
    console.log('\n2. CONTENT-BASED SEARCH:');
    const exerciseNames = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const exerciseElements = elements.filter(el => {
        const text = el.textContent || '';
        return (
          text.includes('Push') || 
          text.includes('Bench') ||
          text.includes('Squat') ||
          text.includes('Curl') ||
          text.includes('Press')
        ) && text.length < 100; // Avoid large containers
      });
      return exerciseElements.length;
    });
    console.log(`  Exercise-like content: ${exerciseNames} elements`);
    
    // Check grid structure
    console.log('\n3. GRID STRUCTURE:');
    const gridElements = await page.evaluate(() => {
      const grids = document.querySelectorAll('[class*="grid"]');
      let totalChildren = 0;
      grids.forEach(grid => {
        console.log(`Grid found with ${grid.children.length} children`);
        totalChildren += grid.children.length;
      });
      return totalChildren;
    });
    console.log(`  Total grid children: ${gridElements}`);
    
    // Apply filter and recount
    console.log('\n4. APPLYING FILTER...');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentButton = buttons.find(btn => btn.textContent?.includes('Equipment'));
      if (equipmentButton) equipmentButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent?.trim() === 'Dumbbell' && element.tagName === 'BUTTON') {
          element.click();
          return;
        }
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n5. FILTERED COUNT:');
    
    for (const selector of selectors) {
      const count = await page.$$eval(selector, elements => elements.length);
      console.log(`  ${selector}: ${count} elements`);
    }
    
    const filteredGridElements = await page.evaluate(() => {
      const grids = document.querySelectorAll('[class*="grid"]');
      let totalChildren = 0;
      grids.forEach(grid => {
        console.log(`Filtered grid found with ${grid.children.length} children`);
        totalChildren += grid.children.length;
      });
      return totalChildren;
    });
    console.log(`  Total filtered grid children: ${filteredGridElements}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

countElementsTest();