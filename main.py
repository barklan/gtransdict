from wiktionaryparser import WiktionaryParser
from fastapi import FastAPI
import redis

app = FastAPI()
r = redis.Redis(host="cache", port=6379, db=0)
parser = WiktionaryParser()

NOT_FOUND = "---"


@app.get("/")
def read_root():
    return {"def": "&nbsp"}


def it(string):
    return f"<i>{string}</i>"


def bd(string):
    return f"<b>{string}</b>"


def style(short: str) -> str:
    if hasattr(short, "decode") and callable(getattr(short, "decode")):
        short = short.decode("utf-8")
    decoded = short.replace(" ", " ")
    if decoded == NOT_FOUND:
        return decoded
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


def remove_text_inside_brackets(text, brackets="()[]"):
    count = [0] * (len(brackets) // 2)  # count open/close brackets
    saved_chars = []
    for character in text:
        for i, b in enumerate(brackets):
            if character == b:  # found bracket
                kind, is_close = divmod(i, 2)
                count[kind] += (-1) ** is_close  # `+1`: open, `-1`: close
                if count[kind] < 0:  # unbalanced bracket
                    count[kind] = 0  # keep it
                else:  # found bracket to remove
                    break
        else:  # character is not a [balanced] bracket
            if not any(count):  # outside brackets
                saved_chars.append(character)
    return "".join(saved_chars)


def recursion(word: str) -> dict:
    cached = r.get(word)
    cachedHint = r.get(word + "_hint")
    if cached and cachedHint:
        return {"def": cached, "hint": cachedHint, "source": "cache"}

    try:
        fetched = parser.fetch(word, "german")
        try:
            working = fetched[0]["definitions"][0]
            short = working["text"][0]
            hint = ""
            if len(working["text"]) >= 2:
                hint = working["text"][1]
                if short == word and " of " in hint:
                    nextToSearch = hint.split(" ")[-1]
                    nextToSearch = nextToSearch.replace(":", "")
                    return recursion(nextToSearch)
                # if working["partOfSpeech"] in ["preposition", "pronoun", "article"]:
                if working["partOfSpeech"] != "noun":
                    hint = ""
                else:
                    hint = remove_text_inside_brackets(hint).strip()

            r.set(word, short)
            r.set(word + "_hint", hint)
            return {"def": short, "hint": hint, "source": "wikitionary"}
        except:
            r.setex(word, 100, NOT_FOUND)
            r.setex(word + "_hint", 100, "")
            return {"def": NOT_FOUND, "hint": ""}
    except:
        print("failed to fetch definition fron wikitionary")
        return {"def": "wikitionary request failed", "hint": ""}


@app.get("/{word}")
def read_item(word: str):
    answer = recursion(word)
    return {"def": style(answer["def"]), "hint": answer["hint"]}
