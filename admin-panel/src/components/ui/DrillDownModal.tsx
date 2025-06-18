import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { tailwindColorToRgba } from "../../utils/colorUtils";

type CalendarData = {
  calendar_id: string;
  calendar_name?: string;
  count: number;
};

type CalendarInfo = {
  alias: string;
  name: string;
  color: string;
};

type DrillDownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filterType: "hour" | "weekday" | "month" | "all";
  filterValue: string | number;
  apiUrl: string;
  calendarInfo: CalendarInfo[];
  authToken: string | null;
};

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  filterType,
  filterValue,
  apiUrl,
  calendarInfo,
  authToken,
}) => {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    const endpoint =
      filterType === "all"
        ? `${apiUrl}/analytics-drilldown-all`
        : `${apiUrl}/analytics-drilldown?type=${filterType}&value=${filterValue}`;

    fetch(endpoint, {
      headers: {
      Authorization: `Bearer ${authToken}`,
    },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setCalendarData(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, filterType, filterValue, apiUrl]);

  if (!isOpen) return null;

  // Hae kalenterin väri calendarInfo:sta, tai käytä oletusväriä jos sitä ei löydy
  const getCalendarColor = (calendarId: string): string => {
    const colorName = calendarInfo.find(
      (info) => info.alias === calendarId
    )?.color;
    return tailwindColorToRgba(colorName || 'blue', 0.6); // oletus sininen
  };

  const chartData = {
    labels: calendarData.map((d) => d.calendar_name || `${d.calendar_id}`),
    datasets: [
      {
        label: "Varausten määrä",
        data: calendarData.map((d) => d.count),
        backgroundColor: calendarData.map((d) =>
          getCalendarColor(d.calendar_id)
        ),
        borderColor: calendarData.map((d) => getCalendarColor(d.calendar_id)),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} varausta`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Sulje modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : calendarData.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Yhteensä {calendarData.reduce((sum, d) => sum + d.count, 0)}{" "}
                  varausta
                </p>
              </div>
              <div className="h-96">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                Ei varauksia valitulla aikavälillä
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Sulje
          </button>
        </div>
      </div>
    </div>
  );
};
