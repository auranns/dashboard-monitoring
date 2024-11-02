import { createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";

function ChartComponent() {
  let chartCanvas;
  const [genderData, setGenderData] = createSignal({ male: 0, female: 0 });

  // Fetch data dari API
  onMount(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8080/count/gender");
      const users = await response.json();

      // Hitung jumlah laki-laki dan perempuan berdasarkan 'jenis_kelamin'
      const maleCount = users.filter((user) => user.gender === "Laki-laki").length;
      const femaleCount = users.filter((user) => user.gender === "Perempuan").length;

      // Set gender data untuk chart
      setGenderData({ male: maleCount, female: femaleCount });

      // Inisialisasi chart setelah data tersedia
      if (chartCanvas) {
        new Chart(chartCanvas, {
          type: "pie",
          data: {
            labels: ["Laki-laki", "Perempuan"],
            datasets: [
              {
                data: [maleCount, femaleCount],
                backgroundColor: ["#36A2EB", "#FF6384"],
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
                    const dataset = tooltipItem.dataset;
                    const total = dataset.data.reduce((acc, value) => acc + value, 0);
                    const currentValue = dataset.data[tooltipItem.dataIndex];
                    const percentage = ((currentValue / total) * 100).toFixed(2);
                    return `${currentValue} (${percentage}%)`;
                  },
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching users data: ", error);
    }
  });

  return (
    <div style={{ width: "300px", height: "200px" }}>
      <canvas ref={(el) => (chartCanvas = el)} /> {/* Memperbaiki ref canvas untuk Solid.js */}
    </div>
  );
}

export default ChartComponent;
