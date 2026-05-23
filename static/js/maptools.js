// Map Tools: Export, Measure, Upload

(function () {
  // ---- Tool Control ----
  var MapToolsControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      container.style.background = 'white';

      // Export button
      var exportBtn = L.DomUtil.create('a', '', container);
      exportBtn.href = '#';
      exportBtn.title = 'Export Map';
      exportBtn.innerHTML = '<i class="fa-solid fa-download" style="font-size:14px;line-height:30px;width:30px;text-align:center;display:block;color:#4b5563;"></i>';
      exportBtn.style.width = '30px';
      exportBtn.style.height = '30px';
      L.DomEvent.on(exportBtn, 'click', function (e) {
        L.DomEvent.stop(e);
        toggleDropdown('export-tool-dropdown');
      });

      // Export dropdown
      var exportDrop = L.DomUtil.create('div', 'tool-dropdown', container);
      exportDrop.id = 'export-tool-dropdown';
      exportDrop.className = 'tool-dropdown hidden';
      exportDrop.style.cssText = 'position:absolute;left:35px;top:0;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;white-space:nowrap;padding:4px 0;border:1px solid #e5e7eb;';
      exportDrop.innerHTML = '<a href="#" class="export-opt block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100" data-format="png"><i class="fa-solid fa-file-image mr-2"></i>PNG</a>' +
        '<a href="#" class="export-opt block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100" data-format="pdf"><i class="fa-solid fa-file-pdf mr-2"></i>PDF</a>';

      // Measure button
      var measureBtn = L.DomUtil.create('a', '', container);
      measureBtn.href = '#';
      measureBtn.title = 'Measure';
      measureBtn.innerHTML = '<i class="fa-solid fa-ruler-combined" style="font-size:14px;line-height:30px;width:30px;text-align:center;display:block;color:#4b5563;"></i>';
      measureBtn.style.width = '30px';
      measureBtn.style.height = '30px';
      L.DomEvent.on(measureBtn, 'click', function (e) {
        L.DomEvent.stop(e);
        toggleDropdown('measure-tool-dropdown');
      });

      // Measure dropdown
      var measureDrop = L.DomUtil.create('div', 'tool-dropdown', container);
      measureDrop.id = 'measure-tool-dropdown';
      measureDrop.className = 'tool-dropdown hidden';
      measureDrop.style.cssText = 'position:absolute;left:35px;top:30px;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;white-space:nowrap;padding:4px 0;border:1px solid #e5e7eb;';
      measureDrop.innerHTML = '<a href="#" class="measure-opt block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100" data-type="length"><i class="fa-solid fa-arrows-left-right mr-2"></i>Length</a>' +
        '<a href="#" class="measure-opt block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100" data-type="area"><i class="fa-solid fa-vector-square mr-2"></i>Area</a>' +
        '<a href="#" id="clear-measurements" class="block px-4 py-2 text-xs text-red-500 hover:bg-gray-100"><i class="fa-solid fa-trash-can mr-2"></i>Clear</a>';

      // Upload button
      var uploadBtn = L.DomUtil.create('a', '', container);
      uploadBtn.href = '#';
      uploadBtn.title = 'Upload Layer';
      uploadBtn.innerHTML = '<i class="fa-solid fa-upload" style="font-size:14px;line-height:30px;width:30px;text-align:center;display:block;color:#4b5563;"></i>';
      uploadBtn.style.width = '30px';
      uploadBtn.style.height = '30px';
      L.DomEvent.on(uploadBtn, 'click', function (e) {
        L.DomEvent.stop(e);
        document.getElementById('uploadLayerModal').classList.remove('hidden');
      });

      // Point tool button
      var pointBtn = L.DomUtil.create('a', '', container);
      pointBtn.href = '#';
      pointBtn.title = 'Point Tools';
      pointBtn.innerHTML = '<i class="fa-solid fa-location-dot" style="font-size:14px;line-height:30px;width:30px;text-align:center;display:block;color:#4b5563;"></i>';
      pointBtn.style.width = '30px';
      pointBtn.style.height = '30px';
      L.DomEvent.on(pointBtn, 'click', function (e) {
        L.DomEvent.stop(e);
        toggleDropdown('point-tool-dropdown');
      });

      // Point dropdown
      var pointDrop = L.DomUtil.create('div', 'tool-dropdown', container);
      pointDrop.id = 'point-tool-dropdown';
      pointDrop.className = 'tool-dropdown hidden';
      pointDrop.style.cssText = 'position:absolute;left:35px;top:90px;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;white-space:nowrap;padding:4px 0;border:1px solid #e5e7eb;';
      pointDrop.innerHTML = '<a href="#" id="point-goto-btn" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"><i class="fa-solid fa-location-crosshairs mr-2"></i>Go to Lat/Lon</a>' +
        '<a href="#" id="point-pick-btn" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"><i class="fa-solid fa-hand-pointer mr-2"></i>Pick from Map</a>';

      L.DomEvent.disableClickPropagation(container);
      return container;
    }
  });

  map.addControl(new MapToolsControl());

  function toggleDropdown(id) {
    var el = document.getElementById(id);
    var all = ['export-tool-dropdown', 'measure-tool-dropdown', 'point-tool-dropdown'];
    all.forEach(function (d) {
      if (d !== id) document.getElementById(d).classList.add('hidden');
    });
    el.classList.toggle('hidden');
  }

  // Close dropdowns on map click
  map.on('click', function () {
    document.getElementById('export-tool-dropdown').classList.add('hidden');
    document.getElementById('measure-tool-dropdown').classList.add('hidden');
    document.getElementById('point-tool-dropdown').classList.add('hidden');
  });

  // ---- Export ----
  document.addEventListener('click', function (e) {
    if (e.target.closest('.export-opt')) {
      e.preventDefault();
      var format = e.target.closest('.export-opt').dataset.format;
      document.getElementById('export-tool-dropdown').classList.add('hidden');
      exportMap(format);
    }
  });

  function exportMap(format) {
    var mapEl = document.getElementById('map');
    // Hide all controls except legend before capture
    var controls = mapEl.querySelectorAll('.leaflet-control-container .leaflet-control');
    var legend = document.getElementById('legend');
    controls.forEach(function (ctrl) { ctrl.style.visibility = 'hidden'; });
    if (legend) legend.style.visibility = 'visible';

    html2canvas(mapEl, { useCORS: true, allowTaint: true }).then(function (canvas) {
      // Restore controls
      controls.forEach(function (ctrl) { ctrl.style.visibility = ''; });

      if (format === 'png') {
        var link = document.createElement('a');
        link.download = 'map-export.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'pdf') {
        var jsPDF = window.jspdf.jsPDF;
        var imgData = canvas.toDataURL('image/png');
        var pdf = new jsPDF('landscape', 'mm', 'a4');
        var width = pdf.internal.pageSize.getWidth();
        var height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('map-export.pdf');
      }
    }).catch(function () {
      controls.forEach(function (ctrl) { ctrl.style.visibility = ''; });
    });
  }

  // ---- Measure ----
  var measureLayer = L.layerGroup().addTo(map);
  var measureHandler = null;
  window.isMeasuring = false;

  document.addEventListener('click', function (e) {
    if (e.target.closest('.measure-opt')) {
      e.preventDefault();
      var type = e.target.closest('.measure-opt').dataset.type;
      document.getElementById('measure-tool-dropdown').classList.add('hidden');
      startMeasure(type);
    }
    if (e.target.closest('#clear-measurements')) {
      e.preventDefault();
      document.getElementById('measure-tool-dropdown').classList.add('hidden');
      measureLayer.clearLayers();
      if (measureHandler) { measureHandler.disable(); measureHandler = null; }
    }
  });

  function startMeasure(type) {
    if (measureHandler) { measureHandler.disable(); }
    isMeasuring = true;
    if (type === 'length') {
      measureHandler = new L.Draw.Polyline(map, { shapeOptions: { color: '#3b82f6', weight: 3 } });
    } else {
      measureHandler = new L.Draw.Polygon(map, { shapeOptions: { color: '#3b82f6', weight: 2, fillOpacity: 0.1 } });
    }
    measureHandler.enable();
  }

  map.on(L.Draw.Event.CREATED, function (e) {
    if (!isMeasuring) return;
    isMeasuring = false;
    var layer = e.layer;
    var geojson = layer.toGeoJSON();
    var result;
    if (e.layerType === 'polyline') {
      var length = turf.length(geojson, { units: 'kilometers' });
      result = length < 1 ? (length * 1000).toFixed(1) + ' m' : length.toFixed(2) + ' km';
    } else if (e.layerType === 'polygon') {
      var area = turf.area(geojson);
      result = area < 1000000 ? area.toFixed(0) + ' m\u00B2' : (area / 1000000).toFixed(3) + ' km\u00B2';
    } else {
      return; // Not a measure event
    }
    layer.bindTooltip(result, { permanent: true, className: 'measure-tooltip' });
    layer.bindPopup('<div class="text-sm text-center"><b>' + result + '</b><br><button class="remove-measure-btn mt-1 text-xs text-red-500 hover:text-red-700"><i class="fa-solid fa-trash-can mr-1"></i>Remove</button></div>');
    layer.on('popupopen', function () {
      var btn = document.querySelector('.remove-measure-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          measureLayer.removeLayer(layer);
        });
      }
    });
    measureLayer.addLayer(layer);
    measureHandler = null;
  });

  // ---- Upload Layer ----
  var uploadedLayers = [];
  var uploadColors = ['#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#264653'];
  var uploadColorIdx = 0;

  var dropzone = document.getElementById('upload-layer-dropzone');
  var fileInput = document.getElementById('upload-layer-input');
  var statusEl = document.getElementById('upload-layer-status');
  var csvOptions = document.getElementById('upload-layer-csv-options');

  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('border-blue-400'); });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('border-blue-400'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('border-blue-400');
    if (e.dataTransfer.files.length) handleUploadFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) handleUploadFile(fileInput.files[0]);
  });

  document.getElementById('closeUploadLayerModal').addEventListener('click', function () {
    document.getElementById('uploadLayerModal').classList.add('hidden');
    csvOptions.classList.add('hidden');
    statusEl.classList.add('hidden');
  });

  var pendingCsvData = null;

  function handleUploadFile(file) {
    var name = file.name.toLowerCase();
    statusEl.classList.remove('hidden');
    csvOptions.classList.add('hidden');

    if (name.endsWith('.geojson') || name.endsWith('.json')) {
      statusEl.textContent = 'Reading GeoJSON...';
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var data = JSON.parse(e.target.result);
          addGeoJSONToMap(data, file.name);
        } catch (err) {
          statusEl.textContent = 'Error: Invalid GeoJSON file.';
        }
      };
      reader.readAsText(file);
    } else if (name.endsWith('.csv')) {
      statusEl.textContent = 'Reading CSV...';
      var reader = new FileReader();
      reader.onload = function (e) {
        parseCsv(e.target.result);
      };
      reader.readAsText(file);
    } else if (name.endsWith('.zip')) {
      statusEl.textContent = 'Reading Shapefile...';
      var reader = new FileReader();
      reader.onload = function (e) {
        shp(e.target.result).then(function (data) {
          addGeoJSONToMap(data, file.name);
        }).catch(function () {
          statusEl.textContent = 'Error: Could not parse shapefile.';
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      statusEl.textContent = 'Unsupported file format.';
    }
  }

  function parseCsv(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) { statusEl.textContent = 'CSV has no data rows.'; return; }
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    pendingCsvData = { headers: headers, lines: lines };

    var latSelect = document.getElementById('csv-lat-col');
    var lonSelect = document.getElementById('csv-lon-col');
    latSelect.innerHTML = headers.map(function (h) { return '<option value="' + h + '">' + h + '</option>'; }).join('');
    lonSelect.innerHTML = headers.map(function (h) { return '<option value="' + h + '">' + h + '</option>'; }).join('');

    // Auto-detect lat/lon columns
    headers.forEach(function (h, i) {
      var lower = h.toLowerCase();
      if (lower.includes('lat') || lower === 'y') latSelect.selectedIndex = i;
      if (lower.includes('lon') || lower.includes('lng') || lower === 'x') lonSelect.selectedIndex = i;
    });

    csvOptions.classList.remove('hidden');
    statusEl.textContent = headers.length + ' columns, ' + (lines.length - 1) + ' rows detected.';
  }

  document.getElementById('csv-confirm-btn').addEventListener('click', function () {
    if (!pendingCsvData) return;
    var latCol = document.getElementById('csv-lat-col').value;
    var lonCol = document.getElementById('csv-lon-col').value;
    var headers = pendingCsvData.headers;
    var latIdx = headers.indexOf(latCol);
    var lonIdx = headers.indexOf(lonCol);

    var features = [];
    for (var i = 1; i < pendingCsvData.lines.length; i++) {
      var cols = pendingCsvData.lines[i].split(',');
      var lat = parseFloat(cols[latIdx]);
      var lon = parseFloat(cols[lonIdx]);
      if (!isNaN(lat) && !isNaN(lon)) {
        var props = {};
        headers.forEach(function (h, idx) { props[h] = cols[idx]; });
        features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: props });
      }
    }

    var geojson = { type: 'FeatureCollection', features: features };
    addGeoJSONToMap(geojson, 'CSV Upload');
    csvOptions.classList.add('hidden');
    pendingCsvData = null;
  });

  function addGeoJSONToMap(data, name) {
    var color = uploadColors[uploadColorIdx % uploadColors.length];
    uploadColorIdx++;
    var layer = L.geoJSON(data, {
      style: function () { return { color: color, weight: 2, fillOpacity: 0.15 }; },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, { radius: 5, color: color, fillColor: color, fillOpacity: 0.6 });
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          var popup = Object.entries(feature.properties).map(function (kv) {
            return '<b>' + kv[0] + ':</b> ' + kv[1];
          }).join('<br>');
          layer.bindPopup('<div class="text-xs max-h-40 overflow-auto">' + popup + '</div>');
        }
      }
    }).addTo(map);

    var layerId = 'upload-layer-' + Date.now();
    uploadedLayers.push({ id: layerId, layer: layer, name: name });
    map.fitBounds(layer.getBounds());
    statusEl.textContent = name + ' added to map.';

    // Update layer list in modal
    var listContainer = document.getElementById('uploaded-layers-list');
    var ul = document.getElementById('uploaded-layers-ul');
    listContainer.classList.remove('hidden');

    var li = document.createElement('li');
    li.id = layerId;
    li.className = 'flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50';
    li.innerHTML = '<span class="flex items-center gap-1.5 truncate"><span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="background:' + color + '"></span><span class="truncate">' + name + '</span></span>' +
      '<button class="remove-upload-layer text-gray-400 hover:text-red-500 shrink-0 ml-2" data-layer-id="' + layerId + '" title="Remove"><i class="fa-solid fa-xmark"></i></button>';
    ul.appendChild(li);
  }

  // Remove uploaded layer
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.remove-upload-layer');
    if (!btn) return;
    var layerId = btn.dataset.layerId;
    var idx = uploadedLayers.findIndex(function (item) { return item.id === layerId; });
    if (idx !== -1) {
      map.removeLayer(uploadedLayers[idx].layer);
      uploadedLayers.splice(idx, 1);
    }
    var li = document.getElementById(layerId);
    if (li) li.remove();
    if (uploadedLayers.length === 0) {
      document.getElementById('uploaded-layers-list').classList.add('hidden');
    }
  });

  // ---- Point Tools ----
  var pointMarkers = L.layerGroup().addTo(map);
  var pickModeActive = false;

  // Coordinate display (bottom-right)
  var coordDisplay = L.DomUtil.create('div', 'leaflet-control');
  coordDisplay.id = 'coord-display';
  coordDisplay.style.cssText = 'position:absolute;bottom:25px;left:10px;background:rgba(255,255,255,0.95);padding:8px 12px;border-radius:6px;font-size:13px;color:#1f2937;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;display:none;font-weight:500;';
  document.getElementById('map').appendChild(coordDisplay);

  // Go to Lat/Lon
  document.addEventListener('click', function (e) {
    if (e.target.closest('#point-goto-btn')) {
      e.preventDefault();
      document.getElementById('point-tool-dropdown').classList.add('hidden');
      document.getElementById('pointGotoModal').classList.remove('hidden');
    }
  });

  document.getElementById('closePointGotoModal').addEventListener('click', function () {
    document.getElementById('pointGotoModal').classList.add('hidden');
  });

  document.getElementById('point-goto-submit').addEventListener('click', function () {
    var lat = parseFloat(document.getElementById('point-goto-lat').value);
    var lon = parseFloat(document.getElementById('point-goto-lon').value);
    if (isNaN(lat) || isNaN(lon)) return;
    var marker = L.marker([lat, lon]).addTo(pointMarkers);
    marker.bindPopup('<div class="text-xs"><b>Lat:</b> ' + lat.toFixed(6) + '<br><b>Lon:</b> ' + lon.toFixed(6) + '</div>').openPopup();
    map.setView([lat, lon], 14);
    document.getElementById('pointGotoModal').classList.add('hidden');
  });

  document.getElementById('point-goto-clear').addEventListener('click', function () {
    pointMarkers.clearLayers();
  });

  // Pick from Map
  document.addEventListener('click', function (e) {
    if (e.target.closest('#point-pick-btn')) {
      e.preventDefault();
      document.getElementById('point-tool-dropdown').classList.add('hidden');
      pickModeActive = !pickModeActive;
      coordDisplay.style.display = pickModeActive ? 'block' : 'none';
      if (pickModeActive) {
        coordDisplay.textContent = 'Click on map to get coordinates';
        document.getElementById('map').style.cursor = 'crosshair';
      } else {
        document.getElementById('map').style.cursor = '';
      }
    }
  });

  var pickMarker = null;

  map.on('click', function (e) {
    if (pickModeActive) {
      var lat = e.latlng.lat.toFixed(6);
      var lon = e.latlng.lng.toFixed(6);
      coordDisplay.innerHTML = '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>' + lat + ', ' + lon +
        ' <button id="copy-coord-btn" class="ml-2 text-gray-400 hover:text-gray-700" title="Copy"><i class="fa-solid fa-copy"></i></button>' +
        '<button id="close-coord-btn" class="ml-1 text-gray-400 hover:text-red-500" title="Close"><i class="fa-solid fa-xmark"></i></button>';
      // Replace the single pick marker
      if (pickMarker) { map.removeLayer(pickMarker); }
      pickMarker = L.circleMarker(e.latlng, { radius: 6, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }).addTo(map);
      pickMarker.bindPopup('<div class="text-xs">' + lat + ', ' + lon + '</div>');
    }
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('#copy-coord-btn')) {
      var text = coordDisplay.textContent.replace('Copy', '').replace('Close', '').trim();
      navigator.clipboard.writeText(text);
    }
    if (e.target.closest('#close-coord-btn')) {
      pickModeActive = false;
      coordDisplay.style.display = 'none';
      document.getElementById('map').style.cursor = '';
      if (pickMarker) { map.removeLayer(pickMarker); pickMarker = null; }
    }
  });

  // ESC to exit pick mode
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pickModeActive) {
      pickModeActive = false;
      coordDisplay.style.display = 'none';
      document.getElementById('map').style.cursor = '';
      if (pickMarker) { map.removeLayer(pickMarker); pickMarker = null; }
    }
  });

})();
