import json
import os

json_dir = r'h:\IT\单词化句\vocab-reading-generator\vocab-lib\pastpapers'

for fname in sorted(os.listdir(json_dir)):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(json_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if isinstance(data, list):
        continue
    
    for sec in data.get('sections', []):
        if sec.get('type') == 'writing':
            content = sec.get('content', '')
            if 'subheading' in content.lower() or 'Read the following text' in content:
                print(f'{fname}: 混入阅读题内容')
                print(f'  内容开头: {content[:200]}...')
                print()
            if content.count('Directions') > 2:
                print(f'{fname}: Directions重复 ({content.count("Directions")}次)')
                print()
