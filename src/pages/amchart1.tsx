import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

// Define the interface for the chart data
interface BloodTypeData {
  goldar: string;
  count: number;
}

const BloodTypeChart = () => {
  let chartDiv: HTMLDivElement | undefined;
  let chartRoot: am5.Root | undefined;
  let series: am5percent.PieSeries | undefined;

  const [chartData, setChartData] = createSignal<BloodTypeData[]>([]);

  // Function to fetch blood type data
  const fetchBloodTypeData = async (): Promise<BloodTypeData[]> => {
    try {
      const response = await fetch("http://127.0.0.1:8082/chart/goldar");
      if (response.ok) {
        const data: BloodTypeData[] = await response.json();
        console.log("Formatted data for PieChart:", data); // Debug log
        return data;
      } else {
        console.warn("Failed to fetch data from backend");
        return [];
      }
    } catch (error) {
      console.error("Error fetching data from backend:", error);
      return [];
    }
  };

  // Function to update chart colors based on theme
  const updateChartColors = () => {
    if (series) {
      const theme = localStorage.getItem("theme") || "light"; // Default to light if not set
      const textColor = theme === "dark" ? "#ffffff" : "#000000"; // Set color based on theme

      series.labels.template.setAll({
        fill: am5.color(textColor),
      });

      series.slices.template.setAll({
        tooltipText: "{category}: {value}",
        strokeWidth: 0, // Remove border
        strokeOpacity: 0, // Ensure stroke is fully transparent
      });
    }
  };

  onMount(() => {
    if (chartDiv) {
      chartRoot = am5.Root.new(chartDiv);
      let chart = chartRoot.container.children.push(am5percent.PieChart.new(chartRoot, {}));

      series = chart.series.push(
        am5percent.PieSeries.new(chartRoot, {
          name: "Series",
          categoryField: "goldar",
          valueField: "count",
        })
      );

      // Set up the series labels
      series.labels.template.setAll({
        fontSize: "14px",
        textAlign: "center",
      });

      series.labels.template.adapters.add("text", (text, target) => {
        const dataContext = target.dataItem?.dataContext as BloodTypeData;
        return dataContext ? `${dataContext.goldar} (${dataContext.count})` : text;
      });

      series.slices.template.setAll({
        tooltipText: "{category}: {value}",
        strokeWidth: 0, // Remove border
        strokeOpacity: 0, // Ensure stroke is fully transparent
      });

      // Initial data load
      fetchBloodTypeData().then((data) => {
        setChartData(data);
        series?.data.setAll(data);
        updateChartColors(); // Apply initial colors based on theme
      });

      // Event listener for data updates
      const handleDataUpdate = async () => {
        const updatedData = await fetchBloodTypeData();
        setChartData(updatedData);
        series?.data.setAll(updatedData);
        updateChartColors(); // Apply updated colors based on theme
      };

      window.addEventListener("dataUpdated", handleDataUpdate);

      // Event listener for theme changes
      const handleThemeChange = () => {
        updateChartColors(); // Update chart colors when theme changes
      };

      window.addEventListener("themeChanged", handleThemeChange);

      // Cleanup on unmount
      onCleanup(() => {
        window.removeEventListener("dataUpdated", handleDataUpdate);
        window.removeEventListener("themeChanged", handleThemeChange);
        chartRoot?.dispose();
      });
    }
  });

  // Create effect to update chart colors when theme changes
  createEffect(() => {
    updateChartColors();
  });

  return (
    <div class="chart-container1">
      <div class="chart-titlee">Data Golongan Darah</div>
      <div ref={(el) => (chartDiv = el)} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default BloodTypeChart;
