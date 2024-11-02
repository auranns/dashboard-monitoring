import { onCleanup, onMount } from "solid-js";
import * as am5 from "@amcharts/amcharts5/index";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "./amchart.css";

const GenderRadarChart = () => {
  let chartDiv;

  const getDataFromBackend = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8082/chart/gender");
      const data = await response.json();

      const genderCount = data.reduce((acc, item) => {
        const gender = item.gender.toLowerCase();
        acc[gender] = item.count;
        return acc;
      }, {});

      const maxValue = Math.max(genderCount["laki-laki"] || 0, genderCount["perempuan"] || 0);

      const chartData = [
        {
          category: "Laki-laki",
          value: ((genderCount["laki-laki"] || 0) / maxValue) * 100,
          actualValue: genderCount["laki-laki"] || 0,
          columnSettings: {
            fill: am5.color("#86B6F6"),
          },
        },
        {
          category: "Perempuan",
          value: ((genderCount["perempuan"] || 0) / maxValue) * 100,
          actualValue: genderCount["perempuan"] || 0,
          columnSettings: {
            fill: am5.color("#FFBE98"),
          },
        },
      ];

      return chartData;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return [];
    }
  };

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
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          innerRadius: am5.percent(20),
          startAngle: -90,
          endAngle: 180,
        })
      );

      // Create axes and their renderers
      let xRenderer = am5radar.AxisRendererCircular.new(root, {
        minGridDistance: 50,
      });

      // Mengambil warna teks dari variabel CSS
      const initialTextColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim();
      xRenderer.labels.template.setAll({
        radius: 10,
        fill: am5.color(initialTextColor),
      });

      xRenderer.grid.template.setAll({
        forceHidden: true,
      });

      let xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: xRenderer,
          min: 0,
          max: 100,
          strictMinMax: true,
          numberFormat: "#'%'",
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      let yRenderer = am5radar.AxisRendererRadial.new(root, {
        minGridDistance: 20,
      });

      yRenderer.labels.template.setAll({
        centerX: am5.p100,
        fontWeight: "500",
        fontSize: 14,
        fill: am5.color(initialTextColor),
        templateField: "columnSettings",
      });

      yRenderer.grid.template.setAll({
        forceHidden: true,
      });

      let yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "category",
          renderer: yRenderer,
        })
      );

      // Create series
      let series = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          clustered: false,
          valueXField: "value",
          categoryYField: "category",
        })
      );

      series.columns.template.setAll({
        width: am5.p100,
        strokeOpacity: 0,
        tooltipText: "{category}: {actualValue}",
        cornerRadius: 20,
        templateField: "columnSettings",
      });

      // Fetch data from backend and set data to the chart
      let data = await getDataFromBackend();
      yAxis.data.setAll(data);
      series.data.setAll(data);

      // Animate chart and series in
      series.appear(1000);
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
    <div class="chart-containerr4">
      <div class="chart-title1">Data Gender</div>
      <div ref={(el) => (chartDiv = el)} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default GenderRadarChart;
