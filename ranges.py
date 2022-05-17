from functools import reduce
import json
import os
import sys


if len(sys.argv) < 2:
    raise RuntimeError("AST filename argument is required")

if len(sys.argv) < 3:
    raise RuntimeError("JS filename argument is required")

if len(sys.argv) > 3:
    raise RuntimeError("Exactly 2 arguments are required")


with open(sys.argv[1]) as fd:
    ast = json.load(fd)


assert ast["type"] == "Program"
assert ast["body"][1]["expression"]["type"] == "SequenceExpression"


with open(sys.argv[2], encoding="utf-8") as fd:
    source = fd.read()

for chunk in ast["body"][1:]:
    for expr in chunk["expression"]["expressions"]:
        assert expr["type"] == "CallExpression"
        assert expr["callee"]["name"] == "define"
        start = expr["start"]
        end = expr["end"]
        name = expr["arguments"][0]["value"]
        print(name)
        parts = name.split("/")

        def reducer(acc, part):
            path = f"{acc}/{part}"
            if not os.path.exists(path):
                os.makedirs(path)
            return path

        reduce(reducer, parts[:-1], ".")

        filename = f"./{name}.js"

        with open(filename, "w") as fd:
            fd.write(source[start:end])
