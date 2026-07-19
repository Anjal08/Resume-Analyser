const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', response => {
        if (!response.ok() && !response.url().includes('google.com')) {
            console.log('NETWORK ERROR:', response.url(), response.status());
        }
    });

    try {
        console.log('Navigating to register...');
        await page.goto('http://localhost:5173/register');
        
        await page.waitForSelector('input[placeholder="Enter username"]', { timeout: 5000 }).catch(() => console.log('Register page load timeout'));
        
        console.log('Filling registration...');
        await page.type('input[placeholder="Enter username"]', 'TestUser' + Date.now());
        await page.type('input[placeholder="Enter email address"]', 'test_user_' + Date.now() + '@test.com');
        await page.type('input[placeholder="Enter password"]', 'password123');
        
        await page.click('.primary-button');
        
        console.log('Waiting for redirect to home...');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => console.log('Redirect timeout'));
        
        console.log('Current URL:', page.url());
        
        if (!page.url().endsWith('/')) {
            console.log('Not on home page, trying login...');
            await page.goto('http://localhost:5173/login');
            await page.waitForSelector('input[placeholder="Enter email address"]', { timeout: 5000 });
            await page.type('input[placeholder="Enter email address"]', 'test_user_' + Date.now() + '@test.com');
            await page.type('input[placeholder="Enter password"]', 'password123');
            await page.click('.primary-button');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
            console.log('Current URL after login:', page.url());
        }

        console.log('Filling out form on home page...');
        await page.waitForSelector('textarea', { timeout: 5000 });
        await page.type('textarea', 'Software Engineer');
        
        console.log('Uploading PDF...');
        const fileInput = await page.$('input[type="file"]');
        await fileInput.uploadFile('real_dummy.pdf');
        await fileInput.uploadFile('C:\\Users\\infinix\\Downloads\\Anjali_patel_Cv.pdf');
        
        console.log('Clicking generate button...');
        await page.click('.generate-btn');
        
        console.log('Waiting for result...');
        await new Promise(r => setTimeout(r, 15000));
        
        const urlAfterWait = page.url();
        console.log('URL after wait:', urlAfterWait);
        
        await page.screenshot({ path: 'test_result.png' });
        
    } catch (e) {
        console.error('Test script error:', e);
    } finally {
        await browser.close();
    }
})();
