FROM python:3.9-slim

RUN pip install git+https://github.com/smartiqaorg/geometric_lib.git

COPY script.py /app/script.py

WORKDIR /app

CMD ["python","script.py"]
