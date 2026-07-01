import os
import glob
import re

pages_dir = r"d:\backend\frontend\src\pages"
files = glob.glob(os.path.join(pages_dir, "*.jsx"))

def fix_fetch(content):
    # 1. Replace hardcoded URL
    content = content.replace('"https://aeronexus-backend-production.up.railway.app', 'import.meta.env.VITE_API_URL + "')
    content = content.replace('`https://aeronexus-backend-production.up.railway.app', '`${import.meta.env.VITE_API_URL}')
    
    # 2. Add Authorization header where there are existing headers
    content = re.sub(
        r'(headers:\s*\{)([^}]+)(\})',
        r'\1\2, "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") \3',
        content
    )
    
    # 3. Add Authorization header to fetch calls without options
    # E.g. fetch(import.meta.env.VITE_API_URL + "/companies") -> fetch(..., {headers: {"Authorization": "Bearer " + ...}})
    # E.g. fetch(`${import.meta.env.VITE_API_URL}/companies/${id}/planes`)
    content = re.sub(
        r'(fetch\([^,)]+)(\))',
        r'\1, { headers: { "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") } }\2',
        content
    )
    
    # 4. Add Authorization header to fetch calls with options but no headers
    # E.g. fetch(..., { method: "DELETE" })
    # We will just do a simple replacement for { method: "DELETE" } since it's the only one without headers
    content = content.replace('{ method: "DELETE" }', '{ method: "DELETE", headers: { "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") } }')
    
    # Fix the case where Login.jsx gets an Authorization header which it shouldn't need, but it's fine.
    
    return content

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = fix_fetch(content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Frontend files fixed!")
