import os
import subprocess
import psutil
from threading import Timer
from multiprocessing import Process
from typing import Optional, Callable, Tuple


class ProcessService:
    """
    it made sense to me to pack all the resource management / subprocess calling stuff
    into its own service. Maybe this makes sense, maybe it can be merged somewhere, we'll see.
    """

    def __init__(self, app, socketio):
        self.app = app
        self.socketio = socketio

    def check_resources(self, label: str = ""):
        self.app.logger.info(label, "- CORES", os.cpu_count(), "MEMORY", psutil.virtual_memory())

    def actual_run(self, command, callback, callback_args):
        self.app.logger.info("We do important work!", command)
        process = subprocess.Popen(
            ['timeout', '/t', '10', '/nobreak'],
            shell=True,
            # these won't work with shell=True, it seems:
            # stdout=subprocess.PIPE,
            # stderr=subprocess.PIPE,
        )
        Timer(2, self.check_resources).start()
        process.wait()
        with self.app.app_context():
            callback(*callback_args)
        stdout, stderr = process.communicate()
        if stdout is not None:
            self.app.logger.info(stdout)
        if stderr is not None:
            self.app.logger.warn(stderr)
        self.check_resources("End")

    def run(self, command, callback: Optional[Callable] = None, callback_args: Optional[Tuple] = None) -> Process:
        self.check_resources("Start")
        task = self.socketio.start_background_task(self.actual_run, command, callback, callback_args)
        # we do not join() on purpose, this is fire and forget! (... until the callback calls back.)
        return task
