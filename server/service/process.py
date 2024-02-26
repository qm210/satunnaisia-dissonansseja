import os
import subprocess
from multiprocessing import Process

import psutil


class ProcessService:
    """
    it made sense to me to pack all the resource management / subprocess calling stuff
    into its own service. Maybe this makes sense, maybe it can be merged somewhere, we'll see.
    """

    def __init__(self):
        pass

    @staticmethod
    def check_resources():
        print("CORES", os.cpu_count(), "MEMORY", psutil.virtual_memory())
        return "TODO"

    def run(self, command, **kwargs):
        self.check_resources()
        #
        # def run_and_wait():
        #     process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        #     stdout, stderr = process.communicate()
        #     print("Subprocess finished.", stdout, stderr)
        #
        # resources = self.check_resources()
        # # threading.Thread(target=callback, args=(process,)).start()
        # p = Process(target=run_and_wait)
        # p.start()
