
 //layer switching functionality
 document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('layerSwitcher')) {
      const layerId = event.target.id;
      console.log('Layer ID:', layerId);
      checkedStatus = document.getElementById(layerId).checked;
      if(layerId == "search_layer"){
          if(checkedStatus){
            map.addLayer(liveLayer);
          }
          else{
            map.removeLayer(liveLayer);
          }
      }
      else if(event.target.classList.contains('bboxLayerSwitcher')){
        const source = event.target.dataset.source;
        if(checkedStatus){
            if (typeof syncResultBboxLayerForSource === "function") {
              syncResultBboxLayerForSource(source);
            } else if (typeof refreshActiveResult === "function") {
              refreshActiveResult();
            }
          }
          else{
            if (typeof clearBboxLayerForSource === "function") {
              clearBboxLayerForSource(source);
            } else if (typeof clearImagesBboxLayer === "function") {
              clearImagesBboxLayer();
            }
          }
      }
      else if(layerId == "compute_layer"){
        if(checkedStatus){
          if (computeLayer) map.addLayer(computeLayer);
        }
        else{
          if (computeLayer && map.hasLayer(computeLayer)) map.removeLayer(computeLayer);
        }
      }

      if (typeof updateLayerCountSummary === "function") {
        updateLayerCountSummary();
      }
    }
  });


 

// Function to zoom to a layer
function zoomToLayer(layerName) {
const layers = {
"liveLayer": liveLayer,
"geojsonLayer": geojsonLayer,
"computeLayer": computeLayer
};

// Also check per-source bbox layers
if (typeof sourceBboxLayers !== "undefined") {
  layers["analyzeBboxLayer"] = sourceBboxLayers.analyze;
  layers["downloadBboxLayer"] = sourceBboxLayers.download;
}

const layer = layers[layerName];
if (layer) {
  if (layer.getBounds) {
      // For vector layers
      map.fitBounds(layer.getBounds());
  } else if (layer.getBounds === undefined && layer._bounds) {
      // For raster layers
      map.fitBounds(layer._bounds);
  } else {
      console.error(`Layer ${layerName} does not support bounding box`);
  }
} else {
  console.error(`Layer ${layerName} not found`);
}
}

// Query all zoom icons with an ID starting with "zoom_"
document.querySelectorAll('i[id^="zoom_"]').forEach(icon => {
icon.addEventListener('click', function() {
  // Get everything after "zoom_"
  const layerName = this.id.substring(5);
  zoomToLayer(layerName);
});
});

  
