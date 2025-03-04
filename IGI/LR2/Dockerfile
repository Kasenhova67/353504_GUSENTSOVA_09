
FROM python:3.9-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/smartiqaorg/geometric_lib.git /app/geometric_lib

COPY script.py /app/script.py

WORKDIR /app

ENV PYTHONPATH=/app/geometric_lib

CMD ["python", "script.py"]



