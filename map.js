/**
 * Set Mapbox Access Token
 */

mapboxgl.accessToken =
  "YOUR TOKEN HERE";

/**
 * Add the map to the page
 */
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [35.9527, 0.6014],
  zoom: 8
});

/**
 * Wait until the map loads to make changes to the map.
 */
map.on("load", function (e) {

  /**
   * - Add bounday layer
   * - Add location listings on the side of the page
   * - Add markers onto the map
   */
  addBoundary(baringo_county_boundary)
  buildLocationList(baringo_health_facilities);
  addMarkers(baringo_health_facilities);

});


// add boundary to map
function addBoundary(data) {
  // add mapbox gl source
  map.addSource("boundary", {
    type: "geojson",
    data: data
  });

  // add geojson line layer
  var boundayLayer = map.addLayer({
    'id': 'maine',
    'type': 'line',
    'source': 'boundary',
    'paint': {
      'line-color': '#088',
      'line-width': 3
    }
  })
}


/**
 * Add a marker to the map for every store listing.
 **/
function addMarkers(hospitals) {
  /* For each feature in the GeoJSON object above: */
  hospitals.features.forEach(function (marker) {
    /* Create a div element for the marker. */
    var el = document.createElement("div");
    /* Assign a unique `id` to the marker. */
    el.id = "marker-" + marker.properties.FNO;
    /* Assign the `marker` class to each marker for styling. */
    el.className = "marker";

    /**
     * Create a marker using the div element
     * defined above and add it to the map.
     **/
    new mapboxgl.Marker(el, { offset: [0, -23] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);

    /**
     * Listen to the element and when it is clicked, do three things:
     * 1. Fly to the point
     * 2. Close all other popups and display popup for clicked store
     * 3. Highlight listing in sidebar (and remove highlight for all other listings)
     **/
    el.addEventListener("click", function (e) {
      /* Fly to the point */
      flyToStore(marker);
      /* Close all other popups and display popup for clicked store */
      createPopUp(marker);
      /* Highlight listing in sidebar */
      var activeItem = document.getElementsByClassName("active");
      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove("active");
      }
      var listing = document.getElementById("listing-" + marker.properties.id);
      listing.classList.add("active");
    });
  });
}

/**
 * Add a listing for each store to the sidebar.
 **/
function buildLocationList(data) {
  data.features.forEach(function (hospital, i) {
    /**
     * Create a shortcut for `hospital.properties`,
     * which will be used several times below.
     **/
    var prop = hospital.properties;

    /* Add a new listing section to the sidebar. */
    var listings = document.getElementById("listings");
    var listing = listings.appendChild(document.createElement("div"));
    /* Assign a unique `id` to the listing. */
    listing.id = "listing-" + prop.FNO;
    /* Assign the `item` class to each listing for styling. */
    listing.className = "item";

    /* Add the link to the individual listing created above. */
    var link = listing.appendChild(document.createElement("a"));
    link.href = "#";
    link.className = "title";
    link.id = "link-" + prop.FNO;
    link.innerHTML = prop.F_NAME;

    /* Add details to the individual listing. */
    var details = listing.appendChild(document.createElement("div"));
    details.innerHTML = prop.AGENCY;

    /**
     * Listen to the element and when it is clicked, do four things:
     * 1. Update the `currentFeature` to the hospital associated with the clicked link
     * 2. Fly to the point
     * 3. Close all other popups and display popup for clicked store
     * 4. Highlight listing in sidebar (and remove highlight for all other listings)
     **/
    link.addEventListener("click", function (e) {
      for (var i = 0; i < data.features.length; i++) {
        if (this.id === "link-" + data.features[i].properties.FNO) {
          var clickedListing = data.features[i];
          flyToStore(clickedListing);
          createPopUp(clickedListing);
        }
      }
      var activeItem = document.getElementsByClassName("active");
      if (activeItem[0]) {
        activeItem[0].classList.remove("active");
      }
      this.parentNode.classList.add("active");
    });
  });
}

/**
 * Use Mapbox GL JS's `flyTo` to move the camera smoothly
 * a given center point.
 **/
function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 12
  });
}

/**
 * Create a Mapbox GL JS `Popup`.
 **/

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName("mapboxgl-popup");
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      "<h3>" +
      currentFeature.properties.AGENCY +
      "</h3>" +
      "<h4>" +
      currentFeature.properties.F_NAME +
      "</h4>"
    )
    .addTo(map);
}
