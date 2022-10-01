from wiktionaryparser import WiktionaryParser
from fastapi import FastAPI
import redis

app = FastAPI()
r = redis.Redis(host="cache", port=6379, db=0)
parser = WiktionaryParser()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/{word}")
def read_item(word: str):
    cached = r.get(word)
    if cached:
        return {"def": cached, "source": "cache"}

    try:
        fetched = parser.fetch(word, "german")
        try:
            short = fetched[0]["definitions"][0]["text"][0]
            r.set(word, short)
            return {"def": short, "source": "wikitionary"}
        except:
            r.setex(word, 100, "not found")
            return {"def": "not found"}
    except:
        print("failed to fetch definition fron wikitionary")
        return {"def": "wikitionary request failed"}
