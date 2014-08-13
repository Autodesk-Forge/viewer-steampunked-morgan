var viewer;

// Many thanks 
function initialize() {

  // Get our access token from the internal web-service API
  
  $.get("http://" + window.location.host + '/api/token',
    function (accessToken) {

      var options = {};
      options.env = "AutodeskProduction";
      options.accessToken = accessToken;
      options.document =
        "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6c3RlYW1idWNrL1NwTTNXNy5mM2Q=";

      // Create and initialize our 3D viewer

      var elem = document.getElementById('viewer3d');
      viewer = new Autodesk.Viewing.Viewer3D(elem, {});
      viewer.initialize();

      // Go with the "Riverbank" lighting and background effect

      viewer.impl.setLightPreset(8);

      // We have a heavy model, so let's save some work during
      // navigation

      viewer.setOptimizeNavigation(true);

      // Let's zoom in and out of the pivot - the screen
      // real estate is fairly limited - and reverse the
      // zoom direction

      viewer.navigation.setZoomTowardsPivot(true);
      viewer.navigation.setReverseZoomDirection(true);

      Autodesk.Viewing.Initializer(options, function () {
        loadDocument(viewer, options.document);
      });
    }
  );

  // Set up some UI elements for the Steampunk UI

  $("#ui").find("div").attr("id", "over");
  $("#window").wrapInner("<div id=\"wrapper\">");

  // Store positions

  var overPositions =
        {
          entirety: 0, engine: 75, body: 152,
          interior: 230, wheels: 310
        },
      cogPositions =
        {
          entirety: 5, engine: 80, body: 154,
          interior: 235, wheels: 310
        },
      previousCogPosition = 0;

  // Animation function

  function animator(pointer, callback) {

    // Move cog

    $("#cog").animate({
      "translateY": parseInt(cogPositions[pointer]),
      "rotate":
        (parseInt(cogPositions[pointer]) < previousCogPosition) ?
        "-=365" : "+=365"
    }, function () {
      previousCogPosition = cogPositions[pointer];
    });

    // Move over

    $("#over").animate({
      "translateY": parseInt(overPositions[pointer])
    });

    // Add a delay so the camera changes after the cog has stopped
    // whirring

    if (callback) {
      setTimeout(function () { callback(); }, 400);
    }
  }

  // Is there a hash?

  if (window.location.hash) {

    // Store the hash

    var hash = window.location.hash.split("#")[1];

    // Position over		

    animator(hash);
  }

  // Add transitions

  $("#ui a").click(function (e) {
    e.preventDefault();

    // Store new pointer

    var pointer = $(this).attr("href").split("#")[1];

    // Call animation function

    animator(pointer, function () {
      if (pointer === "entirety") {
        zoomEntirety();
      } else if (pointer === "engine") {
        zoomEngine();
      } else if (pointer === "body") {
        zoomBody();
      } else if (pointer === "interior") {
        zoomInterior();
      } else if (pointer === "wheels") {
        zoomWheels();
      }
    });
  });
}

// Helper functions to zoom into a specific part of the model

function zoomEntirety() {
  zoom(-48722.5, -54872, 44704.8, 10467.3, 1751.8, 1462.8);
}
function zoomEngine() {
  zoom(-17484, -364, 4568, 12927, 173, 1952);
}
function zoomBody() {
  zoom(53143, -7200, 5824, 12870, -327.5, 1674);
}
function zoomInterior() {
  zoom(20459, -19227, 19172.5, 13845, 1228.6, 2906);
}
function zoomWheels() {
  zoom(260.3, 26327, 954, 371.5, 134, 2242.7);
}

// Set the camera based on a position and target location

function zoom(px, py, pz, tx, ty, tz) {

  // Make sure our up vector is correct for this model

  viewer.navigation.setWorldUpVector(new THREE.Vector3(0, 0, 1));

  // This performs a smooth view transition (we might also use
  // setView() to get there more directly)

  viewer.navigation.setRequestTransition(
    true,
    new THREE.Vector3(px, py, pz), new THREE.Vector3(tx, ty, tz),
    viewer.getFOV()
  );
}

// Progress listener to set the view once the data has started
// loading properly (we get a 5% notification early on that we
// need to ignore - it comes too soon)

function progressListener(param) {

  if (param.percent > 0.1 && param.percent < 5) {

    // Remove the listener once called - one-time operation

    viewer.removeEventListener("progress", progressListener);

    // Iterate the materials to change any red ones to grey

    for (var p in viewer.impl.materials) {
      var m = viewer.impl.materials[p];
      if (m.color.r >= 0.5 && m.color.g == 0 && m.color.b == 0) {
        m.color.r = m.color.g = m.color.b = 0.5;
        m.needsUpdate = true;
      }
    }

    // Zoom to the overal view initially

    zoomEntirety();
  }
}

function loadDocument(viewer, docId) {

  var path = VIEWING_URL + '/' + docId.substr(4);

  Autodesk.Viewing.Document.load(path,
    function (document) {
      var geometryItems = [];

      if (geometryItems.length == 0) {
        geometryItems =
          Autodesk.Viewing.Document.getSubItemsWithProperties(
            document.getRootItem(),
            { 'type': 'geometry', 'role': '3d' },
            true
          );
      }
      if (geometryItems.length > 0) {
        viewer.load(document.getViewablePath(geometryItems[0]));
      }

      viewer.addEventListener("progress", progressListener);
    },
    function (errorMsg, httpErrorCode) {
      var container = document.getElementById('viewer3d');
      if (container) {
        alert("Load error " + errorMsg);
      }
    }
  );
}
