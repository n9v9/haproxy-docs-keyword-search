// ==UserScript==
// @name         HAProxy Configuration Manual Keyword Search
// @namespace    https://github.com/n9v9/haproxy-docs-keyword-search
// @version      2024-07-27
// @description  Add a third column "Keyword Search" to the HAProxy Configuration Manual website to search for keywords more easily.
// @author       Niklas Vogel
// @match        https://docs.haproxy.org/*/configuration.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=haproxy.org
// @grant        none
// ==/UserScript==

"use strict";

(() => {
    const div = document.createElement("div");
    div.innerHTML = `
        <div style="width: 100%; padding-right: 50px; margin-bottom: 50px">
            <h2>Keyword Search</h2>
            <input
                id="kw-search-input"
                placeholder="Type regex to search …"
                type="text"
                style="width: 100%; display: block"
            />
            <div style="overflow-x: scroll; white-space: nowrap">
                <table
                    style="margin-top: 10px; border-collapse: separate; border-spacing: 10px 0; margin-left: -10px"
                >
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Section</th>
                        </tr>
                    </thead>
                    <tbody id="matching-kws"></tbody>
                </table>
            </div>
        </div>
    `;
    div.style.position = "fixed";
    div.style.overflowY = "scroll";
    div.style.top = "50px";
    div.style.left = "1070px";
    div.style.right = "0";
    div.style.height = "calc(100vh - 50px)";

    document.querySelector("body > #wrapper").append(div);

    const sectionStack = [];
    const keywords = [];

    // Elements are layed out sequentially, only keywords are nested in a div.
    // Just traverse all elements, pushing and popping sections from the stack as needed.
    for (const elem of document.querySelector("#page-wrapper > div.row > div.col-lg-12").children) {
        if (elem.tagName == "DIV" && elem.classList.contains("page-header")) {
            sectionStack.length = 0;
            sectionStack.push(elem.querySelector("h1").textContent);
        } else if (elem.tagName == "H2" && elem.id.startsWith("chapter-")) {
            sectionStack.length = 1;
            sectionStack.push(elem.textContent);
        } else if (elem.tagName == "H3" && elem.id.startsWith("chapter-")) {
            sectionStack.length = 2;
            sectionStack.push(elem.textContent);
        } else if (elem.tagName == "DIV" && elem.classList.length === 0) {
            for (const keywordElem of elem.querySelectorAll("div.keyword b a[href]")) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><a href="${keywordElem.href}">${keywordElem.text}</a></td>
                    <td>${sectionStack.join(" / ")}</td>
                `;
                keywords.push({
                    sections: [...sectionStack],
                    text: keywordElem.text,
                    elem: tr,
                });
            }
        }
    }

    const matchingKws = document.querySelector("#matching-kws");
    for (const kw of keywords) matchingKws.append(kw.elem);

    const search = document.querySelector("#kw-search-input");
    search.onkeyup = e => {
        const v = search.value.trim();
        if (v.length === 0) {
            for (const kw of keywords) kw.elem.style.display = "";
            return;
        }
        const re = new RegExp(v);
        for (const kw of keywords) kw.elem.style.display = re.test(kw.text) ? "" : "none";
    };
})();
