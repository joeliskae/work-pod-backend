import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type HourData = { hour: string; count: number };
type WeekdayData = { weekday: string; count: number };
type EventData = { action: string; count: number };
type MonthData = { labels: string[]; data: number[] };

export default function App() {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [monthData, setMonthData] = useState<MonthData | null>(null);

  const apiUrl = "http://localhost:3000/api/v1";

  useEffect(() => {
    fetch(`${apiUrl}/analytics-hour`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch /analytics-hour");
        const data = await res.json();
        if (Array.isArray(data)) setHourData(data);
      })
      .catch(console.error);

    fetch(`${apiUrl}/analytics-week`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch /analytics-week");
        const data = await res.json();
        if (Array.isArray(data)) setWeekdayData(data);
      })
      .catch(console.error);

    fetch(`${apiUrl}/analytics-events`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch /analytics-events");
        const data = await res.json();
        if (Array.isArray(data)) setEventData(data);
      })
      .catch(console.error);

    fetch(`${apiUrl}/analytics-yearly`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch /analytics-month");
        const data = await res.json();
        if (data && data.labels && data.data) setMonthData(data);
      })
      .catch(console.error);
  }, []);

  const hourChartData = {
    labels: hourData.map((d) => d.hour + ":00"),
    datasets: [
      {
        label: "Varausten määrä tunneittain",
        data: hourData.map((d) => d.count),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const daysOfWeek = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
  const weeklyCounts = daysOfWeek.map((_, i) => {
    const dayData = weekdayData.find((d) => d.weekday === (i + 1).toString());
    return dayData ? dayData.count : 0;
  });

  const weekChartData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Varausten määrä päivittäin",
        data: weeklyCounts,
        backgroundColor: "rgba(53, 162, 235, 0.6)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const createdCount =
    eventData.find((e) => e.action === "created")?.count || 0;
  const deletedCount =
    eventData.find((e) => e.action === "deleted")?.count || 0;

  const eventsChartData = {
    labels: [`Varaukset (${createdCount})`, `Peruutukset (${deletedCount})`],
    datasets: [
      {
        label: "Tapahtumat",
        data: [createdCount, deletedCount],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  const monthChartData = {
    labels: monthData ? monthData.labels : [],
    datasets: [
      {
        label: "Varausten määrä kuukausittain",
        data: monthData ? monthData.data : [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const totalEvents = createdCount + deletedCount;

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        boxSizing: "border-box",
        margin: 0,
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          marginBottom: "2rem",
        }}
      >
        Analytiikka Dashboard
      </h1>
      <h2 style={{ marginBottom: "1rem" }}>Varaukset tunneittain</h2>
      <section
        style={{ marginBottom: "4rem", width: "100%", maxWidth: "100%" }}
      >
        <Bar
          data={hourChartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 3,
            plugins: { legend: { display: false } },
            animation: {
              duration: 1500,
              easing: "easeOutQuart",
            },
          }}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "3rem",
          width: "100%",
          maxWidth: "100%",
          alignItems: "start",
        }}
      >
        <div style={{ width: "100%" }}>
          <h2 style={{ marginBottom: "1rem" }}>Varaukset päivittäin</h2>
          <div style={{ width: "100%", height: "400px" }}>
            <Bar
              data={weekChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                animation: {
                  duration: 1500,
                  easing: "easeOutQuart",
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginBottom: "1rem", alignSelf: "flex-start" }}>
            Tapahtumat
          </h2>
          <div
            style={{ width: "400px", height: "400px", position: "relative" }}
          >
            <Doughnut
              data={eventsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 14,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const percentage = (
                          (context.parsed / totalEvents) *
                          100
                        ).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      },
                    },
                  },
                },
                cutout: "65%",
              }}
            />
            {/* Keskellä näkyvät numerot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {createdCount}
              </div>
              <div style={{ fontSize: "1rem", opacity: 0.8 }}>Varausta</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "4rem", width: "100%", maxWidth: "100%" }}>
        <h2 style={{ marginBottom: "1rem" }}>Varaukset kuukausittain</h2>
        <div style={{ width: "100%", height: "400px" }}>
          <Bar
            data={monthChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              animation: {
                duration: 1500,
                easing: "easeOutQuart",
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                },
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
