const searchPanelOpened = () => {
  return document.getElementsByClassName("segment-builder-embed").length > 0;
};

const findElementByInnerText = (text) => {
  var xpath = `//*[text()='${text}']`;
  var matchingElement = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  return matchingElement;
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

const convertNormalDropdownsToSelect2 = () => {
    const dropdowns = window.jQuery(".segment-builder-embed").find("select:not(.select2-hidden-accessible):not(.comparator)");
    Array.from(dropdowns).forEach((dropdown) => {
        const isInsideButtonGroup = dropdown.parentElement.className.includes("input-group");
        console.log("Inside button group", isInsideButtonGroup);
        if (!isInsideButtonGroup) dropdowns.select2();
    });
}

const elementHasEventListenerForEvent = (element, eventName) => {
    const result = window.jQuery._data(element, "events");
    return result[eventName]?.length > 0;
}

if (!searchPanelOpened()) openSearchPanel();

await loadScriptAsync(
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
);
await loadScriptAsync(
  "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"
);

console.log("jQuery", window.jQuery);
console.log("JQuery loaded");
convertNormalDropdownsToSelect2();
window.jQuery(".segment-builder-embed").find(".add-button").on("click", convertNormalDropdownsToSelect2);
setInterval(() => {
    convertNormalDropdownsToSelect2();
}, 1000);

loadCSS("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css");
createCSS(".select2-container--default .select2-results > .select2-results__options {	max-height: 55vh; }");

setInterval(() => {
    const dropdowns = window.jQuery(".segment-builder-embed").find("select.select2-hidden-accessible");
     Array.from(dropdowns).forEach((dropdown) => {
        if (!elementHasEventListenerForEvent(dropdown, "select2:select")) {
            window.jQuery(dropdown).on("select2:select", function (e) {
                console.log("Selected", e);
                e.currentTarget.dispatchEvent(new Event("change"));
            });
            console.log("Added event listener for select2:select event to dropdown", dropdown)
        }
    });
}, 1000);
