up:
  docker-compose up --build

upd:
  docker-compose up -d

down:
  docker-compose down

back-server:
  uvicorn main:app --reload --port 8000

provider-server:
  npx http-server -c5 --port 9999
