import os
import re

with open('/home/satyam/Downloads/TransitOps-Oddo-Hackathon/sveltekit_instructions.md', 'r') as f:
    text = f.read()

steps = re.split(r'### STEP \d+:', text)[1:]
for step in steps:
    lines = step.strip().split('\n')
    title = lines[0].strip()
    
    # find filename
    m = re.search(r'`([^`]+)`', title)
    if not m:
        print(f"Skipping (no file): {title}")
        continue
    filename = m.group(1)
    
    # find code block
    m2 = re.search(r'```[a-z]*\n(.*?)```', step, re.DOTALL)
    if not m2:
        print(f"Skipping (no code): {title}")
        continue
        
    code = m2.group(1)
    
    filepath = os.path.join('/home/satyam/Downloads/TransitOps-Oddo-Hackathon', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as out:
        out.write(code)
    print(f"Written: {filename}")
