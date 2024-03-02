import os
import subprocess
from queue import Queue

import psutil
from threading import Timer, Thread
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
        self.callback_queue = Queue()
        self.callback_thread = Thread(target=self.run_callback_queue).start()

    def run_callback_queue(self):
        print("Run the callback queue.")
        while True:
            if not self.callback_queue.empty():
                with self.app.app_context():
                    callback, args = self.callback_queue.get()
                    print("CALLBACK!", callback, args)
                    callback(*args)

    @staticmethod
    def check_resources(label: str = ""):
        print(label, "- CORES", os.cpu_count(), "MEMORY", psutil.virtual_memory())
        return "TODO"

    def actual_run(self, command, callback, callback_args):
        print("We do important work!", command)
        process = subprocess.Popen(
            ['timeout', '/t', '10', 'nobreak'],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        Timer(2, self.check_resources).start()
        process.wait()
        # self.callback_queue.put([callback, callback_args])
        with self.app.app_context():
            callback(*callback_args)
        stdout, stderr = process.communicate()
        print("Now finished - Oh Kinder, wie die Zeit vergeht..", stdout, stderr)
        self.check_resources("End")

    def run(self, command, callback: Optional[Callable] = None, callback_args: Optional[Tuple] = None) -> Process:
        ProcessService.check_resources("Start")
        task = self.socketio.start_background_task(self.actual_run, command, callback, callback_args)
        # we do not join() on purpose, this is fire and forget! (... until the callback calls back.)
        return task
