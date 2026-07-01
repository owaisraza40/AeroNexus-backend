import os
import glob
import re

files = glob.glob("d:/backend/*.cpp")

for f in files:
    with open(f, "r") as file:
        content = file.read()
        
    if "using namespace std;" not in content:
        # insert after the last #include
        includes = re.findall(r'#include.*', content)
        if includes:
            last_include = includes[-1]
            content = content.replace(last_include, last_include + "\n#include <iostream>\nusing namespace std;\n")
        else:
            content = "#include <iostream>\nusing namespace std;\n" + content
            
        with open(f, "w") as file:
            file.write(content)

print("Added using namespace std; to cpp files.")
