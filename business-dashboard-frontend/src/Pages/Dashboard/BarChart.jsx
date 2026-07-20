import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useGetCustomerChartQuery } from "../../redux/apiSlices/homeSlice";
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
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(String(currentYear));
  const options2 = years.map((y) => String(y));
  const dropdownRef = useRef(null);

  // Fetch data from API
  const { data: chartResponse, isLoading } = useGetCustomerChartQuery({
    year: selectedYear,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Effect to update chart height based on screen size
  useEffect(() => {
    const updateChartHeight = () => {
      if (window.innerWidth < 768) setChartHeight("210px");
      else if (window.innerWidth < 1024) setChartHeight("240px");
      else setChartHeight("290px");
    };

    updateChartHeight();
    window.addEventListener("resize", updateChartHeight);
    return () => window.removeEventListener("resize", updateChartHeight);
  }, []);

  // Month labels
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract data from API response
  const getRevenueData = () => {
    if (!chartResponse?.data) return monthLabels.map(() => 0);
    return chartResponse.data.map((item) => item.totalRevenue || 0);
  };

  const getDiscountData = () => {
    if (!chartResponse?.data) return monthLabels.map(() => 0);
    return chartResponse.data.map((item) => item.totalDiscount || 0);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#181818",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const formatter = new Intl.NumberFormat("en-US", {
              // style: "currency",
              // currency: "USD",
              maximumFractionDigits: 0,
            });
            const value = context.raw ?? context.parsed?.y ?? 0;
            return `${context.dataset.label}: ${formatter.format(value)}`;
          },
        },
        backgroundColor: "#111827",
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
          callback: function (value) {
            const formatter = new Intl.NumberFormat("en-US", {
              // style: "currency",
              // currency: "USD",
              maximumFractionDigits: 0,
            });
            return formatter.format(Number(value));
          },
        },
      },
    },
  };

  const data = {
    labels: monthLabels,
    datasets: [
      {
        label: "Revenue",
        data: getRevenueData(),
        backgroundColor: "#3fae6a",
        borderRadius: 0,
        maxBarThickness: 48,
      },
      {
        label: "Discount",
        data: getDiscountData(),
        backgroundColor: "#ff7a7a",
        borderRadius: 0,
        maxBarThickness: 48,
      },
    ],
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
        <div className="flex justify-between items-center text-white w-full">
          <h2 className="text-secondary mt-4 text-[24px] font-bold">
            Customer Chart
          </h2>

          <div className="flex items-center gap-2">
            <div ref={dropdownRef} className="relative inline-block w-[100px]">
              {/* Dropdown Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full font-medium text-[14px] py-[8px] px-[16px] border border-primary text-secondary rounded-lg text-left flex justify-between items-center"
              >
                {selected}
                <span className="ml-2">▼</span>
              </button>

              {/* Dropdown Options */}
              {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-primary rounded-lg mt-1 shadow-lg">
                  {options2.map((option) => (
                    <li
                      key={option}
                      onClick={() => {
                        setSelected(option);
                        setSelectedYear(Number(option));
                        setIsOpen(false);
                      }}
                      className="cursor-pointer px-4 py-2 text-black hover:bg-primary/10"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: chartHeight }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default BarChart;
