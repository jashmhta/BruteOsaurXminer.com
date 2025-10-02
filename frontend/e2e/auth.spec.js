const { test, expect } = require('@playwright/test')

test.describe('Authentication Flows', () => {
  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now()
    const username = `testuser${timestamp}`
    const password = 'TestPass123'

    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const registerTab = page.locator('button[value="register"], button:has-text("Register")')
    await registerTab.click()
    await page.waitForTimeout(500)
    
    await page.fill('input[placeholder="your_username"]', username)
    await page.fill('input[type="password"]', password)
    
    await page.click('button:has-text("Continue")')
    
    await page.waitForURL(/\/(connect-wallet|success|home)/, { timeout: 10000 })
    
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/(connect-wallet|success|home)/)
  })

  test('should login with valid credentials', async ({ page }) => {
    const timestamp = Date.now()
    const username = `logintest${timestamp}`
    const password = 'TestPass456'
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    page.on('pageerror', error => console.log('PAGE ERROR:', error))
    
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const registerTab = page.locator('button[value="register"], button:has-text("Register")')
    await registerTab.click()
    await page.waitForTimeout(500)
    
    await page.fill('input[placeholder="your_username"]', username)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Continue")')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const signinTab = page.locator('button[value="signin"], button:has-text("Sign In")')
    await signinTab.click()
    await page.waitForTimeout(500)
    
    const usernameInputs = page.locator('input[placeholder="your_username"]')
    await usernameInputs.last().fill(username)
    
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.last().fill(password)
    
    const signInButtons = page.locator('button:has-text("Sign In")')
    await signInButtons.last().click()
    
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    const hasSuccess = currentUrl.match(/\/(connect-wallet|success|home)/)
    
    expect(hasSuccess).toBeTruthy()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const signinTab = page.locator('button[value="signin"], button:has-text("Sign In")')
    await signinTab.click()
    await page.waitForTimeout(500)
    
    await page.fill('input[placeholder="your_username"]', 'invaliduser999')
    await page.fill('input[type="password"]', 'wrongpass123')
    
    await page.click('button:has-text("Sign In")')
    
    await page.waitForTimeout(2000)
    
    const errorVisible = await page.locator('text=/invalid|error|wrong|incorrect|failed/i').isVisible().catch(() => false)
    const stayedOnPage = page.url().includes('/auth')
    
    expect(errorVisible || stayedOnPage).toBeTruthy()
  })
})
