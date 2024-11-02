import { createSignal, onMount, onCleanup, For } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import Chart from "chart.js/auto";
import "./Map.css";

const islandMarkersData = [
  {
    name: "Jawa",
    coords: { lat: -7.5, lng: 110.0, title: "Pulau Jawa" },
    area: 132, // Luas wilayah dalam km² (contoh)
    provinces: [
      {
        name: "Jawa Barat",
        coords: { lat: -6.9039, lng: 107.6186, title: "Jawa Barat" },
        area: 35800, // Luas wilayah dalam km² (contoh)
        kabupatens: [
          {
            name: "Bandung",
            coords: { lat: -6.9039, lng: 107.6186, title: "Bandung" },
            area: 167, // Luas wilayah dalam km² (contoh)
            kecamatans: [
              { name: "Coblong", coords: { lat: -6.878, lng: 107.611, title: "Coblong" }, area: 10 },
              { name: "Lengkong", coords: { lat: -6.928, lng: 107.613, title: "Lengkong" }, area: 12 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Sumatra",
    coords: { lat: 0.7893, lng: 100.523, title: "Pulau Sumatra" },
    area: 473481, // Luas wilayah dalam km² (contoh)
    provinces: [
      {
        name: "Aceh",
        coords: { lat: 5.5483, lng: 95.3238, title: "Aceh" },
        area: 57332, // Luas wilayah dalam km² (contoh)
        population: { male: 60, female: 700 }, // Dummy data
        kabupatens: [
          {
            name: "Banda Aceh",
            coords: { lat: 5.55, lng: 95.317, title: "Banda Aceh" },
            area: 61, // Luas wilayah dalam km² (contoh)
            kecamatans: [
              { name: "Meuraxa", coords: { lat: 5.568, lng: 95.32, title: "Meuraxa" }, area: 5 },
              { name: "Kuta Alam", coords: { lat: 5.548, lng: 95.33, title: "Kuta Alam" }, area: 6 },
            ],
          },
        ],
      },
    ],
  },
];

function Maps() {
  let mapContainer: HTMLDivElement | undefined;
  let map: L.Map | undefined;
  let currentMarkers: L.Marker[] = [];
  let searchMarkerLayer: L.LayerGroup = L.layerGroup();

  const [searchTerm, setSearchTerm] = createSignal("");
  const [suggestions, setSuggestions] = createSignal([]);
  const [selectedSuggestion, setSelectedSuggestion] = createSignal(null);

  const here = {
    apiKey: "AKl4s55zcVNZfQoAZhV8-CqfrG-rlm-7A83SYorzCw4",
  };

  const style = "normal.day";
  const hereTileUrl = `https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${style}/{z}/{x}/{y}/512/png8?apiKey=${here.apiKey}&ppi=320`;

  const clearMarkers = () => {
    currentMarkers.forEach((marker) => map?.removeLayer(marker));
    currentMarkers = [];
  };

  const clearSearchMarkers = () => {
    searchMarkerLayer.clearLayers();
  };

  const fetchGenderData = async (provinceName) => {
    if (provinceName !== "Jawa Barat") {
      return null; // Hanya Jawa Barat yang diizinkan
    }

    try {
      const response = await fetch(`http://127.0.0.1:8082/count/gender?provinsi=${provinceName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gender data");
      }
      const data = await response.json();

      const genderData = {
        male: data.find((item) => item.gender === "Laki-laki")?.count || 0,
        female: data.find((item) => item.gender === "Perempuan")?.count || 0,
      };

      return genderData;
    } catch (error) {
      console.error("Error fetching gender data:", error);
      return { male: 0, female: 0 }; // Default jika terjadi error
    }
  };

  // Fungsi untuk membuat chart pie menggunakan Chart.js dengan keterangan jumlah
  const createChart = (data) => {
    const canvas = document.createElement("canvas");

    new Chart(canvas, {
      type: "pie",
      data: {
        labels: [`Male: ${data.male}`, `Female: ${data.female}`], // Display counts in labels
        datasets: [
          {
            label: "Population",
            data: [data.male, data.female],
            backgroundColor: ["#42A5F5", "#FF7043"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label || "";
                return `${label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
      },
    });
    return canvas;
  };

  const addMarkers = async (data, zoomLevel, callback) => {
    clearMarkers();
    for (const item of data) {
      const marker = L.marker([item.coords.lat, item.coords.lng], { title: item.coords.title });

      // Hanya mengambil data dan menampilkan chart jika provinsi adalah "Jawa Barat"
      let genderData = null;
      if (item.name === "Jawa Barat") {
        genderData = await fetchGenderData(item.name);
      }

      marker.bindTooltip(
        (layer) => {
          const tooltipContent = document.createElement("div");
          tooltipContent.innerHTML = `<b>${item.name}</b><br>Lat: ${item.coords.lat}<br>Lng: ${item.coords.lng}<br>Luas: ${item.area || "N/A"} km²`;

          // Jika provinsi adalah "Jawa Barat", tambahkan chart
          if (genderData) {
            const chartCanvas = createChart(genderData);
            tooltipContent.appendChild(chartCanvas);
          }

          // Styling tooltip
          tooltipContent.style.minWidth = "200px";
          tooltipContent.style.maxWidth = "300px";
          tooltipContent.style.whiteSpace = "normal";
          tooltipContent.style.backgroundColor = "#ffffff";
          tooltipContent.style.padding = "10px";
          tooltipContent.style.borderRadius = "5px";
          tooltipContent.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

          return tooltipContent;
        },
        { permanent: false, direction: "top", className: "custom-tooltip" }
      );

      marker.on("click", () => {
        map?.setView([item.coords.lat, item.coords.lng], zoomLevel);
        callback(item);
      });

      marker.addTo(map!);
      currentMarkers.push(marker);
    }
  };
  const addAllMarkers = async (data, zoomLevel, level) => {
    clearMarkers();
    for (const item of data) {
      const marker = L.marker([item.coords.lat, item.coords.lng], { title: item.coords.title });

      let genderData = null;
      if (item.name === "Jawa Barat") {
        // Fetch gender data for Jawa Barat
        genderData = await fetchGenderData(item.name);
      }

      marker.bindTooltip(
        (layer) => {
          const tooltipContent = document.createElement("div");
          tooltipContent.innerHTML = `<b>${item.name}</b><br>Lat: ${item.coords.lat}<br>Lng: ${item.coords.lng}<br>Luas: ${item.area || "N/A"} km²`;

          // Append chart if gender data is available
          if (genderData) {
            const chartCanvas = createChart(genderData);
            tooltipContent.appendChild(chartCanvas);
          }

          // Styling tooltip
          tooltipContent.style.minWidth = "200px";
          tooltipContent.style.maxWidth = "300px";
          tooltipContent.style.whiteSpace = "normal";
          tooltipContent.style.backgroundColor = "#ffffff";
          tooltipContent.style.padding = "10px";
          tooltipContent.style.borderRadius = "5px";
          tooltipContent.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

          return tooltipContent;
        },
        { permanent: false, direction: "top", className: "custom-tooltip" }
      );

      marker.on("click", () => {
        map?.setView([item.coords.lat, item.coords.lng], zoomLevel);
        if (level === "island") {
          addMarkers(item.provinces, 10, async (province) => {
            await addMarkers(province.kabupatens, 13, async (kabupaten) => {
              await addMarkers(kabupaten.kecamatans, 15, () => {});
            });
          });
        } else if (level === "province") {
          addMarkers(item.kabupatens, 13, async (kabupaten) => {
            await addMarkers(kabupaten.kecamatans, 15, () => {});
          });
        } else if (level === "kabupaten") {
          addMarkers(item.kecamatans, 15, () => {});
        }
      });

      marker.addTo(map!);
      currentMarkers.push(marker);
    }
  };

  const searchSuggestions = async (term) => {
    const localSuggestions = islandMarkersData
      .flatMap((island) => [island, ...island.provinces, ...island.provinces.flatMap((province) => [province, ...province.kabupatens, ...province.kabupatens.flatMap((kabupaten) => kabupaten.kecamatans)])])
      .filter((item) => item.name.toLowerCase().includes(term.toLowerCase()))
      .map((item) => ({ title: item.name, coords: item.coords }));

    const externalSuggestions = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${term}&apiKey=${here.apiKey}`)
      .then((response) => response.json())
      .then((data) =>
        data.items.map((item) => ({
          title: item.title,
          coords: { lat: item.position.lat, lng: item.position.lng },
        }))
      );

    const combinedSuggestions = [...localSuggestions, ...externalSuggestions];
    setSuggestions(combinedSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.title);
    setSelectedSuggestion(suggestion);
    map?.setView([suggestion.coords.lat, suggestion.coords.lng], 12);
    setSuggestions([]);

    clearSearchMarkers();
    const searchMarker = L.marker([suggestion.coords.lat, suggestion.coords.lng], { title: suggestion.title });
    searchMarker.bindTooltip(`<b>${suggestion.title}</b><br>Lat: ${suggestion.coords.lat}<br>Lng: ${suggestion.coords.lng}`, { permanent: false, direction: "top" });
    searchMarkerLayer.addLayer(searchMarker);
    searchMarkerLayer.addTo(map!);
  };

  const handleInput = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      await searchSuggestions(value);
    } else {
      setSuggestions([]);
    }

    clearSearchMarkers();
  };

  onMount(async () => {
    if (mapContainer) {
      map = L.map(mapContainer, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        layers: [L.tileLayer(hereTileUrl)],
      });

      // Initial load
      await addAllMarkers(islandMarkersData, 7, "island");

      map.on("zoomend", async () => {
        const currentZoom = map.getZoom();
        const minZoomToShowSearchMarker = 10;
        if (currentZoom < 7) {
          await addAllMarkers(islandMarkersData, 7, "island");
        } else if (currentZoom < 10) {
          await addAllMarkers(
            islandMarkersData.flatMap((island) => island.provinces),
            10,
            "province"
          );
        } else if (currentZoom < 13) {
          await addAllMarkers(
            islandMarkersData.flatMap((island) => island.provinces.flatMap((province) => province.kabupatens)),
            13,
            "kabupaten"
          );
        }

        if (searchMarkerLayer) {
          if (currentZoom < minZoomToShowSearchMarker) {
            searchMarkerLayer.clearLayers();
          } else {
            searchMarkerLayer.addTo(map!);
          }
        }
      });
    }
  });

  onCleanup(() => {
    if (map) {
      map.remove();
    }
  });

  return (
    <div>
      <input type="text" placeholder="Cari lokasi..." value={searchTerm()} onInput={handleInput} style={{ width: "100%", padding: "8px" }} />
      <ul style="list-style-type: none; padding-left: 0; margin-top: 0;">
        <For each={suggestions()}>
          {(suggestion) => (
            <li style="padding: 8px; border-bottom: 1px solid #ddd; cursor: pointer;" onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.title}
            </li>
          )}
        </For>
      </ul>
      <div ref={(el) => (mapContainer = el!)} style={{ width: "100%", height: "400px" }} />
    </div>
  );
}

export default Maps;
