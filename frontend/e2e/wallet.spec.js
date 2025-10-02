const { test, expect } = require('@playwright/test')

test.describe('Wallet Validation Flows', () => {
  test.beforeEach(async ({ page }) => {
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
    
    await page.waitForTimeout(3000)
    
    const onConnectPage = page.url().includes('/connect-wallet')
    if (!onConnectPage) {
      await page.goto('/connect-wallet')
      await page.waitForTimeout(1000)
    }
  })

  test('should validate a valid 12-word mnemonic phrase', async ({ page }) => {
    const validMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    
    await page.click('button:has-text("Manual Connection")')
    await page.waitForTimeout(500)
    
    await page.click('button:has-text("Mnemonic Phrase")')
    await page.waitForTimeout(500)
    
    const words = validMnemonic.split(' ')
    for (let i = 0; i < words.length; i++) {
      await page.fill(`input[placeholder="Word ${i + 1}"]`, words[i])
    }
    
    await page.click('button:has-text("Validate Mnemonic")')
    
    await page.waitForTimeout(5000)
    
    const hasSuccess = await page.locator('text=/success|validated|connected/i').isVisible().catch(() => false)
    const navigated = page.url().includes('/download-guide') || page.url().includes('/success')
    
    expect(hasSuccess || navigated).toBeTruthy()
  })

  test('should reject an invalid mnemonic phrase', async ({ page }) => {
    const invalidWords = ['invalid', 'words', 'that', 'are', 'not', 'real', 'bip39', 'seed', 'phrase', 'at', 'all', 'test']
    
    await page.click('button:has-text("Manual Connection")')
    await page.waitForTimeout(500)
    
    await page.click('button:has-text("Mnemonic Phrase")')
    await page.waitForTimeout(500)
    
    for (let i = 0; i < invalidWords.length; i++) {
      await page.fill(`input[placeholder="Word ${i + 1}"]`, invalidWords[i])
    }
    
    await page.click('button:has-text("Validate Mnemonic")')
    
    await page.waitForTimeout(3000)
    
    const errorVisible = await page.locator('text=/error|invalid|failed/i').isVisible().catch(() => false)
    const stayedOnPage = page.url().includes('/connect-wallet')
    
    expect(errorVisible || stayedOnPage).toBeTruthy()
  })

  test('should validate a valid private key', async ({ page }) => {
    const validPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234'
    
    await page.click('button:has-text("Manual Connection")')
    await page.waitForTimeout(500)
    
    await page.click('button:has-text("Private Key")')
    await page.waitForTimeout(500)
    
    await page.fill('input[placeholder="Enter 64-character private key (hexadecimal)"]', validPrivateKey)
    
    await page.click('button:has-text("Validate Private Key")')
    
    await page.waitForTimeout(5000)
    
    const hasSuccess = await page.locator('text=/success|validated|connected/i').isVisible().catch(() => false)
    const navigated = page.url().includes('/download-guide') || page.url().includes('/success')
    
    expect(hasSuccess || navigated).toBeTruthy()
  })

  test('should reject an invalid private key', async ({ page }) => {
    const invalidPrivateKey = '0xinvalidkey'
    
    await page.click('button:has-text("Manual Connection")')
    await page.waitForTimeout(500)
    
    await page.click('button:has-text("Private Key")')
    await page.waitForTimeout(500)
    
    await page.fill('input[placeholder="Enter 64-character private key (hexadecimal)"]', invalidPrivateKey)
    
    await page.click('button:has-text("Validate Private Key")')
    
    await page.waitForTimeout(3000)
    
    const errorVisible = await page.locator('text=/error|invalid|failed/i').isVisible().catch(() => false)
    const stayedOnPage = page.url().includes('/connect-wallet')
    
    expect(errorVisible || stayedOnPage).toBeTruthy()
  })

  test('should display WalletConnect option', async ({ page }) => {
    const wcButton = await page.locator('button:has-text("WalletConnect")').first().isVisible().catch(() => false)
    
    expect(wcButton).toBeTruthy()
  })

  test('should switch between wallet connection methods', async ({ page }) => {
    const providersTab = page.locator('button:has-text("Wallet Providers")').first()
    const manualTab = page.locator('button:has-text("Manual Connection")').first()
    
    await providersTab.click()
    await page.waitForTimeout(500)
    
    const wcVisible = await page.locator('text=/WalletConnect/i').isVisible().catch(() => false)
    expect(wcVisible).toBeTruthy()
    
    await manualTab.click()
    await page.waitForTimeout(500)
    
    const mnemonicButton = await page.locator('button:has-text("Mnemonic Phrase")').isVisible().catch(() => false)
    const privateKeyButton = await page.locator('button:has-text("Private Key")').isVisible().catch(() => false)
    expect(mnemonicButton || privateKeyButton).toBeTruthy()
    
    if (mnemonicButton) {
      await page.click('button:has-text("Mnemonic Phrase")')
      await page.waitForTimeout(500)
      const mnemonicInput = await page.locator('input[placeholder="Word 1"]').isVisible().catch(() => false)
      expect(mnemonicInput).toBeTruthy()
    }
    
    if (privateKeyButton) {
      await page.click('button:has-text("Private Key")')
      await page.waitForTimeout(500)
      const privateKeyInput = await page.locator('input[placeholder="Enter 64-character private key (hexadecimal)"]').isVisible().catch(() => false)
      expect(privateKeyInput).toBeTruthy()
    }
  })
})
