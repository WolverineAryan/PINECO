FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for reportlab/pillow and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api/pineco ./pineco
COPY apps/api/alembic.ini ./

ENV PYTHONPATH=/app
ENV APP_ENV=production
ENV API_PORT=8000
ENV API_HOST=0.0.0.0

EXPOSE 8000

CMD ["uvicorn", "pineco.main:app", "--host", "0.0.0.0", "--port", "8000"]
