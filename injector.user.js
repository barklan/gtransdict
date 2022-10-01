// ==UserScript==
// @name        DictInjector
// @namespace   https://github.com/barklan
// @match       https://translate.google.com/*
// @grant       none
// @version     1.2.0
// @author      barklan
// @description 10/1/2022, 10:30:25 AM
// ==/UserScript==

setTimeout(() => {

  const newDiv = document.createElement("div");
  document.getElementsByClassName("hgbeOc")[0].appendChild(newDiv);
  newDiv.style.position = "fixed";
  newDiv.style.right = "48px";
  newDiv.style.backgroundColor = "white";
  newDiv.style.padding = "10px";
  newDiv.style.border = "1px solid #dadce0";
  newDiv.style.borderRadius = "8px";
  newDiv.style.zIndex = "999";
  newDiv.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,.37)";

  var currentPage = location.href;

  setInterval(function () {
    currentPage = location.href;

    var textarea = document.getElementsByTagName('textarea')[0];
    const text = textarea.value.trim()

    let searchTerm = text
    if (text.indexOf(' ') > -1) {
      let split = text.split(' ');
      searchTerm = split[split.length - 1].trim();
    }
    let urlToFetch = `http://localhost:8000/${searchTerm}`

    fetch(urlToFetch)
      .then((result) => {
        if (!result.ok) {
          alert('request failed');
        }
        return result.text();
      })
      .then((content) => {
        const resp = JSON.parse(content);
        const respDef = resp.def;
        newDiv.innerHTML = respDef;
      });
  }, 500);

}, 100)
