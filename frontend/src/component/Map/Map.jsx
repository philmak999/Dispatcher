import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.scss";
import MapIcon from "../../assets/icons/Map.svg";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TORONTO_CENTER = [-79.3832, 43.6532];

function Map({ hospital, patientLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [driveTime, setDriveTime] = useState(null);

  // Initialize map once
  useEffect(() => {
    if (!TOKEN || TOKEN === "your_mapbox_public_token_here" || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: TORONTO_CENTER,
      zoom: 11,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw route whenever hospital or patient location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hospital || !TOKEN || TOKEN === "your_mapbox_public_token_here") return;

    const clearPrevious = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");
    };

    const drawRoute = async () => {
      clearPrevious();
      setDriveTime(null);

      // Geocode patient address
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

      // Fetch traffic-aware route
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin.join(",")};${dest.join(",")}?geometries=geojson&overview=full&access_token=${TOKEN}`
        );
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return;

        setDriveTime(Math.round(route.duration / 60));

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

    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once("idle", drawRoute);
    }
  }, [hospital, patientLocation]);

  const noToken = !TOKEN || TOKEN === "your_mapbox_public_token_here";

  return (
    <section className="map-panel" aria-label="Hospital map">
      <header className="map-panel__header">
        <div className="map-panel__subtitle-wrap">
          <p className="map-panel__subtitle">
            {hospital?.HospitalName ?? "Select a hospital"}
          </p>
        </div>
        {driveTime !== null && (
          <span className="map-panel__eta">{driveTime} min with traffic</span>
        )}
      </header>
      <div className="map-panel__body">
        <div className="map-panel__banner">
          <img className="map-panel__banner-icon" src={MapIcon} alt="" />
          <span className="map-panel__banner-text">LIVE TRAFFIC VIEW</span>
        </div>
        {noToken ? (
          <div className="map-panel__placeholder-box">
            <p className="map-panel__placeholder">
              Add your Mapbox token to <code>frontend/.env</code> to enable live maps.
            </p>
          </div>
        ) : (
          <div ref={containerRef} className="map-panel__mapbox" />
        )}
      </div>
    </section>
  );
}

export default Map;
