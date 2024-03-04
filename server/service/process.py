import os
import subprocess

import psutil
from multiprocessing import Process
from typing import Optional, Callable, Tuple, List

from server.sointu.sointu_command import SointuCommand
from server.utils.math import human_readable_bytes


class ProcessService:
    """
    it made sense to me to pack all the resource management / subprocess calling stuff
    into its own service. Maybe this makes sense, maybe it can be merged somewhere, we'll see.
    """

    def __init__(self, app):
        self.app = app
        self.socketio = app.config['SOCKETIO']

    def check_resources(self, label: str = ""):
        memory = psutil.virtual_memory()
        free_memory = human_readable_bytes(memory.free)
        self.app.logger.info(f"{label} - MEMORY FREE {free_memory}, USED {memory.percent}% ({os.cpu_count()} cores)")

    def actual_run(self, commands: List[SointuCommand], callback, callback_args):
        for index, command in enumerate(commands):
            self.app.logger.info(
                f"Run Step {index + 1}/{len(commands)}{' in Shell' if command.shell else ''}: {command}"
            )
            actual_command = (
                command.command
                if not command.shell else
                str(command)
            )
            process = subprocess.Popen(
                actual_command,
                shell=command.shell,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            returncode = process.wait()
            stdout, stderr = process.communicate()
            if stdout:
                self.app.logger.info(stdout.decode())
            if stderr:
                self.app.logger.warn(stderr.decode())
            if returncode != 0 and command.raise_on_error:
                self.app.logger.error(f"Returned {returncode} from command '{command}'")
                raise command.raise_on_error

        with self.app.app_context():
            callback(*callback_args)
        self.check_resources("End")  # todo: just temporary

    def run(self, commands, callback: Optional[Callable] = None, callback_args: Optional[Tuple] = None) -> Process:
        self.check_resources("Start")  # todo: just temporary
        task = self.socketio.start_background_task(
            self.actual_run,
            commands,
            callback,
            callback_args
        )
        # we do not join() on purpose, this is fire and forget
        # ... until the callback calls back.
        return task

# TODO:
# - put the real sointu calls there
# - let socketio emit the status
# - return the instrument run id for the client to navigate
# - send only these socket messages that make sense for that id
# - try all that with a larger pool, not canceling after the first try.
