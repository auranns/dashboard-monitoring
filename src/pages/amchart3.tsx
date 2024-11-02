import { onCleanup, onMount } from "solid-js";
import * as am5 from "@amcharts/amcharts5/index";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "./amchart.css";

const LineChart = () => {
  let chartDiv;

  // Function to get data from backend and format it for the chart
  const fetchData = async () => {
    const response = await fetch("http://127.0.0.1:8082/chart/umur"); // Ganti dengan URL backend
    const data = await response.json();

    // Define age ranges
    const ageRanges = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70+"];

    // Initialize age count for each range
    const ageCount = ageRanges.reduce((acc, range) => {
      acc[range] = 0;
      return acc;
    }, {});

    // Count occurrences in each range
    data.forEach((item) => {
      ageCount[item.umur] = item.count;
    });

    // Format data for chart
    return ageRanges.map((range) => ({
      year: range,
      value: ageCount[range],
      strokeSettings: {
        stroke: am5.color("#007bff"),
      },
      fillSettings: {
        fill: am5.color("#9DBDFF"),
      },
      bulletSettings: {
        fill: am5.color("#007bff"),
      },
    }));
  };

  // Function to update label colors based on theme
  const updateLabelColors = (root, xRenderer, yRenderer) => {
    const theme = localStorage.getItem("theme");
    const textColor = theme === "dark" ? "#ffffff" : "#000000";

    xRenderer.labels.template.setAll({
      fill: am5.color(textColor),
    });

    yRenderer.labels.template.setAll({
      fill: am5.color(textColor),
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
        })
      );

      // Add cursor
      let cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
        })
      );
      cursor.lineY.set("visible", false);

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
        minGridDistance: 80,
      });
      xRenderer.grid.template.set("location", 0.5);
      xRenderer.labels.template.setAll({
        location: 0.5,
        multiLocation: 0.5,
      });

      let xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "year",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      let yRenderer = am5xy.AxisRendererY.new(root, {});
      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxPrecision: 0,
          renderer: yRenderer,
        })
      );

      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "year",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}",
            dy: -5,
          }),
        })
      );

      series.strokes.template.setAll({
        templateField: "strokeSettings",
        strokeWidth: 2,
      });

      series.fills.template.setAll({
        visible: true,
        fillOpacity: 0.5,
        templateField: "fillSettings",
      });

      series.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            templateField: "bulletSettings",
            radius: 5,
          }),
        });
      });

      // Set data
      let data = await fetchData();
      xAxis.data.setAll(data);
      series.data.setAll(data);

      series.appear(1000);

      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, {
          orientation: "horizontal",
          marginBottom: 20,
        })
      );

      chart.appear(1000, 100);

      // Update label colors based on the theme
      updateLabelColors(root, xRenderer, yRenderer);

      // Event listener for theme changes
      const themeChangeListener = () => updateLabelColors(root, xRenderer, yRenderer);
      window.addEventListener("themeChanged", themeChangeListener);

      // Cleanup on unmount
      onCleanup(() => {
        window.removeEventListener("themeChanged", themeChangeListener);
        root.dispose();
      });
    }
  });

  return (
    <div class="chart-containerr">
      <h2 class="chart-title3">Data Umur</h2>
      <div ref={(el) => (chartDiv = el)} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default LineChart;
