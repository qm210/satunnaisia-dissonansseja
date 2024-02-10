from typing import Self, Dict
from server.sointu.dependency import (
    DependencyUrls, Dependency,
)
from pathlib import Path
from cached_path import cached_path


class Downloader:
    dependencies: Dict[Dependency, Path] = {}

    def __init__(self: Self) -> None:
        for dependency, url in DependencyUrls.items():
            self.dependencies[dependency] = cached_path(url, extract_archive=True)
