// ==UserScript==
// @name        DictInjector
// @namespace   https://github.com/barklan
// @match       https://translate.google.com/*
// @grant       GM_addStyle
// @version     1.8.4
// @author      barklan
// @description 10/1/2022, 10:30:25 AM
// ==/UserScript==

GM_addStyle(`
.GQpbTd {
    padding-top: 50px;
}
`);

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
    // document.getElementsByClassName("hgbeOc")[0].appendChild(newDiv);
    document.getElementsByClassName("ccvoYb")[0].appendChild(newDiv);
    newDiv.style.position = "absolute";
    // newDiv.style.right = "48px";
    newDiv.style.backgroundColor = "#D0E8FF";
    newDiv.style.padding = "10px";
    newDiv.style.marginTop = "10px";
    newDiv.style.border = "1px solid #dadce0";
    newDiv.style.borderRadius = "8px";
    newDiv.style.zIndex = "999";
    // newDiv.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,.37)";
    newDiv.style.maxWidth = "583px";
    // newDiv.style.maxWidth = "44.4vw";
    newDiv.style.marginLeft = "47vw";
    // newDiv.style.marginLeft = "46.7vw";
    newDiv.style.fontSize = "16px";

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

    var textarea = document.getElementsByTagName("textarea")[0];
    var blocked = false;

    setInterval(function() {
        if (blocked) {
            return;
        }
        blocked = true;
        // function requestInfo() {
        text = textarea.value.trim();
        if (text === "") {
            newDiv.innerHTML = `&nbsp`;
            imgDiv.innerHTML = ``;
            blocked = false;
            return;
        }
        let searchTerm = text;
        if (text.indexOf(" ") > -1) {
            let split = text.split(" ");
            searchTerm = split[split.length - 1].trim();
        }
        if (searchTerm.length <= 1) {
            blocked = false;
            return;
        }
        if (searchTerm === currentText) {
            blocked = false;
            return;
        } else {
            currentText = searchTerm;
            newDiv.innerHTML = `&nbsp`;
            imgDiv.innerHTML = ``;
        }
        let urlToFetch = `http://localhost:8000/${searchTerm}`;

        fetch(urlToFetch)
            .then((result) => {
                if (!result.ok) {
                    console.log("request to localhost translation service failed");
                    return;
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
                    blocked = false;
                } else {
                    imgDiv.innerHTML = ``;
                    blocked = false;
                }
            });
    }, 300);

    // textarea.onkeyup = requestInfo;
}, 100);
