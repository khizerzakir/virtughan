const resultSourceState = {
  search: null,
  analyze: null,
  download: null,
};

let activeResultSource = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getResultSourceLabel(source) {
  if (source === "search") return "Search";
  if (source === "analyze") return "Analyze";
  if (source === "download") return "Download";
  return "None";
}

function getResultContainer() {
  return document.getElementById("feature-list");
}

function getResultCountLabel() {
  return document.getElementById("display-image-count");
}

function getResultActiveLabel() {
  return document.getElementById("result-active-source");
}

function getResultSwitcher() {
  return document.getElementById("result-source-switcher");
}

function normalizeItems(payload) {
  if (!payload || !Array.isArray(payload.items)) {
    return [];
  }
  return payload.items;
}

function renderSceneList(items) {
  return items
    .map((feature, index) => {
      const datetime = feature?.properties?.datetime || "Unknown date";
      const cloudCover = feature?.properties?.["eo:cloud_cover"];
      const cloudCoverLabel = cloudCover === undefined ? "N/A" : `${parseInt(cloudCover, 10)} %`;
      return `
        <ul role="list" class="divide-y divide-gray-100">
          <li id="result_list_${index}" data-result-index="${index}" class="result-list-items flex justify-between gap-x-6 py-5 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
            <div class="flex min-w-0 items-start gap-x-4">
              <img class="size-12 flex-none rounded-full bg-gray-50" src="static/img/satellite-basemap.png" alt="">
              <div class="min-w-0 flex-auto">
                <p class="text-sm/6 font-semibold text-gray-900">${escapeHtml(feature?.id || "Unknown scene")}</p>
                <p class="mt-1 truncate text-xs/5 text-gray-500">${escapeHtml(datetime)}</p>
              </div>
            </div>
            <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <p class="mt-auto text-xs/5 text-gray-400"><i class="fa-solid fa-cloud"></i> ${escapeHtml(cloudCoverLabel)}</p>
            </div>
          </li>
        </ul>
      `;
    })
    .join("");
}

function wireSceneResultInteractions(items, source) {
  const listItems = document.querySelectorAll(".result-list-items");
  listItems.forEach((element, index) => {
    const feature = items[index];
    if (!feature) {
      return;
    }

    element.addEventListener("mouseleave", function (event) {
      if (typeof highlightedLayer !== "undefined" && Object.keys(highlightedLayer._layers || {}).length > 0) {
        const rowId = event.currentTarget?.id;
        if (clickedResultList === false && previousListMouseIn != rowId) {
          map.closePopup();
          highlightedLayer.clearLayers();
        } else if (previousListMouseIn == rowId) {
          map.removeLayer(highlightedLayer);
        }
      }
      previousListMouseIn = event.currentTarget?.id;
    });

    element.addEventListener("mouseenter", function () {
      if (typeof highlightedLayer !== "undefined" && Object.keys(highlightedLayer._layers || {}).length > 0) {
        map.closePopup();
        highlightedLayer.clearLayers();
      }
      const hoveredLayer = createLayer(feature);
      highlightedLayer.addLayer(hoveredLayer);
      hoveredLayer.bindPopup(createPopup(feature));
      highlightedLayer.addTo(map);
      clickedResultList = false;
    });

    element.addEventListener("click", function () {
      if (highlightedLayer.getLayers()[0]) {
        highlightedLayer.getLayers()[0].openPopup();
        clickedResultList = true;
      }
    });
  });
}

function renderFileList(items) {
  return items
    .map((file, index) => {
      const name = typeof file === "string" ? file : file.name;
      const size = typeof file === "string" ? null : file.size;
      const sizeLabel = typeof size === "number" ? `${(size / 1024).toFixed(1)} KB` : "";
      const ext = (name || "").split(".").pop().toLowerCase();
      const icon = ext === "png" || ext === "jpg" || ext === "jpeg" ? "fa-image" : ext === "zip" ? "fa-file-zipper" : "fa-file";
      return `
        <ul role="list" class="divide-y divide-gray-100">
          <li id="result_list_${index}" class="result-list-items flex flex-col gap-2 rounded-md py-4 px-2 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
            <div class="flex min-w-0 items-start gap-x-4">
              <div class="size-12 flex-none rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <i class="fa-solid ${icon}"></i>
              </div>
              <div class="min-w-0 flex-auto">
                <p class="text-sm/6 font-semibold text-gray-900 break-words">${escapeHtml(name || "Unnamed file")}</p>
                <p class="mt-1 truncate text-xs/5 text-gray-500">${escapeHtml(sizeLabel)}</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 pl-16">
              <span>${escapeHtml(ext.toUpperCase())}</span>
              <span class="text-gray-400">Available output</span>
            </div>
          </li>
        </ul>
      `;
    })
    .join("");
}

