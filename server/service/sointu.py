import ctypes


class SointuService:
    def __init__(self, config):
        self.config = config

    def debug(self):
        # assumption: this dll is in the project root directory, maybe create it with
        # go build -o sointu-track.dll -buildmode=c-shared .\cmd\sointu-track\main.go
        sointu_lib = ctypes.CDLL('./sointu-track.dll')
        # # Assume you have a Go function `Add` that takes two ints and returns an int
        # mylibrary.Add.argtypes = [ctypes.c_int, ctypes.c_int]
        # mylibrary.Add.restype = ctypes.c_int
        # # Now you can call the Go function from Python
        # result = mylibrary.Add(1, 2)
        return "Not implemented yet"
