import { useState } from "react";
import LineChart from "./LineChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Marchant } from "../../components/common/Svg";
import { People } from "../../components/common/Svg";
import { Pending } from "../../components/common/Svg";
import { SubscriptionManagement } from "../../components/common/Svg";
import BarChart from "./BarChart";
import { useGetStatisticsDataQuery } from "../../redux/apiSlices/homeSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("7d");

  // Map display text to API values
  const optionsMap = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    all: "All Time",
  };

  const queryParams = [{ name: "range", value: selected }];

  const {
    data: response,
    isError,
  } = useGetStatisticsDataQuery(queryParams);

  const options2 = ["today", "7d", "30d", "all"];

  // Handle dropdown change
  const handleRangeChange = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  // Show error state
  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            You dont't have permission to access this data.
          </h2>

          <p className="text-sm text-gray-500 max-w-xs">
            We couldn’t load the data. Please refresh the page or try again
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-7 rounded-lg">
        {/* Line Chart Section */}
        <div className="w-full xl:flex-1 border border-primary bg-[#D7F4DE] rounded-lg p-6">
          <LineChart />
        </div>

        {/* Card Section */}
        <div className="w-full xl:w-1/3 bg-[#D7F4DE] border border-primary p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-secondary mt-4 text-[24px] font-bold">
              Statistics
            </h2>
            <div className="relative inline-block w-[150px]">
              {/* Dropdown Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full font-medium text-[14px] py-[8px] px-[16px] border border-primary text-secondary rounded-lg text-left flex justify-between items-center"
              >
                {optionsMap[selected]}
                <span className="ml-2">▼</span>
              </button>

              {/* Dropdown Options */}
              {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-primary rounded-lg mt-1 shadow-lg">
                  {options2.map((option) => (
                    <li
                      key={option}
                      onClick={() => handleRangeChange(option)}
                      className="cursor-pointer px-4 py-2 text-black hover:bg-primary/10"
                    >
                      {optionsMap[option]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-primary rounded-lg flex items-center justify-start py-2 px-4 2xl:py-4 2xl:px-6">
              <div className="flex flex-col items-baseline">
                <h2 className="text-[16px] font-semibold mb-1">
                  Total Merchants
                </h2>
                <h3 className="text-secondary text-[24px] font-semibold flex items-center gap-3">
                  <Marchant className="w-[20px] h-[20px] text-secondary" />
                  {response?.data?.providers || 0}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-primary rounded-lg flex items-center justify-start py-2 px-4 2xl:py-4 2xl:px-6">
              <div className="flex flex-col items-baseline">
                <h2 className="text-[16px] font-semibold mb-1">
                  Total Customers
                </h2>
                <h3 className="text-secondary text-[24px] font-semibold flex items-center gap-3">
                  <People className="w-[20px] h-[20px] text-secondary" />
                  {response?.data?.customers || 0}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-primary rounded-lg flex items-center justify-start py-2 px-4 2xl:py-4 2xl:px-6">
              <div className="flex flex-col items-baseline">
                <h2 className="text-[16px] font-semibold mb-1">
                  Pending Approvals
                </h2>
                <h3 className="text-secondary text-[24px] font-semibold flex items-center gap-3">
                  <Pending className="w-[20px] h-[20px] text-secondary" />
                  {response?.data?.pendingApprovals || 0}
                </h3>
              </div>
            </div>

            <div className="bg-white border border-primary rounded-lg flex items-center justify-start py-2 px-4 2xl:py-4 2xl:px-6">
              <div className="flex flex-col items-baseline">
                <h2 className="text-[16px] font-semibold mb-1">
                  Membership Revenue
                </h2>
                <h3 className="text-secondary text-[24px] font-semibold flex items-center gap-3">
                  <SubscriptionManagement className="w-[20px] h-[20px] text-secondary" />
                  {response?.data?.subscriptionRevenue || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="flex-1 border border-primary bg-[#D7F4DE] rounded-lg p-6">
        <BarChart />
      </div>
    </div>
  );
};

export default Home;
