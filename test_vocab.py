from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8081')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Click vocab learning button
    vocab_btn = page.locator('#vocabLearningBtn')
    vocab_btn.click()
    page.wait_for_timeout(1000)

    # Take screenshot of the learning home
    page.screenshot(path='h:/IT/单词化句/test_screenshot_1.png')

    # Click the "单词本" tab to go to words view
    words_tab = page.locator('#vlTabWords')
    words_tab.click()
    page.wait_for_timeout(1000)
    page.screenshot(path='h:/IT/单词化句/test_screenshot_2_words.png')

    # Click "换本词书" button
    change_btn = page.locator('#vlChangeBookBtn')
    change_btn.click()
    page.wait_for_timeout(1000)
    page.screenshot(path='h:/IT/单词化句/test_screenshot_3_modal.png')

    # Select the first book (kaoyan)
    first_book = page.locator('.vl-book-modal-item').first
    first_book.click()
    page.wait_for_timeout(3000)
    page.screenshot(path='h:/IT/单词化句/test_screenshot_4_selected.png')

    # Go back to home
    home_tab = page.locator('#vlTabHome')
    home_tab.click()
    page.wait_for_timeout(1000)
    page.screenshot(path='h:/IT/单词化句/test_screenshot_5_home.png')

    # Click "开始学习"
    start_btn = page.locator('#vlStartBtn')
    start_btn.click()
    page.wait_for_timeout(3000)
    page.screenshot(path='h:/IT/单词化句/test_screenshot_6_study.png')

    # Check if study view is active
    study_view = page.locator('#vlStudyView')
    is_active = study_view.is_visible()
    print(f"Study view visible: {is_active}")

    # If study view is active, check card content
    if is_active:
        card = page.locator('#vlCardArea')
        card_text = card.inner_text()
        print(f"Card content: {card_text[:200]}")

    browser.close()
