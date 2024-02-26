from pathlib import Path

from server.sointu.windows_shitistry import get_windows_sdk_lib_path

# just useful for some of the modules as standalone test scripts,
# e.g. their "if __name__ == "__main__": ..." parts,

# obviously, you need to change this if you move teh templates fold0r
relative_template_path = "../templates"
templates_path = (Path(__file__).parent / relative_template_path).resolve()

win_sdk_lib_path = get_windows_sdk_lib_path()
