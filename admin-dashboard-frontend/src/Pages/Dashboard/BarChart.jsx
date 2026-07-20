import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import { useGetYearlyRevenueDataQuery } from "../../redux/apiSlices/homeSlice";
import { Spin } from "antd";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [chartHeight, setChartHeight] = useState("250px");
  const [barThickness, setBarThickness] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (w < 480) return 14;
    if (w < 768) return 20;
    if (w < 900) return 30;
    if (w < 1024) return 40;
    if (w < 1280) return 50;
    if (w < 1600) return 60;
    if (w < 1920) return 80;
    return 90;
  });

  const [rangeOpen, setRangeOpen] = useState(false);
  const [start, setStart] = useState(
    dayjs().subtract(3, "years").startOf("year").format("YYYY-MM-DD")
  );
  const [end, setEnd] = useState(dayjs().endOf("year").format("YYYY-MM-DD"));

  // Fetch data from API
  const queryParams = [
    { name: "start", value: start },
    { name: "end", value: end },
  ];

  const {
    data: response,
    isLoading,
    isError,
  } = useGetYearlyRevenueDataQuery(queryParams);

  // Effect to update chart height based on screen size
  useEffect(() => {
    const updateChartHeight = () => {
      if (window.innerWidth < 768) setChartHeight("150px");
      else if (window.innerWidth < 1024) setChartHeight("200px");
      else setChartHeight("250px");
      const w = window.innerWidth;
      if (w < 480) setBarThickness(14);
      else if (w < 768) setBarThickness(20);
      else if (w < 900) setBarThickness(30);
      else if (w < 1024) setBarThickness(40);
      else if (w < 1280) setBarThickness(50);
      else if (w < 1600) setBarThickness(60);
      else if (w < 1920) setBarThickness(80);
      else setBarThickness(90);
    };

    updateChartHeight();
    window.addEventListener("resize", updateChartHeight);
    return () => window.removeEventListener("resize", updateChartHeight);
  }, []);

  // Extract years from date range
  const startYear = new Date(start).getFullYear();
  const endYear = new Date(end).getFullYear();

  // Helper: inclusive year range array
  const makeYearRange = (s, e) => {
    const out = [];
    for (let y = s; y <= e; y++) out.push(y);
    return out;
  };

  // Build chart data from API response
  const yearsInRange = makeYearRange(startYear, endYear);
  const chartData = useMemo(() => {
    if (!response?.data || isLoading) {
      return {
        labels: yearsInRange.map(String),
        datasets: [
          {
            label: `Revenue (${startYear} - ${endYear})`,
            data: [],
            backgroundColor: "#3fae6a",
            borderRadius: 0,
            barThickness: Math.min(barThickness * 4, 450),
            maxBarThickness: 450,
          },
        ],
      };
    }

    // Map API response to chart data
    const yearToRevenue = {};
    response.data.forEach((item) => {
      yearToRevenue[item.year] = item.totalRevenue;
    });

    return {
      labels: yearsInRange.map(String),
      datasets: [
        {
          label: `Revenue (${startYear} - ${endYear})`,
          data: yearsInRange.map((y) => yearToRevenue[y] || 0),
          backgroundColor: "#3fae6a",
          borderRadius: 0,
          barThickness: Math.min(barThickness * 4, 450),
          maxBarThickness: 450,
        },
      ],
    };
  }, [
    response?.data,
    isLoading,
    startYear,
    endYear,
    yearsInRange,
    barThickness,
  ]);

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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // Show raw value only
          label: (context) => `${context.raw}`,
        },
        backgroundColor: "#3fae6a",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 0,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        // Make bars wide but keep a small gap between them
        categoryPercentage: 0.95,
        barPercentage: 0.6,
        ticks: {
          color: "#181818",
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#eaeaea",
        },
        ticks: {
          color: "#181818",
        },
      },
    },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
        <div className="flex justify-between items-center text-white w-full mb-6">
          <h2 className="text-secondary mt-4 text-[24px] font-bold">
            Yearly Revenue
          </h2>
          <div className="relative">
            <button
              onClick={() => setRangeOpen((v) => !v)}
              className="w-[230px] font-medium text-[14px] py-[10px] px-[12px] border border-primary text-secondary rounded-lg text-left flex justify-between items-center"
            >
              <span className="truncate">
                {start && !isNaN(new Date(start).getTime())
                  ? new Date(start).getFullYear()
                  : "-"}
                {" — "}
                {end && !isNaN(new Date(end).getTime())
                  ? new Date(end).getFullYear()
                  : "-"}
              </span>
              <span className="ml-2">📅</span>
            </button>

            {rangeOpen && (
              <div className="absolute right-0 z-10 mt-1 w-[280px] rounded-lg border border-primary bg-white p-3 shadow-lg text-black">
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded-md border px-2 py-2 text-sm text-black bg-white"
                    max={end}
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <label className="block text-xs text-gray-500">
                    End date
                  </label>
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded-md border px-2 py-2 text-sm text-black bg-white"
                    min={start}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setRangeOpen(false)}
                    className="px-3 py-1.5 text-sm rounded-md border text-black bg-white"
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
      </div>
      <div style={{ width: "100%", height: chartHeight }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart;
