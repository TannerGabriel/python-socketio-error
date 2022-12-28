FROM python:3.10-slim-buster

RUN apt-get update -y && apt-get upgrade -y

RUN pip install -U pip

RUN pip install "python-socketio[client]"

RUN pip install PyJWT

ADD . .

CMD ["python", "client.py"]
