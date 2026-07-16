import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import { useGetLineChartDataQuery } from "../../redux/apiSlices/homeSlice";
import { Spin } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const [chartHeight, setChartHeight] = useState("250px");
  const [startDate, setStartDate] = useState(
    dayjs().subtract(365, "days").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [rangeOpen, setRangeOpen] = useState(false);

  // Fetch data from API
  const queryParams = [
    { name: "start", value: startDate },
    { name: "end", value: endDate },
  ];

  const {
    data: response,
    isLoading,
    isError,
  } = useGetLineChartDataQuery(queryParams);

  // Responsive height
  useEffect(() => {
    const updateChartHeight = () => {
      if (window.innerWidth < 768) setChartHeight("150px");
      else if (window.innerWidth < 1024) setChartHeight("200px");
      else setChartHeight("250px");
    };
    updateChartHeight();
    window.addEventListener("resize", updateChartHeight);
    return () => window.removeEventListener("resize", updateChartHeight);
  }, []);

  // Build chart.js dataset from API response
  const data = useMemo(() => {
    if (!response?.data || isLoading) {
      return {
        labels: [],
        datasets: [
          {
            label: "Total Revenue",
            data: [],
            fill: false,
            borderColor: "#198248",
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 2,
            pointBorderColor: "#198248",
            pointBackgroundColor: "#3fae6a",
            pointRadius: 4,
            pointHitRadius: 12,
          },
        ],
      };
    }

    const labels = response.data.map((item) => item.month);
    const values = response.data.map((item) => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: "Total Revenue",
          data: values,
          fill: false,
          borderColor: "#198248",
          backgroundColor: "transparent",
          tension: 0.4,
          borderWidth: 2,
          pointBorderColor: "#198248",
          pointBackgroundColor: "#3fae6a",
          pointRadius: 4,
          pointHitRadius: 12,
        },
      ],
    };
  }, [response?.data, isLoading]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          backgroundColor: "#3fae6a",
          padding: { x: 20, y: 2 },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: () => null,
            label: (ctx) => `$${Number(ctx.raw ?? 0).toLocaleString()}`,
          },
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: true, color: "#198248" },
          ticks: {
            color: "#181818",
            maxRotation: 45,
            minRotation: 0,
            autoSkip: true,
            font: {
              size:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? 8
                  : 12,
            },
          },
        },
        y: {
          grid: { display: false },
          beginAtZero: false,
          ticks: {
            color: "#181818",
            padding:
              typeof window !== "undefined" && window.innerWidth < 768
                ? 10
                : 32,
            callback: (v) => `${Number(v).toLocaleString()}`,
            font: {
              size:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? 8
                  : 12,
            },
          },
        },
      },
    }),
    []
  );

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ height: chartHeight }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">Error loading data.</div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold text-secondary">
          Monthly Revenue
        </h2>

        {/* Range picker (native) */}
        <div className="relative">
          <button
            onClick={() => setRangeOpen((v) => !v)}
            className="w-[230px] font-medium text-[14px] py-[10px] px-[12px] border border-primary text-secondary rounded-lg text-left flex justify-between items-center"
          >
            <span className="truncate">
              {startDate} — {endDate}
            </span>
            <span className="ml-2">📅</span>
          </button>

          {rangeOpen && (
            <div className="absolute right-0 z-10 mt-1 w-[280px] rounded-lg border border-primary bg-white p-3 shadow-lg">
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border px-2 py-2 text-sm"
                  max={endDate}
                />
              </div>
              <div className="space-y-2 mt-3">
                <label className="block text-xs text-gray-500">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border px-2 py-2 text-sm"
                  min={startDate}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setRangeOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-md border"
                >
                  Close
                </button>
                <button
                  onClick={() => setRangeOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-md bg-[#00bcd4] text-white hover:bg-[#00acc1]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        style={{ width: "100%", height: chartHeight }}
        className="text-white"
      >
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
