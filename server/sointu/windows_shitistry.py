from pathlib import Path
from winreg import (
    ConnectRegistry,
    OpenKey,
    HKEY_LOCAL_MACHINE,
    HKEYType,
    QueryValueEx,
)


def get_windows_sdk_lib_path():
    # Wow, I can not begin to comprehend how an unsuitable Moloch like
    # the Windows registry is considered useful by some individuals.
    # I do not want to write or maintain any of the bloated code below.
    registry: HKEYType = ConnectRegistry(None, HKEY_LOCAL_MACHINE)
    sdk_key: HKEYType = OpenKey(registry, r'SOFTWARE\WOW6432Node\Microsoft\Microsoft SDKs\Windows\v10.0')
    product_version, _ = QueryValueEx(sdk_key, r'ProductVersion')
    installation_folder, _ = QueryValueEx(sdk_key, r'InstallationFolder')
    sdk_key.Close()
    registry.Close()
    return Path(installation_folder) / 'Lib' / f'{product_version}.0' / 'um' / 'x86'
