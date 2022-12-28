import time
import socketio
import jwt
import logging
import time
import sys


def get_module_logger(mod_name):
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger


sio = socketio.Client()
start_timer = None

TOKEN = jwt.encode({}, "12345", algorithm="HS256")

lastSend = time.time()

logger = get_module_logger(__name__)


def send_ping():
    global start_timer
    start_timer = time.time()
    sio.emit("ping_from_client")


@sio.event
def connect_error(error):
    logger.info(f"Socket connection error {error}")


@sio.event
def disconnect():
    logger.info("Socket Client disconnected!")


@sio.event
def connect():
    logger.info("connected to server")
    send_ping()


@sio.event
def pong_from_server():
    global start_timer
    latency = time.time() - start_timer
    logger.info("latency is {0:.2f} ms".format(latency * 1000))
    sio.sleep(1)
    if sio.connected:
        send_ping()


@sio.event
def socket_server_status(data):
    logger.info(f"Received socket_server_status")


if __name__ == "__main__":
    sio.connect(
        "https://DOMAIN", socketio_path="/socket.io", headers={"x-auth-token": TOKEN}
    )

    while True:
        try:
            if lastSend + 1 < time.time():
                if sio.connected:
                    sio.emit("socket_status", "Very good")
                logger.info("Sending message")
                lastSend = time.time()
        except Exception as e:
            logger.info(f"Exception in while: {e}")
