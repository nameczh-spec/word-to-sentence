import json
import os

json_dir = r'h:\IT\单词化句\vocab-reading-generator\vocab-lib\pastpapers'

missing_partb = []
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
            if 'Part B' not in content:
                missing_partb.append(fname)
            else:
                partb_start = content.find('Part B')
                partb_content = content[partb_start:].strip()
                if len(partb_content) < 50:
                    missing_partb.append(f'{fname} (PartB内容过短)')

print('=== Part B缺失的年份 ===')
for m in missing_partb:
    print(m)

print(f'\n总计: {len(missing_partb)} 个')
