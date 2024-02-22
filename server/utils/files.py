import string
from hashlib import sha256
from pathlib import Path
from typing import Optional, List, Union


def read_subfolders_as_tags(parent: Path, pattern: string = "", except_files: Optional[List[string]] = None):
    if pattern == "":
        pattern = "*"
    pattern = "**/" + pattern
    result = {}
    for item in parent.glob(pattern):
        file = item.relative_to(parent)
        path = file.as_posix()

        if except_files:
            if path in except_files:
                continue

        tag = '/'.join(file.parts[:-1]) \
            if len(file.parts) > 1 else ""
        file_info = {
            'path': path,
            'name': str(file.parts[-1].split(".")[0]),
            'tag': tag
        }
        if tag not in result:
            result[tag] = []
        result[tag].append(file_info)

    return [
        {'tag': t[0], 'files': t[1]}
        for t in result.items()
    ]


def calc_file_hash(filepath: Union[Path, str]) -> str:
    h = sha256()
    chunk_byte_size = 8192
    with open(filepath, 'rb') as file:
        while True:
            chunk = file.read(chunk_byte_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()
