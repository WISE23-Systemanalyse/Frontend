import { test, expect, Frame } from '@playwright/test';

test.describe('Kinobuchung E2E', () => {
  test('Kompletter Buchungsprozess', async ({ page }) => {
    // 1. Programm-Seite öffnen
    await page.goto('/programm');
    await page.waitForLoadState('networkidle');
    
    // Debug-Screenshot 1: Programm-Seite
    await page.screenshot({ path: 'test-results/01-program-page.png' });

    // 2. Film auswählen
    const bookButton = page.locator('.bg-\\[\\#2C2C2C\\] button:has-text("Tickets buchen")').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Debug-Screenshot 2: Nach Film-Auswahl
    await page.waitForLoadState('networkidle');
    //timout
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/02-show-selection.png' });

    // 4. Sitzplatz auswählen
    await page.waitForLoadState('networkidle');
    
    // Warte auf die Leinwand als Indikator, dass der Saalplan geladen ist
    await expect(page.locator('text=LEINWAND')).toBeVisible();
    
    // Wähle einen verfügbaren Sitz
    const availableSeat = page.locator('button.bg-emerald-600').first();
    await expect(availableSeat).toBeVisible();
    await availableSeat.click();

    // Warte kurz und mache Screenshot für Debugging
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/03-seat-selection.png' });

    // Suche nach dem "Platz buchen" Button im ausgewählten Sitze Bereich
    const checkoutButton = page.getByRole('button', { name: /platz buchen|zur kasse/i });
    await expect(checkoutButton).toBeVisible({ timeout: 10000 });
    await checkoutButton.click();

    // 5. Checkout mit PayPal Sandbox
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/05-checkout-page.png' });
    
    // Warte auf den PayPal Container und Button
    await page.waitForSelector('.paypal-buttons', { state: 'visible', timeout: 30000 });
    
    // Warte länger, bis der PayPal-Frame geladen ist
    await page.waitForTimeout(3000);

    // Versuche mehrmals, den PayPal-Frame zu finden
    let paypalFrame: Frame | null = null;
    for (let i = 0; i < 5; i++) {
      console.log(`Versuch ${i + 1}, PayPal-Frame zu finden...`);
      const frames = page.frames();
      console.log('Verfügbare Frames:', frames.length);
      frames.forEach(frame => console.log('Frame URL:', frame.url()));
      
      const foundFrame = frames.find(f => f.url().includes('paypal.com'));
      if (foundFrame) {
        paypalFrame = foundFrame;
        console.log('PayPal-Frame gefunden!');
        break;
      }
      
      // Warte 2 Sekunden vor dem nächsten Versuch
      await page.waitForTimeout(2000);
    }

    if (!paypalFrame) {
      throw new Error('PayPal frame not found after multiple attempts');
    }

    // Klicke den PayPal-Button
    await paypalFrame.waitForSelector('[data-funding-source="paypal"]', { timeout: 10000 });
    await paypalFrame.click('[data-funding-source="paypal"]');

    // Warte auf das PayPal-Popup und finde es
    await page.waitForTimeout(2000);
    const pages = page.context().pages();
    const popup = pages.find(p => p.url().includes('paypal.com'));
    
    if (!popup) {
      throw new Error('PayPal popup not found');
    }

    // Debug: Log PayPal Popup URL
    console.log('PayPal Popup URL:', popup.url());

    // Versuche direkt mit dem Login
    try {
      // Email-Schritt
      console.log('Versuche Email einzugeben...');
      await popup.waitForSelector('#email');
      await popup.fill('#email', 'sb-zcp7v36903022@personal.example.com');
      
      // Screenshot für Debugging
      await popup.screenshot({ path: 'test-results/06-paypal-email.png' });
      
      // Next-Button klicken
      await popup.click('#btnNext');

      // Warte kurz
      await page.waitForTimeout(1000);

      // Passwort-Schritt
      console.log('Versuche Passwort einzugeben...');
      await popup.waitForSelector('#password');
      await popup.fill('#password', 'SO|Of45%');
      
      // Screenshot für Debugging
      await popup.screenshot({ path: 'test-results/07-paypal-password.png' });
      
      // Login-Button klicken (mit spezifischer ID)
      await popup.click('#btnLogin');

      // Warte auf den "Kauf abschließen" Button
      console.log('Warte auf Kauf abschließen Button...');
      
      // Warte kurz, bis die Seite nach dem Login geladen ist
      await page.waitForTimeout(2000);
      
      // Versuche verschiedene mögliche Selektoren für den Button
      try {
        // Erste Variante: Button mit Text
        await popup.click('button:has-text("Kauf abschließen")');
      } catch (e) {
        try {
          // Zweite Variante: Button mit Text "Pay Now"
          await popup.click('button:has-text("Pay Now")');
        } catch (e) {
          // Dritte Variante: Button mit Text "Complete Purchase"
          await popup.click('button:has-text("Complete Purchase")');
        }
      }

      // Warte auf die Weiterleitung zur Bestätigungsseite
      await page.waitForURL(/.*confirmation.*/, { timeout: 30000 });
      console.log('Auf Bestätigungsseite weitergeleitet:', page.url());

      //timout
      await page.waitForTimeout(3000);

      // Optional: Screenshot der Bestätigungsseite
      await page.screenshot({ path: 'test-results/08-confirmation-page.png' });

    } catch (error) {
      console.error('PayPal Error:', error);
      await popup.screenshot({ path: 'test-results/error-paypal.png' });
      throw error;
    }
  });
});