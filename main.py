from wiktionaryparser import WiktionaryParser
from fastapi import FastAPI
parser = WiktionaryParser()

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/{word}")
def read_item(word: str):
    fetched = parser.fetch(word, 'german')
    short = "not found"
    try:
        short = fetched[0]["definitions"][0]["text"][0]
    except:
        print('fail')
    return {"def": short}
