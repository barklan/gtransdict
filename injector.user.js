// ==UserScript==
// @name        DictInjector
// @namespace   https://github.com/barklan
// @match       https://translate.google.com/*
// @grant       none
// @version     1.5.0
// @author      barklan
// @description 10/1/2022, 10:30:25 AM
// ==/UserScript==

setTimeout(() => {
    document.onkeyup = function(e) {
        // Ctrl + M
        if (e.ctrlKey && e.which == 77) {
            var textarea = document.getElementsByTagName("textarea")[0];
            textarea.value = "";
            textarea.focus();
        }
    };

    // Dict div
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

    // Image div
    const imgDiv = document.createElement("div");
    document.getElementsByClassName("ccvoYb")[0].appendChild(imgDiv);
    imgDiv.style.border = "1px solid #dadce0";
    imgDiv.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,.37)";
    imgDiv.style.zIndex = "9998";
    imgDiv.style.position = "fixed";
    // imgDiv.style.margin = "auto";
    // imgDiv.style.width = "auto";
    // imgDiv.style.maxHeight = "200px";
    imgDiv.style.right = "0px";
    imgDiv.style.bottom = "0px";

    var currentPage = location.href;
    var currentText = "";

    setInterval(function() {
        currentPage = location.href;

        var textarea = document.getElementsByTagName("textarea")[0];
        text = textarea.value.trim();
        if (text === "") {
            imgDiv.innerHTML = ``;
            return;
        }
        if (text === currentText) {
            return;
        } else {
            currentText = text;
            imgDiv.innerHTML = ``;
        }

        let searchTerm = text;
        if (text.indexOf(" ") > -1) {
            let split = text.split(" ");
            searchTerm = split[split.length - 1].trim();
        }
        if (searchTerm.length <= 2) {
            return;
        }
        let urlToFetch = `http://localhost:8000/${searchTerm}`;

        fetch(urlToFetch)
            .then((result) => {
                if (!result.ok) {
                    alert("request failed");
                }
                return result.text();
            })
            .then((content) => {
                const resp = JSON.parse(content);
                const respDef = resp.def;
                newDiv.innerHTML = respDef;
                const hint = resp.hint;
                if (hint != "") {
                    // Image
                    fetch(`https://imsea.herokuapp.com/api/1?q=${hint}`)
                        .then((result) => {
                            if (!result.ok) {
                                alert("image request failed");
                            }
                            return result.text();
                        })
                        .then((content) => {
                            const resp = JSON.parse(content);
                            const imageUrl = resp.results[0];
                            const imageUrl2 = resp.results[2];
                            const imageUrl3 = resp.results[4];
                            imgDiv.innerHTML = `
<img id="term-image" style="max-height: 150px; width: auto;" src="${imageUrl}" alt="${hint} image">
<img id="term-image2" style="max-height: 150px; width: auto;" src="${imageUrl2}" alt="${hint} image2">
<img id="term-image3" style="max-height: 150px; width: auto;" src="${imageUrl3}" alt="${hint} image3">
`;
                        });
                } else {
                    imgDiv.innerHTML = ``;
                }
            });
    }, 500);
}, 100);
