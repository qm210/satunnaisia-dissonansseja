import eventlet
import psutil
from multiprocessing import Process
from typing import Optional, Callable, Tuple, List

from server.sointu.sointu_command import SointuCommand


class ProcessService:
    """
    it made sense to me to pack all the resource management / subprocess calling stuff
    into its own service. Maybe this makes sense, maybe it can be merged somewhere, we'll see.
    """

    def __init__(self, app):
        self.app = app
        self.socketio = app.config['SOCKETIO']

    def wait_for_cpu_percent_under(self, threshold_percent: float, wait_seconds: float) -> None:
        while True:
            cpu_percent = psutil.cpu_percent()
            if cpu_percent <= threshold_percent:
                break
            self.app.logger.warn(
                f"CPU USAGE {cpu_percent}% > {threshold_percent}%, wait {wait_seconds} sec."
            )
            eventlet.sleep(wait_seconds)

    def run_if_resources_free(self, commands: List[SointuCommand], callback, callback_args):
        self.wait_for_cpu_percent_under(60, 5)
        for index, command in enumerate(commands):
            self.app.logger.info(
                f"Run Step {index + 1}/{len(commands)}{' in Shell' if command.enforce_escaping else ''}: {command}"
            )
            stdout, stderr, returncode = command.run_and_wait()
            if stdout:
                self.app.logger.info(stdout)
            if stderr:
                self.app.logger.warn(stderr)

        with self.app.app_context():
            callback(*callback_args)
            # self.socketio.start_background_task(
            #     callback,
            #     *callback_args
            # )

    def run(self, commands, callback: Optional[Callable] = None, callback_args: Optional[Tuple] = None) -> Process:
        task = self.socketio.start_background_task(
            self.run_if_resources_free,
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
