// Depends on: mapbox-gl (map rendering), Map.scss (panel styling), Map.svg (banner icon)
// Receives: hospital (object with lat/lng/HospitalName from parent) and patientLocation (address string from parent)
// Exports: Map component used in the main layout to display a live route between patient and selected hospital
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.scss";
import MapIcon from "../../assets/icons/Map.svg";

// Read Mapbox public token from environment variables (set in frontend/.env as VITE_MAPBOX_TOKEN)
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default map center — downtown Toronto (lng, lat)
const TORONTO_CENTER = [-79.3832, 43.6532];

function Map({ hospital, patientLocation }) {
  // containerRef: DOM node that Mapbox mounts the canvas into
  const containerRef = useRef(null);

  // mapRef: persists the Mapbox map instance across re-renders without triggering re-renders itself
  const mapRef = useRef(null);

  // markersRef: tracks all active Mapbox Marker objects so they can be cleaned up before drawing a new route
  const markersRef = useRef([]);

  // driveTime: estimated driving time in minutes, populated after a successful Directions API call
  const [driveTime, setDriveTime] = useState(null);

  // --- Map Initialization ---
  // Runs once on mount. Creates the Mapbox map, attaches navigation controls,
  // and sets up a ResizeObserver so the canvas redraws correctly if the container resizes.
  // Cleans up by disconnecting the observer and removing the map on unmount.
  useEffect(() => {
    if (!TOKEN || TOKEN === "your_mapbox_public_token_here" || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: TORONTO_CENTER,
      zoom: 11,
      trackResize: true
    });
    map.resize();
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.once("idle", () => map.resize());
    mapRef.current = map;

    // Automatically resize the Mapbox canvas whenever the container element changes size
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // --- Route Drawing ---
  // Re-runs whenever `hospital` or `patientLocation` props change.
  // 1. Clears existing markers and route layer from the map.
  // 2. Geocodes `patientLocation` (free-text address) to coordinates via the Mapbox Geocoding API.
  //    Falls back to a hardcoded Toronto coordinate if geocoding fails or no address is provided.
  // 3. Places a red marker at the patient origin and a blue marker at the hospital destination.
  // 4. Fetches a traffic-aware driving route via the Mapbox Directions API and draws it as a red line.
  // 5. Fits the map viewport to the route bounds with padding.
  // 6. Updates `driveTime` state with the estimated duration in minutes (displayed in the header).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hospital || !TOKEN || TOKEN === "your_mapbox_public_token_here") return;

    // Remove all existing markers and the route source/layer before drawing a new route
    const clearPrevious = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");
    };

    const drawRoute = async () => {
      clearPrevious();
      setDriveTime(null);

      // -- Geocoding --
      // Convert the patient's address string to [lng, lat] coordinates.
      // Appends "Toronto, Ontario" to the query if not already present to improve accuracy.
      // The bbox restricts results to the Greater Toronto Area bounding box.
      let origin = [-79.4437, 43.6487]; // Dundas St W fallback
      if (patientLocation) {
        try {
          // Append city context if not already present so Mapbox resolves to Toronto
          const query = /toronto|ontario/i.test(patientLocation)
            ? patientLocation
            : `${patientLocation}, Toronto, Ontario`;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=CA&bbox=-79.6393,43.5810,-79.1158,43.8554&proximity=${TORONTO_CENTER.join(",")}&access_token=${TOKEN}`
          );
          const data = await res.json();
          if (data.features?.[0]?.center) origin = data.features[0].center;
        } catch {
          // silently fall back to default coords
        }
      }

      const dest = [hospital.lng, hospital.lat];

      // -- Markers --
      // Custom div-based markers styled via Map.scss (.map-marker--patient / --hospital)

      // Patient marker (red)
      const patientEl = document.createElement("div");
      patientEl.className = "map-marker map-marker--patient";
      markersRef.current.push(
        new mapboxgl.Marker({ element: patientEl }).setLngLat(origin).addTo(map)
      );

      // Hospital marker (blue)
      const hospEl = document.createElement("div");
      hospEl.className = "map-marker map-marker--hospital";
      markersRef.current.push(
        new mapboxgl.Marker({ element: hospEl }).setLngLat(dest).addTo(map)
      );

      // -- Directions API --
      // Fetches a real-time, traffic-aware driving route between origin and dest.
      // On success: draws the route as a GeoJSON line layer and sets driveTime state.
      // On failure: silently skips the route line — markers remain visible.
      // Fetch traffic-aware route
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin.join(",")};${dest.join(",")}?geometries=geojson&overview=full&access_token=${TOKEN}`
        );
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return;

        // Convert seconds to minutes and store for display in the header ETA badge
        setDriveTime(Math.round(route.duration / 60));

        // Add the route GeoJSON source and line layer to the map.
        // If the style is already loaded, add immediately; otherwise wait for the "idle" event
        // to avoid calling addSource/addLayer before the style is ready.
        const addRoute = () => {
          if (map.getLayer("route")) map.removeLayer("route");
          if (map.getSource("route")) map.removeSource("route");
          map.addSource("route", {
            type: "geojson",
            data: { type: "Feature", geometry: route.geometry },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#CC3C42", "line-width": 5, "line-opacity": 0.85 },
          });

          // Compute bounding box from route coordinates and fit the viewport to it
          const bounds = route.geometry.coordinates.reduce(
            (b, c) => b.extend(c),
            new mapboxgl.LngLatBounds(
              route.geometry.coordinates[0],
              route.geometry.coordinates[0]
            )
          );
          map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        };

        if (map.isStyleLoaded()) {
          addRoute();
        } else {
          map.once("idle", addRoute);
        }
      } catch {
        // route fetch failed — markers still show
      }
    };

    // Defer drawRoute until the map style is ready to accept layers and sources
    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once("idle", drawRoute);
    }
  }, [hospital, patientLocation]);

  // True when no valid token is configured — used to render a placeholder instead of the map
  const noToken = !TOKEN || TOKEN === "your_mapbox_public_token_here";

  // --- Render ---
  // Renders the map panel with a header (hospital name + ETA badge) and body.
  // If no valid Mapbox token is present, shows a setup placeholder instead of the map canvas.
  // The `containerRef` div is the mount point for the Mapbox GL canvas (only rendered when token is valid).
  return (
    <section className="map-panel" aria-label="Hospital map">
      <header className="map-panel__header">
        <div className="map-panel__subtitle-wrap">
          {/* Displays the selected hospital name, or a prompt if none is selected yet */}
          <p className="map-panel__subtitle">
            {hospital?.HospitalName ?? "Select a hospital"}
          </p>
        </div>
        {/* ETA badge — only shown after a successful Directions API response */}
        {driveTime !== null && (
          <span className="map-panel__eta">{driveTime} min with traffic</span>
        )}
      </header>
      <div className="map-panel__body">
        {/* Decorative banner using the Map SVG icon asset */}
        <div className="map-panel__banner">
          <img className="map-panel__banner-icon" src={MapIcon} alt="" />
          <span className="map-panel__banner-text">LIVE TRAFFIC VIEW</span>
        </div>
        {noToken ? (
          // Shown when VITE_MAPBOX_TOKEN is missing or still set to the placeholder value
          <div className="map-panel__placeholder-box">
            <p className="map-panel__placeholder">
              Add your Mapbox token to <code>frontend/.env</code> to enable live maps.
            </p>
          </div>
        ) : (
          // Mapbox mounts its WebGL canvas into this div via containerRef
          <div ref={containerRef} className="map-panel__mapbox" />
        )}
      </div>
    </section>
  );
}

export default Map;
