from typing import Self
from server.dependency import (
    DependencyUrls,
    Dependencies,
)
from cached_path import cached_path


class Downloader:
    def __init__(self: Self) -> None:
        for dependency, url in DependencyUrls.items():
            Dependencies[dependency] = cached_path(url, extract_archive=True)
