from wiktionaryparser import WiktionaryParser
from fastapi import FastAPI
import redis
from fastapi.responses import HTMLResponse

app = FastAPI()
r = redis.Redis(host="cache", port=6379, db=0)
from ast import literal_eval
parser = WiktionaryParser()


@app.get("/")
def read_root():
    return {"Hello": "World"}


def it(string):
    return f"<i>{string}</i>"


def bd(string):
    return f"<b>{string}</b>"


def style(short: str) -> str:
    if short == "not found":
        return short
    if hasattr(short, 'decode') and callable(getattr(short, 'decode')):
        short = short.decode('utf-8')
    decoded = short.replace(" ", " ")
    vector = decoded.split(" ")
    vector[0] = bd(vector[0])
    for i in range(1, len(vector)):
        el = vector[i]
        last = el[-1]
        if last == "," or last == ")":
            if el[0] == "(":
                vector[i] = it("(") + bd(el[1:-1]) + it(last)
            else:
                vector[i] = bd(el[:-1]) + it(last)
        else:
            vector[i] = it(el)
    new = " ".join(vector)
    return new


def recursion(word: str) -> dict:
    cached = r.get(word)
    if cached:
        return {"def": cached, "source": "cache"}

    try:
        fetched = parser.fetch(word, "german")
        try:
            working = fetched[0]["definitions"][0]
            short = working["text"][0]

            hint = working["text"][1]
            if short == word and " of " in hint:
                nextToSearch = hint.split(" ")[-1]
                nextToSearch = nextToSearch.replace(":", "")
                return recursion(nextToSearch)

            r.set(word, short)
            return {"def": short, "source": "wikitionary"}
        except:
            r.setex(word, 100, "not found")
            return {"def": "not found"}
    except:
        print("failed to fetch definition fron wikitionary")
        return {"def": "wikitionary request failed"}


@app.get("/{word}")
def read_item(word: str):
    answer = recursion(word)
    answer["def"] = style(answer["def"])
    return answer
