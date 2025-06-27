#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function debugTopCulprits() {
  console.log('🎯 DEBUGGING TOP 5 MOST LIKELY CULPRITS\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture ALL console logs
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[${type.toUpperCase()}]`, text);
    });
    
    await page.goto('http://localhost:8080/flows-experimental/exercise-browser');
    await page.waitForSelector('h3.font-semibold', { timeout: 5000 });
    
    console.log('\n🔍 CULPRIT 1: Is filterState actually updating?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.evaluate(() => {
      console.log('Before click - checking for filter state logs...');
    });
    
    // Click equipment filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentButton = buttons.find(btn => btn.textContent.includes('Equipment'));
      if (equipmentButton) {
        console.log('Found equipment button, clicking...');
        equipmentButton.click();
      } else {
        console.log('❌ Equipment button not found');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Click dumbbell
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('div, button, span'));
      const dumbbellOption = options.find(el => el.textContent === 'Dumbbell');
      if (dumbbellOption) {
        console.log('Found dumbbell option, clicking...');
        dumbbellOption.click();
      } else {
        console.log('❌ Dumbbell option not found');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🔍 CULPRIT 2: Is useMemo recalculating?');
    const exerciseCount = await page.$$eval('h3.font-semibold', els => els.length);
    console.log(`Current exercise count: ${exerciseCount} (should be 11 if working)`);
    
    console.log('\n🔍 CULPRIT 3: Check React DevTools state');
    // Check if we can access React state
    const reactState = await page.evaluate(() => {
      // Try to find React fiber
      const exerciseCards = document.querySelectorAll('h3.font-semibold');
      if (exerciseCards.length > 0) {
        const parent = exerciseCards[0].closest('[data-react-component]') || 
                      exerciseCards[0].closest('div');
        return {
          elementFound: true,
          parentClasses: parent?.className || 'no classes',
          exerciseCount: exerciseCards.length
        };
      }
      return { elementFound: false };
    });
    
    console.log('React state check:', reactState);
    
    console.log('\n🔍 CULPRIT 4: DOM manipulation check');
    // Check if DOM is being modified at all
    await page.evaluate(() => {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          console.log('DOM changed:', mutation.type, mutation.target.tagName);
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      setTimeout(() => observer.disconnect(), 5000);
    });
    
    console.log('\n🔍 CULPRIT 5: Event handler attachment');
    const buttonCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const equipmentBtn = buttons.find(btn => btn.textContent.includes('Equipment'));
      
      return {
        buttonExists: !!equipmentBtn,
        hasClickHandler: equipmentBtn ? Object.keys(equipmentBtn).some(key => key.startsWith('__reactEvent')) : false,
        buttonHTML: equipmentBtn ? equipmentBtn.outerHTML.substring(0, 200) : 'not found'
      };
    });
    
    console.log('Button check:', buttonCheck);
    
    console.log('\n📊 SUMMARY:');
    console.log('- Check console logs above for filter state changes');
    console.log('- Exercise count should be 11, actual:', exerciseCount);
    console.log('- Look for any React errors or warnings');
    
    // Keep browser open
    console.log('\nBrowser staying open for manual inspection...');
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTopCulprits().catch(console.error);