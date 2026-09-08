import React, { useEffect, useRef, useState } from "react";
import { Building2, Flame, Layers, MapPinned, X } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function dateOnly(value) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10);

  return parsed.toISOString().slice(0, 10);
}

function hasValidCoordinates(plant) {
  const latitude = Number(plant?.latitude);
  const longitude = Number(plant?.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export default function Map({
  mappedPlants = [],
  selectedPlant,
  onSelectPlant,
  isLight,
  surface,
  softSurface,
  textMuted,
}) {
  const [showPlantList, setShowPlantList] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyleRevision, setMapStyleRevision] = useState(0);
  const [is3DEnabled, setIs3DEnabled] = useState(false);
  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  // The map is initially created with the current theme, so do not call
  // setStyle again on first load. Only reload the style when the theme
  // actually changes afterwards.
  const appliedMapThemeRef = useRef(isLight);
  const markerRefs = useRef([]);
  const popupRefs = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent creating another map instance
    if (mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      console.error(
        "Mapbox token missing. Add VITE_MAPBOX_TOKEN to your .env file.",
      );
      return;
    }

    mapboxgl.accessToken = token;

    let destroyed = false;
    let resizeObserver = null;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isLight
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/dark-v11",
      center: [74.323, 31.5007],
      zoom: 11.2,
      pitch: 0,
      bearing: 0,
      maxPitch: 70,
      projection: "mercator",
      renderWorldCopies: false,
      attributionControl: true,
    });

    mapRef.current = map;

    // --------------------------------------------------
    // Navigation
    // --------------------------------------------------

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // --------------------------------------------------
    // MAP LOAD
    // --------------------------------------------------

    const handleLoad = () => {
      if (destroyed) return;
      if (!mapRef.current) return;

      try {
        map.setProjection("mercator");
        map.setPitch(0);
        map.setBearing(0);

        setMapLoaded(true);

        // Resize after style/canvas is completely ready
        requestAnimationFrame(() => {
          if (!destroyed && mapRef.current === map) {
            map.resize();
          }
        });

        setTimeout(() => {
          if (!destroyed && mapRef.current === map) {
            map.resize();
          }
        }, 200);
      } catch (error) {
        console.error("Mapbox load error:", error);
      }
    };

    // --------------------------------------------------
    // MAP ERROR
    // --------------------------------------------------

    const handleError = (event) => {
      if (destroyed) return;

      console.error("Mapbox map error:", event?.error || event);
    };

    map.once("load", handleLoad);
    map.on("error", handleError);

    // --------------------------------------------------
    // RESIZE OBSERVER
    // --------------------------------------------------

    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!destroyed && mapRef.current === map) {
          try {
            map.resize();
          } catch (error) {
            console.warn("Map resize skipped:", error);
          }
        }
      });

      resizeObserver.observe(mapContainerRef.current);
    }

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      destroyed = true;

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      map.off("load", handleLoad);
      map.off("error", handleError);

      // Remove markers
      markerRefs.current.forEach((marker) => {
        try {
          marker.remove();
        } catch (error) {
          // ignore cleanup error
        }
      });

      markerRefs.current = [];

      // Remove popups
      popupRefs.current.forEach((popup) => {
        try {
          popup.remove();
        } catch (error) {
          // ignore cleanup error
        }
      });

      popupRefs.current = [];

      setMapLoaded(false);

      if (mapRef.current === map) {
        mapRef.current = null;
      }

      try {
        map.remove();
      } catch (error) {
        console.warn("Map cleanup error:", error);
      }
    };
  }, [isLight]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // The map constructor already uses the current theme. Avoid reloading the
    // same style on initial load; only do it after a real theme change.
    if (appliedMapThemeRef.current === isLight) return;
    appliedMapThemeRef.current = isLight;

    const nextStyle = isLight
      ? "mapbox://styles/mapbox/streets-v12"
      : "mapbox://styles/mapbox/dark-v11";

    let cancelled = false;

    const handleStyleLoad = () => {
      if (cancelled || !mapRef.current || mapRef.current !== map) return;

      // setStyle() replaces the complete Mapbox style and therefore removes
      // every custom source/layer. Bump the revision only after the new style
      // is fully loaded so the custom plant-coordinate layers are recreated.
      map.setProjection("mercator");
      map.setBearing(0);
      map.resize();
      setMapStyleRevision((revision) => revision + 1);
    };

    // Register BEFORE setStyle so a fast style load can never be missed.
    map.once("style.load", handleStyleLoad);
    map.setStyle(nextStyle);

    return () => {
      cancelled = true;
      map.off("style.load", handleStyleLoad);
    };
  }, [isLight, mapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const markerData = {
      type: "FeatureCollection",
      features: mappedPlants.map((plant) => ({
        type: "Feature",
        properties: {
          id: plant.id,
          siteName: plant.siteName,
          plantCode: plant.plantCode,
          plantType: plant.plantType,
          location: plant.location,
          capacity: plant.capacity,
          isSurveyed: plant.isSurveyed ? 1 : 0,
        },
        geometry: {
          type: "Point",
          coordinates: [Number(plant.longitude), Number(plant.latitude)],
        },
      })),
    };

    const popup = new mapboxgl.Popup({
      offset: 18,
      closeButton: false,
      closeOnClick: true, // closes when user clicks elsewhere on the map
      maxWidth: "280px",
    });

    const showMarkerDetails = (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const plant = mappedPlants.find(
        (p) => String(p.id) === String(feature.properties.id),
      );
      if (!plant) return;

      const popupContent = document.createElement("div");
      popupContent.style.minWidth = "210px";
      popupContent.style.fontFamily = "inherit";
      const isSurveyed = plant.isSurveyed;
      popupContent.innerHTML = `
      <div style="padding:4px 2px;color:#0f172a;font-family:Inter,system-ui,sans-serif">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="width:9px;height:9px;border-radius:9999px;background:${isSurveyed ? "#22c55e" : "#ef4444"};box-shadow:0 0 0 4px ${isSurveyed ? "rgba(34,197,94,.14)" : "rgba(239,68,68,.14)"}"></span>
          <div style="font-size:13px;font-weight:800">${plant.siteName || "Survey record"}</div>
        </div>
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">
          Survey #${plant.srNo || plant.plantCode || "-"} · ${plant.plantType || "-"}
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:11px">
          <span style="color:#64748b">Owner</span><strong style="font-weight:600">${plant.siteName || "-"}</strong>
          <span style="color:#64748b">Parcel</span><strong style="font-weight:600">${plant.plantCode || "-"}</strong>
          <span style="color:#64748b">Village</span><strong style="font-weight:600">${plant.location || "-"}</strong>
          <span style="color:#64748b">Phone</span><strong style="font-weight:600">${plant.phone || "-"}</strong>
          <span style="color:#64748b">Status</span><strong style="font-weight:600">${plant.status || "-"}</strong>
          <span style="color:#64748b">Coordinates</span><strong style="font-weight:600">${Number(plant.latitude).toFixed(6)}, ${Number(plant.longitude).toFixed(6)}</strong>
        </div>
      </div>`;

      popup
        .setLngLat([Number(plant.longitude), Number(plant.latitude)])
        .setDOMContent(popupContent)
        .addTo(map);

      setShowPlantList(false);
    };

    const handleMarkerClick = (e) => {
      const feature = e.features?.[0];
      const plant = mappedPlants.find(
        (p) => String(p.id) === String(feature?.properties?.id),
      );
      if (plant) onSelectPlant(plant);
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const applyLayers = () => {
      if (!mapRef.current || mapRef.current !== map || !map.isStyleLoaded())
        return;

      if (map.getSource("saaf-pani-markers")) {
        map.getSource("saaf-pani-markers").setData(markerData);
      } else {
        map.addSource("saaf-pani-markers", {
          type: "geojson",
          data: markerData,
        });

        // outer pulse ring
        map.addLayer({
          id: "saaf-pani-marker-pulse",
          type: "circle",
          source: "saaf-pani-markers",
          paint: {
            "circle-radius": 12,
            "circle-color": [
              "case",
              ["==", ["get", "isSurveyed"], 1],
              "#22c55e",
              "#ef4444",
            ],
            "circle-opacity": 0.25,
          },
        });

        // solid dot
        map.addLayer({
          id: "saaf-pani-marker-dot",
          type: "circle",
          source: "saaf-pani-markers",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "case",
              ["==", ["get", "isSurveyed"], 1],
              "#22c55e",
              "#ef4444",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // ALWAYS attach listeners (idempotent because of off->on)
      if (map.getLayer("saaf-pani-marker-dot")) {
        map.off("click", "saaf-pani-marker-dot", handleMarkerClick);
        map.on("click", "saaf-pani-marker-dot", handleMarkerClick);

        map.off("mouseenter", "saaf-pani-marker-dot", showMarkerDetails);
        map.on("mouseenter", "saaf-pani-marker-dot", showMarkerDetails);

        map.off("mouseleave", "saaf-pani-marker-dot", handleMouseLeave);
        map.on("mouseleave", "saaf-pani-marker-dot", handleMouseLeave);
      }
    };

    applyLayers();
    map.on("style.load", applyLayers);

    return () => {
      map.off("style.load", applyLayers);
      map.off("click", "saaf-pani-marker-dot", handleMarkerClick);
      map.off("mouseenter", "saaf-pani-marker-dot", showMarkerDetails);
      map.off("mouseleave", "saaf-pani-marker-dot", handleMouseLeave);
      popup.remove();
    };
  }, [mappedPlants, mapLoaded, mapStyleRevision]);

  useEffect(() => {
    if (
      !selectedPlant ||
      !mapRef.current ||
      !mapLoaded ||
      !hasValidCoordinates(selectedPlant)
    )
      return;

    mapRef.current.flyTo({
      center: [Number(selectedPlant.longitude), Number(selectedPlant.latitude)],
      zoom: 14,
      essential: true,
    });
  }, [selectedPlant, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const configureLayers = () => {
      if (!mapRef.current || mapRef.current !== map || !map.isStyleLoaded())
        return;

      const heatmapData = {
        type: "FeatureCollection",
        features: mappedPlants.map((plant) => ({
          type: "Feature",
          properties: { surveyed: plant.isSurveyed ? 1 : 0 },
          geometry: {
            type: "Point",
            coordinates: [Number(plant.longitude), Number(plant.latitude)],
          },
        })),
      };

      if (map.getSource("saaf-pani-density")) {
        map.getSource("saaf-pani-density").setData(heatmapData);
      } else {
        map.addSource("saaf-pani-density", {
          type: "geojson",
          data: heatmapData,
        });
      }

      if (!map.getLayer("saaf-pani-heatmap")) {
        map.addLayer({
          id: "saaf-pani-heatmap",
          type: "heatmap",
          source: "saaf-pani-density",
          maxzoom: 17,
          paint: {
            "heatmap-weight": 1,
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              0.7,
              14,
              1.5,
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              18,
              14,
              32,
            ],
            "heatmap-opacity": 0.72,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(6,182,212,0)",
              0.25,
              "rgba(34,197,94,0.55)",
              0.5,
              "rgba(250,204,21,0.65)",
              0.75,
              "rgba(249,115,22,0.72)",
              1,
              "rgba(239,68,68,0.82)",
            ],
          },
          layout: { visibility: isHeatmapEnabled ? "visible" : "none" },
        });
      } else {
        map.setLayoutProperty(
          "saaf-pani-heatmap",
          "visibility",
          isHeatmapEnabled ? "visible" : "none",
        );
      }

      if (
        !map.getLayer("saaf-pani-3d-buildings") &&
        map.getSource("composite")
      ) {
        const labelLayer = map
          .getStyle()
          .layers?.find(
            (layer) =>
              layer.type === "symbol" &&
              layer.layout &&
              layer.layout["text-field"],
          );

        map.addLayer(
          {
            id: "saaf-pani-3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": isLight ? "#94a3b8" : "#334155",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.62,
            },
            layout: { visibility: is3DEnabled ? "visible" : "none" },
          },
          labelLayer?.id,
        );
      } else if (map.getLayer("saaf-pani-3d-buildings")) {
        map.setLayoutProperty(
          "saaf-pani-3d-buildings",
          "visibility",
          is3DEnabled ? "visible" : "none",
        );
      }

      map.easeTo({
        pitch: is3DEnabled ? 52 : 0,
        duration: 650,
      });
    };

    configureLayers();
    map.on("style.load", configureLayers);
    return () => map.off("style.load", configureLayers);
  }, [
    mapLoaded,
    mappedPlants,
    is3DEnabled,
    isHeatmapEnabled,
    isLight,
    mapStyleRevision,
  ]);

  useEffect(() => {
    if (selectedPlant) setShowPlantList(false);
  }, [selectedPlant]);

  const handlePlantClick = (plant) => {
    onSelectPlant(plant);
    setShowPlantList(false);
  };

  const handleVisibleClick = () => {
    onSelectPlant(null);
    setShowPlantList((prev) => !prev);
  };

  return (
        <section className={cn("overflow-hidden rounded-xl border", surface)}>
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2",
              isLight ? "border-black/10" : "border-white/10",
            )}
          >
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <MapPinned size={16} className="text-emerald-500" />
             RUDA Survey GIS Engine
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn("mr-1 whitespace-nowrap text-[10px]", textMuted)}
              >
                Live plant coordinates · green surveyed · red pending
              </span>
              <button
                type="button"
                onClick={() => setIs3DEnabled((value) => !value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md border px-2.5 !text-[10px] font-normal transition",
                  is3DEnabled
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                    : "border-[#7d8490] bg-[#e9ecf1] text-[#1f2022] hover:border-[#707782] hover:bg-[#a0a9ba]",
                )}
              >
                <Building2 size={11} />
                3D Extrusions
              </button>

              <button
                type="button"
                onClick={() => setIsHeatmapEnabled((value) => !value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md border px-2.5 !text-[10px] font-normal transition",
                  isHeatmapEnabled
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                    : "border-[#7d8490] bg-[#e9ecf1] text-[#1f2022] hover:border-[#707782] hover:bg-[#a0a9ba]",
                )}
              >
                <Flame size={11} />
                Density Heatmap
              </button>

              <button
                type="button"
                onClick={handleVisibleClick}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 !text-[10px] font-semibold transition",
                  softSurface,
                )}
                title="View visible plant sites"
              >
                <Layers size={12} />
                {formatNumber(mappedPlants.length)} Surveys
              </button>
            </div>
          </div>

          <div className="relative h-[610px]">
            <div className="relative h-full w-full overflow-hidden">
              <div
                ref={mapContainerRef}
                className="absolute inset-0 h-full w-full"
              />

              <div
                className={cn(
                  "pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold shadow-lg backdrop-blur-md",
                  isLight
                    ? "border-black/10 bg-white/90 text-slate-700"
                    : "border-[#7d8490] bg-[#e9ecf1] text-[#1f2022] hover:border-[#707782] hover:bg-[#a0a9ba]",
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                WebGL Spatial Engine Active
              </div>

              {showPlantList && (
                <div
                  className={cn(
                    "absolute left-4 top-14 z-20 w-[320px] max-w-[calc(100%-32px)] overflow-hidden rounded-xl border shadow-2xl",
                    isLight
                      ? "border-black/10 bg-white"
                      : "border-white/10 bg-[#111827]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between border-b px-4 py-3",
                      isLight ? "border-black/10" : "border-white/10",
                    )}
                  >
                    <div>
                      <div className="text-[13px] font-semibold">
                        Plant Sites
                      </div>
                      <div className={cn("mt-0.5 text-[10px]", textMuted)}>
                        Click a plant to locate it
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPlantList(false)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition",
                        isLight ? "hover:bg-slate-100" : "hover:bg-white/10",
                      )}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto p-2">
                    {mappedPlants.map((plant) => (
                      <button
                        key={plant.id}
                        type="button"
                        onClick={() => handlePlantClick(plant)}
                        className={cn(
                          "mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition last:mb-0",
                          isLight ? "hover:bg-slate-100" : "hover:bg-white/5",
                        )}
                      >
                        <span
                          className={cn(
                            "h-3 w-3 flex-shrink-0 rounded-full border-2 border-white shadow",
                            plant.isSurveyed ? "bg-emerald-500" : "bg-rose-500",
                          )}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-semibold">
                            {plant.siteName}
                          </div>
                          <div className={cn("mt-0.5 text-[10px]", textMuted)}>
                            {plant.plantCode} · {plant.plantType}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlant && (
                <div
                  className={cn(
                    "absolute bottom-4 left-4 z-20 w-[330px] max-w-[calc(100%-32px)] rounded-xl border p-3.5 shadow-2xl backdrop-blur-md",
                    isLight
                      ? "border-black/10 bg-white/95"
                      : "border-white/10 bg-[#0f172a]/95",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-[15px] font-bold">
                          {selectedPlant.siteName}
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide",
                            selectedPlant.isSurveyed
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-rose-500/10 text-rose-600",
                          )}
                        >
                          {selectedPlant.isSurveyed
                            ? "Surveyed"
                            : "Pending Survey"}
                        </span>
                      </div>
                      <div className={cn("mt-1 text-[11px]", textMuted)}>
                        {selectedPlant.plantCode} · {selectedPlant.plantType} ·{" "}
                        {selectedPlant.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectPlant(null)}
                      className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition",
                        isLight ? "hover:bg-slate-100" : "hover:bg-white/10",
                      )}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <PlantInfo
                      label="Capacity"
                      value={selectedPlant.capacity}
                      isLight={isLight}
                    />
                    <PlantInfo
                      label="Latitude"
                      value={selectedPlant.latitude}
                      isLight={isLight}
                    />
                    <PlantInfo
                      label="Longitude"
                      value={selectedPlant.longitude}
                      isLight={isLight}
                    />
                    <PlantInfo
                      label="Survey Date"
                      value={
                        selectedPlant.isSurveyed
                          ? dateOnly(selectedPlant.surveyDate) || "-"
                          : "-"
                      }
                      isLight={isLight}
                    />
                  </div>
                </div>
              )}

              {!import.meta.env.VITE_MAPBOX_TOKEN && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100 px-6 text-center text-[13px] text-slate-600">
                  Add{" "}
                  <span className="mx-1 font-mono font-semibold">
                    VITE_MAPBOX_TOKEN
                  </span>{" "}
                  to your .env file to load the Mapbox map.
                </div>
              )}
            </div>
          </div>
        </section>
  );
}

function PlantInfo({ label, value, isLight }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
        isLight ? "border-black/10 bg-slate-50" : "border-white/10 bg-white/5",
      )}
    >
      <div
        className={cn(
          "shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em]",
          isLight ? "text-slate-500" : "text-slate-500",
        )}
      >
        {label}
      </div>

      <div
        className={cn(
          "min-w-0 truncate text-right text-[11px] font-semibold",
          isLight ? "text-slate-800" : "text-slate-100",
        )}
      >
        {value || "-"}
      </div>
    </div>
  );
}
