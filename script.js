// ==UserScript==
// @name         Flowstack dropdown search
// @namespace    https://app.flowstack.com
// @version      0.1
// @description  Add search functionality to flowstack dropdowns
// @author       Nicolai Heuck
// @match        https://app.flowstack.com/profiles*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=app.flowstack.com
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';
    const insertCustomButtons = () => {
        const mainButtons = document.getElementsByClassName("main-buttons");
        if (mainButtons.length === 0) return false;

        const emailSearchDiv = document.createElement("div");
        emailSearchDiv.classList.add("input-group");
        emailSearchDiv.classList.add("email-search");
        emailSearchDiv.innerHTML = 
        `<input type="email" class="form-control" placeholder="test@hessel.dk" id="email">
        <div class="input-group-append">
            <button class="btn btn-secondary" onclick="window.searchEmail()">Søg</button>
        </div>&nbsp;`;

        const regSearchDiv = document.createElement("div");
        regSearchDiv.classList.add("input-group");
        regSearchDiv.classList.add("reg-search");
        regSearchDiv.innerHTML = 
        `<input type="text" class="form-control" placeholder="AB12345" id="regNr">
         <div class="input-group-append">
             <button class="btn btn-secondary" onclick="window.searchReg()">Søg</button>
         </div>&nbsp;`;

        const buttonContainer = mainButtons[0].children[0];
        buttonContainer.classList.add("row");
        buttonContainer.classList.add("custom-button-row");
        buttonContainer.prepend(regSearchDiv);
        buttonContainer.prepend(emailSearchDiv);

        return true;
    }

    const ensureCustomButtonsAreInserted = () => {
        const intervalId = setInterval(() => {
            if (insertCustomButtons()) clearInterval(intervalId);
        }, 10);
    }

    const ensureCustomInputsHasKeyDownEventListeners = () => {
        const intervalId = setInterval(() => {
            const emailInput = document.getElementById("email");
            const regInput = document.getElementById("regNr");
            if (!emailInput || !regInput) return;
            emailInput.onkeyup = window.searchEmailKeyUp;
            regInput.onkeyup = window.searchRegKeyUp;
            clearInterval(intervalId);
        }, 1000);
    }

    const searchPanelOpened = () => {
        return document.getElementsByClassName("segment-builder-embed").length > 0;
    };

    const findElementByInnerText = (text) => {
        const xpath = `//*[text()='${text}']`;
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };

    const openSearchPanel = () => {
        const searchButton = findElementByInnerText("Search");
        searchButton.click();
    };

    const loadScriptAsync = async (url) => {
        const response = await fetch(url);
        eval(await response.text());
    };

    const loadCSS = (url) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    };

    const createCSS = (css) => {
        const style = document.createElement("style");
        style.type = "text/css";
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
    const createAllCSS = () => {
        createCSS(".select2-container--default .select2-results > .select2-results__options {	max-height: 55vh; }");
        createCSS("select[data-select2-id] { display: none; }");
        createCSS(".email-search { width: 230px; } .reg-search { width: 160px; } .custom-button-row { justify-content: end; }");
    }

    const convertNormalDropdownsToSelect2 = () => {
        const dropdowns = window.jQuery(".segment-builder-embed").find("select:not(.select2-hidden-accessible):not(.comparator)");
        Array.from(dropdowns).forEach((dropdown) => {
            const isInsideButtonGroup = dropdown.parentElement.className.includes("input-group");
            if (!isInsideButtonGroup) $(dropdown).select2();
        });
    }

    const addEventDispatcherToDropdownIfMissing = (dropdown) => {
        if (elementHasEventListenerForEvent(dropdown, "select2:select")) return;
        
        window.jQuery(dropdown).on("select2:select", (e) => {
            e.currentTarget.dispatchEvent(new Event("change"));
        });
    };

    const elementHasEventListenerForEvent = (element, eventName) => {
        const result = window.jQuery._data(element, "events");
        return result[eventName]?.length > 0;
    }

    const runSegQL = (segQL) => {
        const params = new URLSearchParams(location.search);
        params.set("segql", segQL)
        location.search = params.toString()
    }

    const searchEmail = () => {
        const emailToSearch = document.getElementById("email").value;
        runSegQL(`{"$and":[{"$and":[{"email":{"contains":"${emailToSearch}"}}]}]}`);
    }
    const searchEmailKeyUp = (e) => {
        if (e.key === "Enter") searchEmail();
    }

    const searchReg = () => {
        const regToSearch = document.getElementById("regNr").value;
        runSegQL(`{"$and":[{"$and":[{"cars":{"$includes":{"$and":[{"registrationnumber":{"contains":"${regToSearch}"}}]}}}]}]}`);
    }
    const searchRegKeyUp = (e) => {
        if (e.key === "Enter") searchReg();
    }

    window.searchEmail = searchEmail;
    window.searchEmailKeyUp = searchEmailKeyUp;
    window.searchReg = searchReg;
    window.searchRegKeyUp = searchRegKeyUp;

    setTimeout(() => {
        const profilesLink = document.querySelector('a[href="/profiles"]');
        console.log("profilesLink", profilesLink);
        profilesLink.onclick = async () => {
            console.log("Profiles link clicked");
            await loadAsync();
        };
    }, 1000);

    const loadAsync = async () => {
        console.log("Loading async");
        createAllCSS();
        ensureCustomButtonsAreInserted();
        ensureCustomInputsHasKeyDownEventListeners();

        if (!searchPanelOpened()) openSearchPanel();
        
        await loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js");
        await loadScriptAsync("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js");
        loadCSS("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css");

        convertNormalDropdownsToSelect2();

        setInterval(() => {
          const dropdowns = window.jQuery(".segment-builder-embed").find("select.select2-hidden-accessible");
          Array.from(dropdowns).forEach(addEventDispatcherToDropdownIfMissing);
        }, 1000);
        setInterval(() => {
            const addButtons = window.jQuery(".segment-builder-embed").find(".add-button");
            Array.from(addButtons).forEach((addButton) => {
                addButton.onclick = convertNormalDropdownsToSelect2;
            });
        }, 1000);
    }


    setTimeout(async () => await loadAsync(), 1000);
})();
