from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    
    # 1. 首页
    page.goto('http://localhost:8080')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='c:\\Users\\31215\\AppData\\Local\\Temp\\trae\\screenshots\\verify-home.png', full_page=True)
    print("HOME PAGE DONE")
    
    # 2. 点击真题练习按钮
    page.click('#pastPapersBtn')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:\\Users\\31215\\AppData\\Local\\Temp\\trae\\screenshots\\verify-pastpapers.png', full_page=True)
    print("PASTPAPERS HOME DONE")
    
    # 3. 功能卡片可见
    cards = page.locator('.pp-feature-card')
    print(f"Feature cards count: {cards.count()}")
    print(f"Feature cards visible: {cards.first.is_visible()}")
    
    # 4. 试卷卡片可见
    paper_cards = page.locator('.pp-paper-card')
    print(f"Paper cards count: {paper_cards.count()}")
    if paper_cards.count() > 0:
        print(f"First paper card visible: {paper_cards.first.is_visible()}")
    
    # 5. 类型切换可见
    toggle = page.locator('.pp-type-toggle')
    print(f"Type toggle visible: {toggle.is_visible()}")
    
    # 6. 点击完形填空
    page.click('.pp-feature-card[data-feature="cloze"]')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:\\Users\\31215\\AppData\\Local\\Temp\\trae\\screenshots\\verify-cloze-select.png', full_page=True)
    print("CLOZE SELECT DONE")
    
    # 7. 选择第一个试卷
    page.click('.pp-paper-card:first-child')
    page.wait_for_timeout(2000)
    page.screenshot(path='c:\\Users\\31215\\AppData\\Local\\Temp\\trae\\screenshots\\verify-cloze.png', full_page=True)
    print("CLOZE EXERCISE DONE")
    
    # 检查布局
    print(f"cloze-content: {page.locator('.pp-cloze-content').is_visible()}")
    print(f"cloze-left-col: {page.locator('.pp-cloze-left-col').is_visible()}")
    print(f"cloze-passage: {page.locator('.pp-cloze-passage').is_visible()}")
    print(f"cloze-options: {page.locator('.pp-cloze-options').is_visible()}")
    print(f"toolbar: {page.locator('.pp-draw-toolbar').is_visible()}")
    print(f"canvas: {page.locator('#ppDrawingCanvas').count()}")
    
    # 8. 返回并进入精读
    page.click('#ppBackBtn')
    page.wait_for_timeout(1500)
    page.click('.pp-feature-card[data-feature="reader"]')
    page.wait_for_timeout(1000)
    page.click('.pp-paper-card:first-child')
    page.wait_for_timeout(2000)
    page.screenshot(path='c:\\Users\\31215\\AppData\\Local\\Temp\\trae\\screenshots\\verify-reader.png', full_page=True)
    print("READER DONE")
    
    print(f"reader: {page.locator('.pp-reader').is_visible()}")
    print(f"reader-toolbar: {page.locator('.pp-draw-toolbar').is_visible()}")
    print(f"article: {page.locator('.pp-article').is_visible()}")
    
    browser.close()
    print("ALL DONE")