function renderResultPayload(source, payload) {
  const container = getResultContainer();
  const countLabel = getResultCountLabel();
  const activeLabel = getResultActiveLabel();
  const items = normalizeItems(payload);

  if (!container || !countLabel) {
    return;
  }

  if (!payload || items.length === 0) {
    container.innerHTML = '<label class="block text-sm font-medium text-gray-400 pt-4">No results available yet.</label>';
    countLabel.innerHTML = 'Images: <span class="text-xs">0</span>';
    if (activeLabel) {
      activeLabel.textContent = `Active result: ${getResultSourceLabel(source)}`;
    }
    if (typeof clearResultBboxLayers === "function") {
      clearResultBboxLayers();
    }
    return;
  }

  const renderedList = payload.kind === "files" ? renderFileList(items) : renderSceneList(items);
  container.innerHTML = renderedList;
  countLabel.innerHTML = `Images: <span class="text-xs">${items.length}</span>`;
  if (activeLabel) {
    activeLabel.textContent = `Active result: ${getResultSourceLabel(source)}`;
  }
  if (payload.kind !== "files") {
    wireSceneResultInteractions(items, source);
  }
  if (typeof syncResultBboxLayers === "function") {
    syncResultBboxLayers(source, payload);
  }
}

function refreshActiveResult() {
  const source = activeResultSource || getResultSwitcher()?.value || "search";
  const payload = resultSourceState[source];
  renderResultPayload(source, payload);
}

function setActiveResultSource(source) {
  if (!Object.prototype.hasOwnProperty.call(resultSourceState, source)) {
    return;
  }
  activeResultSource = source;
  const switcher = getResultSwitcher();
  if (switcher && switcher.value !== source) {
    switcher.value = source;
  }
  refreshActiveResult();
}

function setResultSource(source, payload) {
  if (!Object.prototype.hasOwnProperty.call(resultSourceState, source)) {
    return;
  }
  resultSourceState[source] = payload;
  if (!activeResultSource) {
    activeResultSource = source;
  }
  if (activeResultSource === source) {
    const switcher = getResultSwitcher();
    if (switcher) {
      switcher.value = source;
    }
    renderResultPayload(source, payload);
  }
}

function clearResultSources() {
  resultSourceState.search = null;
  resultSourceState.analyze = null;
  resultSourceState.download = null;
  activeResultSource = null;
  const container = getResultContainer();
  const countLabel = getResultCountLabel();
  const activeLabel = getResultActiveLabel();
  const switcher = getResultSwitcher();
  if (container) {
    container.innerHTML = '<label class="block text-sm font-medium text-gray-400 pt-4">Apply the Filter First!!!</label>';
  }
  if (countLabel) {
    countLabel.innerHTML = 'Images: <span class="text-xs"></span>';
  }
  if (activeLabel) {
    activeLabel.textContent = 'Active result: None';
  }
  if (switcher) {
    switcher.value = 'search';
  }
  if (typeof clearResultBboxLayers === "function") {
    clearResultBboxLayers();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const switcher = getResultSwitcher();
  if (switcher) {
    switcher.addEventListener('change', (event) => {
      setActiveResultSource(event.target.value);
    });
  }
  if (!activeResultSource) {
    const activeLabel = getResultActiveLabel();
    if (activeLabel) {
      activeLabel.textContent = 'Active result: None';
    }
  }
});

window.setResultSource = setResultSource;
window.setActiveResultSource = setActiveResultSource;
window.clearResultSources = clearResultSources;
window.refreshActiveResult = refreshActiveResult;

function buildSearchRequestUrl(params) {
  const bbox = encodeURIComponent(params.bbox || "");
  const startDate = encodeURIComponent(params.startDate || "");
  const endDate = encodeURIComponent(params.endDate || "");
  const cloudCover = encodeURIComponent(params.cloudCover ?? "30");
  const collection = encodeURIComponent(params.collection || "sentinel-2-l2a");
  return `/search?bbox=${bbox}&start_date=${startDate}&end_date=${endDate}&cloud_cover=${cloudCover}&collection=${collection}`;
}

function fetchSearchResults(params) {
  const requestUrl = buildSearchRequestUrl(params);
  return fetch(requestUrl, { method: "GET" })
    .then((response) => response.json())
    .then((data) => (data && Array.isArray(data.features) ? data.features : []));
}

window.buildSearchRequestUrl = buildSearchRequestUrl;
window.fetchSearchResults = fetchSearchResults;