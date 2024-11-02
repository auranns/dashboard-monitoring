import { createSignal, onCleanup, onMount } from "solid-js";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "./amchart.css";

const BarChart = () => {
  let chartDiv;

  // Function to fetch data from backend
  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8082/chart/job");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return [];
    }
  };

  const updateLabelColors = (root, xRenderer, yAxis) => {
    const theme = localStorage.getItem("theme");
    const labelColor = theme === "dark" ? am5.color(0xffffff) : am5.color(0x000000);

    xRenderer.labels.template.setAll({
      fill: labelColor,
    });

    yAxis.get("renderer").labels.template.setAll({
      fill: labelColor,
    });
  };

  onMount(async () => {
    if (chartDiv) {
      let root = am5.Root.new(chartDiv);

      root.setThemes([am5themes_Animated.new(root)]);

      // Create chart
      let chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
          paddingRight: 15,
        })
      );

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
        minorGridEnabled: true,
      });

      xRenderer.labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15,
        visible: false,
      });

      xRenderer.grid.template.setAll({
        location: 1,
        visible: false,
      });

      let xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0.3,
          categoryField: "pekerjaan",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      let yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1,
      });

      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 0.3,
          renderer: yRenderer,
        })
      );

      // Update label colors based on the current theme
      updateLabelColors(root, xRenderer, yAxis);

      // Create series
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Job Count",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count",
          sequencedInterpolation: true,
          categoryXField: "pekerjaan",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}", // Tooltip text format
          }),
        })
      );

      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
      });

      series.columns.template.adapters.add("fill", function (fill, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });

      series.columns.template.adapters.add("stroke", function (stroke, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });

      // Fetch and set data
      const data = await fetchData();
      console.log("Chart Data:", data); // Log data to ensure it's being used
      xAxis.data.setAll(data);
      series.data.setAll(data);

      // Configure tooltip for better appearance
      series.columns.template.setAll({
        tooltipText: "{categoryX}: {valueY} items", // Tooltip text format
        tooltipY: 0, // Align tooltip vertically centered
        tooltipX: 0, // Align tooltip horizontally centered
      });

      // Make stuff animate on load
      series.appear(1000);
      chart.appear(1000, 100);

      // Event listener for data updates
      window.addEventListener("dataUpdated", async () => {
        const updatedData = await fetchData();
        yAxis.data.setAll(updatedData);
        series.data.setAll(updatedData);
      });

      // Event listener for theme changes
      const themeChangeListener = () => updateLabelColors(root, xRenderer, yAxis);
      window.addEventListener("themeChanged", themeChangeListener);

      // Cleanup on unmount
      onCleanup(() => {
        window.removeEventListener("dataUpdated", async () => {
          const updatedData = await fetchData();
          yAxis.data.setAll(updatedData);
          series.data.setAll(updatedData);
        });
        window.removeEventListener("themeChanged", themeChangeListener);
        root.dispose();
      });
    }
  });

  return (
    <div class="chart-containerrr">
      <h2 class="chart-title2">Data Pekerjaan</h2>
      <div ref={(el) => (chartDiv = el)} style={{ width: "100%", height: "90%" }} />
    </div>
  );
};

export default BarChart;
