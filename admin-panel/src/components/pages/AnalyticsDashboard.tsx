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
import { DrillDownModal } from "../ui/DrillDownModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type CalendarInfo = {
  alias: string;
  name: string;
  color: string;
};
type HourData = { hour: string; count: number };
type WeekdayData = { weekday: string; count: number };
type EventData = { action: string; count: number };
type MonthData = { labels: string[]; data: number[] };

type ModalState = {
  isOpen: boolean;
  title: string;
  filterType: "hour" | "weekday" | "month" | "all";
  filterValue: string | number;
};

export const AnalyticsDashboard: React.FC = () => {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [calendarInfo, setCalendarInfo] = useState<CalendarInfo[]>([]);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    filterType: "hour",
    filterValue: "",
  });

  // const apiUrl = "http://172.30.132.212:3000/api/v1";
  const apiUrl = "http://localhost:3000/api/v1";

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

    fetch(`${apiUrl}/calendars/admin`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Ota kalenteritaulukko data.calendars -kentästä
          setCalendarInfo(data.calendars);
        }
      })
      .catch(console.error);
  }, []);

  const openModal = (
    title: string,
    filterType: "hour" | "weekday" | "month" | "all",
    filterValue: string | number
  ) => {
    setModalState({
      isOpen: true,
      title,
      filterType,
      filterValue,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

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

  const hourChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 3,
    plugins: { legend: { display: false } },
    animation: { duration: 1500, easing: "easeOutQuart" as const },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const hour = hourData[index]?.hour;
        if (hour) {
          openModal(`Varaukset klo ${hour}:00`, "hour", hour);
        }
      }
    },
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

  const weekChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1500, easing: "easeOutQuart" as const },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const weekday = daysOfWeek[index];
        const weekdayNumber = index + 1; // 1 = maanantai, 7 = sunnuntai
        if (weekday) {
          openModal(
            `${weekday} - varaukset kalentereittain`,
            "weekday",
            weekdayNumber
          );
        }
      }
    },
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

  const monthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 1500, easing: "easeOutQuart" as const },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const monthLabel = monthData?.labels[index];
        if (monthLabel) {
          openModal(
            `${monthLabel} - varaukset kalentereittain`,
            "month",
            monthLabel
          );
        }
      }
    },
  };

  return (
    <div className="bg-white text-gray-900 p-8 w-full max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center">Analytiikka</h1>

      {/* Tunnit */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Varaukset tunneittain</h2>
        <div className="cursor-pointer">
          <Bar data={hourChartData} options={hourChartOptions} />
        </div>
      </section>

      {/* Viikkodata ja tapahtumat */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Varaukset päivittäin</h2>
          <div className="h-96 cursor-pointer">
            <Bar data={weekChartData} options={weekChartOptions} />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold self-start">Tapahtumat</h2>
          <div className="h-96 flex flex-col justify-center items-center w-full cursor-pointer">
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
                onClick: (_event: any, _elements: any[]) => {
                  // Donitsissa voidaan klikata mitä tahansa kohtaa näyttämään kaikki varaukset
                  openModal("Kaikki varaukset kalentereittain", "all", "all");
                },
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
        <div className="h-96 cursor-pointer">
          <Bar data={monthChartData} options={monthChartOptions} />
        </div>
      </section>

      {/* DrillDown Modal */}
      <DrillDownModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        filterType={modalState.filterType}
        filterValue={modalState.filterValue}
        apiUrl={apiUrl}
        calendarInfo={calendarInfo}
      />
    </div>
  );
};
