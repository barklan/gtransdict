// ==UserScript==
// @name        DictInjector
// @namespace   https://github.com/barklan
// @match       *://translate.google.com/*
// @grant       none
// @version     1.0.1
// @author      barklan
// @description 10/1/2022, 10:30:25 AM
// ==/UserScript==

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

setInterval(function()
{
    if (currentPage != location.href)
    {
        currentPage = location.href;

          // alert('changed!');
          let url = window.location.search;
          const urlParams = new URLSearchParams(url);
          const text = urlParams.get('text');
          if (text.indexOf(' ') > -1) {
              // let split = text.split(' ');
              // const wordNum = split.length;
              // alert(wordNum);
              console.log('multiple words');
          } else {
              // alert(text);
              let urlToFetch = `http://localhost:8000/${text}`

              fetch(urlToFetch)
              .then((result) => {
                if (!result.ok) {
                  alert('request failed');
                }
                return result.text();
              })
              .then((content) => {
                  // var el = document.createElement( 'html' );
                  // el.innerHTML = content;
                  const resp = JSON.parse(content);
                  const respDef = resp.def;
                  newDiv.innerText = respDef;
                  // newDiv.style.position = 'fixed';
                  // document.body.appendChild(para);
                  // const term = html.getElementsByClassName('search-term');

                  // var html = $.parseHTML(content);
                  // const res = el.querySelector('.search-term');
                  // alert(res.text());
                  // console.log(content);
                  // alert(term.text);
                  // document.getElementById("ID").innerHTML = content;
              });
          }
    }
}, 500);

// let url = 'https://en.langenscheidt.com/german-english/'

// let response = await fetch(url);

// if (response.ok) { // if HTTP-status is 200-299
//   // get the response body (the method explained below)
//   let json = await response.json();
// } else {
//   alert("HTTP-Error: " + response.status);
// }
