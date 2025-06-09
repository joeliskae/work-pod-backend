import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
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

export const AnalyticsDashboard: React.FC = () => {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [monthData, setMonthData] = useState<MonthData | null>(null);

  const apiUrl = "http://172.30.132.212:3000/api/v1";
  // const apiUrl = "http://localhost:3000/api/v1";

  useEffect(() => {
    fetch(`${apiUrl}/analytics-hour`)
      .then(async (res) => res.ok && setHourData(await res.json()))
      .catch(console.error);

    fetch(`${apiUrl}/analytics-week`)
      .then(async (res) => res.ok && setWeekdayData(await res.json()))
      .catch(console.error);

    fetch(`${apiUrl}/analytics-events`)
      .then(async (res) => res.ok && setEventData(await res.json()))
      .catch(console.error);

    fetch(`${apiUrl}/analytics-yearly`)
      .then(async (res) => res.ok && setMonthData(await res.json()))
      .catch(console.error);
  }, []);

  const hourChartData = {
    labels: hourData.map((d) => d.hour + ":00"),
    datasets: [
      {
        label: "Varausten määrä tunneittain",
        data: hourData.map((d) => d.count),
        backgroundColor: "rgba(59,130,246,0.5)",
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
        backgroundColor: "rgba(16,185,129,0.5)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const createdCount =
    eventData.find((e) => e.action === "created")?.count || 0;
  const deletedCount =
    eventData.find((e) => e.action === "deleted")?.count || 0;
  const totalEvents = createdCount + deletedCount;

  const eventsChartData = {
    labels: [`Varaukset (${createdCount})`, `Peruutukset (${deletedCount})`],
    datasets: [
      {
        label: "Tapahtumat",
        data: [createdCount, deletedCount],
        backgroundColor: ["rgba(34,197,94,0.6)", "rgba(239,68,68,0.6)"],
      },
    ],
  };

  const monthChartData = {
    labels: monthData?.labels || [],
    datasets: [
      {
        label: "Varausten määrä kuukausittain",
        data: monthData?.data || [],
        backgroundColor: "rgba(168,85,247,0.5)",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="bg-white text-gray-900 p-8 w-full max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center">Analytiikka</h1>

      {/* Tunnit */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Varaukset tunneittain</h2>
        <Bar
          data={hourChartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 3,
            plugins: { legend: { display: false } },
            animation: { duration: 1500, easing: "easeOutQuart" },
          }}
        />
      </section>

      {/* Viikkodata ja tapahtumat */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Varaukset päivittäin</h2>
          <div className="h-96">
            <Bar
              data={weekChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                animation: { duration: 1500, easing: "easeOutQuart" },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold self-start">Tapahtumat</h2>
          <div className="h-96 flex flex-col justify-center items-center w-full">
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
                      font: { size: 14 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
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
            <div className="absolute text-center pointer-events-none">
              <div className="text-2xl font-bold">{createdCount}</div>
              <div className="text-sm text-gray-600">Varausta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Kuukausidata */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Varaukset kuukausittain</h2>
        <div className="h-96">
          <Bar
            data={monthChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              animation: { duration: 1500, easing: "easeOutQuart" },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
          />
        </div>
      </section>
    </div>
  );
};
