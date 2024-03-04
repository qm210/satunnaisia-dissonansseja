"""

DOES NOT WORK YET!!

tried to call this via
  poetry run python server/wsgi.py

  --> results in circular imports. Solve this some other day.
  --> also not sure whether this actually needs the eventlet.monkey_patch() or whatever...

"""
# eventlet.monkey_patch() must be run "before importing any other modules". sounds greedy, but here we are.
import eventlet

eventlet.monkey_patch()

from app import create_app

if __name__ == '__main__':
    app = create_app()

    app.logger.info(
        "Welcome to Satunnaisia Dissonansseja WSGI Server, DEBUG is %s", app.config['DEBUG']
    )
    socketio = app.config['SOCKETIO']
    socketio.run(
        app,
        log_output=True,
        debug=app.config['DEBUG'],
        use_reloader=app.config['DEBUG']
    )

    # from waitress import serve
    # serve(app, host='0.0.0.0', port=8080)
