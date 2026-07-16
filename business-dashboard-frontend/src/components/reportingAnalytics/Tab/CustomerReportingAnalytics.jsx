import { Button, Col, DatePicker, Form, Row, Select, message, Spin } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  useGetCustomerReportQuery,
  useExportCustomerReportMutation,
  useGetCustomerNameListQuery,
} from "../../../redux/apiSlices/customerReportSlice";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTable from "../../common/CustomTable";
import { useUser } from "../../../provider/User";

const { Option } = Select;

// Sample data with additional fields
const data = [
  {
    sl: 1,
    date: "2025-01-01",
    category: "Employee",
    region: "USA",
    CustomerName: "Customer 1",
    CustomerID: "CUST001",
    Location: "New York",
    SubscriptionStatus: "Active",
    PaymentStatus: "Paid",
    DaysToExpire: 30,
    Revenue: 100,
    Visits: 65,
    "Points Redeemed": 32,
    "Points Accumulated": 45,
  },
];

// Dropdown options - will be generated from data
const subscriptionOptions = ["All Status", "Active", "Inactive"];
const paymentOptions = ["All Payments", "Paid", "Unpaid", "Expired"];
const metricOptions = [
  "Revenue",
  "Visits",
  "Points Redeemed",
  "Points Accumulated",
];

const maxValues = {
  Revenue: Math.max(...data.map((d) => d.Revenue)),
  Visits: Math.max(...data.map((d) => d.Visits)),
  "Points Redeemed": Math.max(...data.map((d) => d["Points Redeemed"])),
  "Points Accumulated": Math.max(...data.map((d) => d["Points Accumulated"])),
};

// Custom 3D Bar with watermark
const Custom3DBarWithWatermark = ({
  x,
  y,
  width,
  height,
  fill,
  dataKey,
  payload,
}) => {
  const depth = 10;
  const maxValue = maxValues[dataKey];
  const scale = maxValue / payload[dataKey];
  const watermarkHeight = height * scale;
  const watermarkY = y - (watermarkHeight - height);

  return (
    <g>
      <g opacity={0.1}>
        <rect
          x={x}
          y={watermarkY}
          width={width}
          height={watermarkHeight}
          fill={fill}
        />
        <polygon
          points={`${x},${watermarkY} ${x + depth},${watermarkY - depth} ${
            x + width + depth
          },${watermarkY - depth} ${x + width},${watermarkY}`}
          fill={fill}
        />
        <polygon
          points={`${x + width},${watermarkY} ${x + width + depth},${
            watermarkY - depth
          } ${x + width + depth},${watermarkY + watermarkHeight} ${x + width},${
            watermarkY + watermarkHeight
          }`}
          fill={fill}
        />
      </g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={0.4}
      />
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${
          y - depth
        } ${x + width},${y}`}
        fill={fill}
        opacity={0.6}
      />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${
          x + width + depth
        },${y + height} ${x + width},${y + height}`}
        fill={fill}
        opacity={0.7}
      />
    </g>
  );
};

export default function MonthlyStatsChartCustomer() {
  const [fromDate, setFromDate] = useState(dayjs().startOf("year"));
  const [toDate, setToDate] = useState(dayjs().endOf("year"));
  const [, setSelectedCategory] = useState("All Categories");
  const [, setSelectedRegion] = useState("All Regions");
  const [selectedCustomer, setSelectedCustomer] = useState("All Customers");
  const [selectedLocation, setSelectedLocation] = useState("All Cities");
  const [selectedSubscription, setSelectedSubscription] =
    useState("All Status");
  const [selectedPayment, setSelectedPayment] = useState("All Payments");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [selectedPointsFilter, setSelectedPointsFilter] = useState("All");
  const [chartType, setChartType] = useState("Bar");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // Get user data to check role
  const { user } = useUser();

  // Export mutation hook
  const [exportReport, { isLoading: isExporting }] =
    useExportCustomerReportMutation();

  // Query params for customer name list (all customers with high limit)
  const customerNameListParams = [
    { name: "page", value: 1 },
    { name: "limit", value: 10000 },
  ];

  // Fetch all customer names for dropdown
  const { data: customerNameListResponse } = useGetCustomerNameListQuery(
    customerNameListParams,
  );

  // Build query parameters
  const queryParams = [];
  if (fromDate)
    queryParams.push({
      name: "startDate",
      value: fromDate.format("YYYY-MM-DD"),
    });
  if (toDate)
    queryParams.push({ name: "endDate", value: toDate.format("YYYY-MM-DD") });
  if (selectedCustomer !== "All Customers")
    queryParams.push({
      name: "customerName",
      value: selectedCustomer,
    });
  if (selectedSubscription !== "All Status")
    queryParams.push({
      name: "subscriptionStatus",
      value:
        selectedSubscription === "Inactive"
          ? "inActive"
          : selectedSubscription.toLowerCase(),
    });
  if (selectedLocation !== "All Cities")
    queryParams.push({
      name: "location",
      value: selectedLocation.toLowerCase(),
    });
  if (selectedPayment !== "All Payments")
    queryParams.push({
      name: "paymentStatus",
      value: selectedPayment.toLowerCase(),
    });
  // Add pagination parameters
  queryParams.push({
    name: "page",
    value: pagination.current,
  });
  queryParams.push({
    name: "limit",
    value: pagination.pageSize,
  });

  // Update browser URL with query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    queryParams.forEach((param) => {
      params.append(param.name, param.value);
    });
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [queryParams]);

  // Fetch customer report data from API
  const {
    data: reportResponse,
    isLoading,
    isFetching,
  } = useGetCustomerReportQuery(queryParams.length > 0 ? queryParams : []);

  // Extract pagination info from API response
  const paginationInfo = useMemo(() => {
    return {
      current: reportResponse?.pagination?.page || 1,
      pageSize: reportResponse?.pagination?.limit || 10,
      total: reportResponse?.pagination?.total || 0,
    };
  }, [reportResponse?.pagination]);

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  // Reset pagination to 1 when filters change
  useEffect(() => {
    setPagination({ current: 1, pageSize: 10 });
  }, [
    selectedCustomer,
    selectedLocation,
    selectedSubscription,
    selectedPayment,
    fromDate,
    toDate,
  ]);

  // Transform API data to match table format
  const transformedData = useMemo(() => {
    if (!reportResponse?.data?.records) return [];
    return reportResponse.data.records.map((item, index) => {
      // Calculate serial number based on pagination
      const serialNumber =
        (paginationInfo.current - 1) * paginationInfo.pageSize + index + 1;
      return {
        key: index,
        sl: serialNumber,
        date: item?.date || "-",
        customerId: item.customerId || "-",
        CustomerName: item.customerName || "-",
        customerName: item.customerName || "-",
        Location: item.city || item.location || "-",
        location: item.city || item.location || "-",
        subscriptionStatus:
          item.subscriptionStatus === "active"
            ? "Active"
            : item.subscriptionStatus === "inActive"
              ? "Inactive"
              : "-",
        PaymentStatus:
          item.paymentStatus === "paid"
            ? "Paid"
            : item.paymentStatus === "unpaid"
              ? "Unpaid"
              : item.paymentStatus === "expired"
                ? "Expired"
                : "-",
        paymentStatus:
          item.paymentStatus === "paid"
            ? "Paid"
            : item.paymentStatus === "unpaid"
              ? "Unpaid"
              : item.paymentStatus === "expired"
                ? "Expired"
                : "-",
        Revenue: item.revenue || 0,
        revenue: item.revenue || 0,
        "Points Accumulated": parseFloat(
          (item.pointsAccumulated || 0).toFixed(2),
        ),
        pointsAccumulated: parseFloat((item.pointsAccumulated || 0).toFixed(2)),
        "Points Redeemed": item.pointsRedeemed || 0,
        pointsRedeemed: item.pointsRedeemed || 0,
        category: "Customer",
        region: item.city || item.location,
        Visits: item.totalUsers || 0,
        visits: item.totalUsers || 0,
      };
    });
  }, [
    reportResponse?.data?.records,
    paginationInfo.current,
    paginationInfo.pageSize,
  ]);

  const filteredData = useMemo(() => {
    return transformedData.filter((d) => {
      return (
        (selectedCustomer === "All Customers" ||
          d.CustomerName === selectedCustomer) &&
        (selectedLocation === "All Cities" ||
          d.Location?.toLowerCase() === selectedLocation.toLowerCase()) &&
        (selectedSubscription === "All Status" ||
          d.subscriptionStatus === selectedSubscription) &&
        (selectedPayment === "All Payments" ||
          d.PaymentStatus?.toLowerCase() === selectedPayment.toLowerCase())
      );
    });
  }, [
    selectedCustomer,
    selectedSubscription,
    selectedLocation,
    selectedPayment,
    transformedData,
  ]);

  // Generate 12 months of chart data using API monthlyData
  const chartData = useMemo(() => {
    // Use monthlyData from API whenever available (with or without customer filter)
    if (
      reportResponse?.data?.monthlyData &&
      reportResponse.data.monthlyData.length > 0
    ) {
      return reportResponse.data.monthlyData.map((item) => ({
        date: `${item.monthName} ${item.year}`,
        fullDate: `${item.year}-${String(item.month).padStart(2, "0")}`,
        Revenue: Math.round(item.totalRevenue || 0),
        Visits: Math.round(item.totalUsers || 0),
        "Points Redeemed": parseFloat(
          (item.totalPointsRedeemed || 0).toFixed(2),
        ),
        "Points Accumulated": parseFloat(
          (item.totalPointsAccumulated || 0).toFixed(2),
        ),
      }));
    }

    // Fallback: Generate from filtered records when API data not available
    const months = [];
    const now = dayjs();

    for (let i = 11; i >= 0; i--) {
      const date = now.subtract(i, "month");
      const monthData = filteredData.filter(
        (d) => dayjs(d.date).format("YYYY-MM") === date.format("YYYY-MM"),
      );

      const sumRevenue = monthData.reduce(
        (sum, d) => sum + (d.Revenue || 0),
        0,
      );
      const sumVisits = monthData.reduce((sum, d) => sum + (d.Visits || 0), 0);
      const sumPointsRedeemed = monthData.reduce(
        (sum, d) => sum + (d["Points Redeemed"] || 0),
        0,
      );
      const sumPointsAccumulated = monthData.reduce(
        (sum, d) => sum + (d["Points Accumulated"] || 0),
        0,
      );

      months.push({
        date: date.format("MMM YYYY"),
        fullDate: date.format("YYYY-MM-DD"),
        Revenue: Math.round(sumRevenue),
        Visits: Math.round(sumVisits),
        "Points Redeemed": parseFloat(sumPointsRedeemed.toFixed(2)),
        "Points Accumulated": parseFloat(sumPointsAccumulated.toFixed(2)),
      });
    }

    return months;
  }, [reportResponse?.data?.monthlyData, filteredData]);

  // Generate dynamic options from customer name list API
  const customerOptions = useMemo(() => {
    if (
      customerNameListResponse?.data?.records &&
      Array.isArray(customerNameListResponse.data.records)
    ) {
      const customers = new Set(
        customerNameListResponse.data.records
          .map((d) => d.customerName)
          .filter(Boolean),
      );
      return ["All Customers", ...Array.from(customers).sort()];
    }
    return ["All Customers"];
  }, [customerNameListResponse]);

  const cityList = [
    "Abu Dhabi",
    "Ajman",
    "Birmingham",
    "Dhaka",
    "Doha",
    "Dubai",
    "Fujairah",
    "Glasgow",
    "Islamabad",
    "Jeddah",
    "Karachi",
    "Kuwait City",
    "Lahore",
    "Liverpool",
    "London",
    "Manchester",
    "Manama",
    "Muscat",
    "Peshawar",
    "Quetta",
    "Ras Al Khaimah",
    "Rawalpindi",
    "Riyadh",
    "Sharjah",
    "Umm Al Quwain",
  ];

  const dynamicLocationOptions = useMemo(() => {
    return ["All Cities", ...cityList];
  }, []);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "SL",
        dataIndex: "sl",
        key: "sl",
        align: "center",
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        align: "center",
        render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
      },
      {
        title: "Customer ID",
        dataIndex: "customerId",
        key: "customerId",
        align: "center",
      },
      {
        title: "Customer Name",
        dataIndex: "CustomerName",
        key: "CustomerName",
        align: "center",
      },
      {
        title: "Location",
        dataIndex: "Location",
        key: "Location",
        align: "center",
      },
      {
        title: "Membership Status",
        dataIndex: "subscriptionStatus",
        key: "subscriptionStatus",
        align: "center",
        render: (status) => (
          <span
            className={
              status?.toLowerCase() === "active"
                ? "text-green-600"
                : status?.toLowerCase() === "inactive"
                  ? "text-red-600"
                  : "text-yellow-500"
            }
          >
            {status}
          </span>
        ),
      },
      {
        title: "Payment Status",
        dataIndex: "PaymentStatus",
        key: "PaymentStatus",
        align: "center",
        render: (status) => (
          <span
            className={
              status?.toLowerCase() === "paid"
                ? "text-green-600"
                : status?.toLowerCase() === "expired"
                  ? "text-red-600"
                  : "text-yellow-500"
            }
          >
            {status}
          </span>
        ),
      },
      {
        title: "Revenue",
        dataIndex: "Revenue",
        key: "Revenue",
        align: "center",
        render: (revenue) => `${revenue || 0}`,
      },
    ];

    // Add Points columns based on filter
    if (
      selectedPointsFilter === "All" ||
      selectedPointsFilter === "Points Redeemed"
    ) {
      baseColumns.push({
        title: "Points Redeemed",
        dataIndex: "Points Redeemed",
        key: "Points Redeemed",
        align: "center",
      });
    }

    if (
      selectedPointsFilter === "All" ||
      selectedPointsFilter === "Points Accumulated"
    ) {
      baseColumns.push({
        title: "Points Accumulated",
        dataIndex: "Points Accumulated",
        key: "Points Accumulated",
        align: "center",
        render: (value) => `${parseFloat(value || 0).toFixed(2)}`,
      });
    }

    return baseColumns;
  }, [selectedPointsFilter]);

  // Handle export report
  const handleExportReport = async () => {
    try {
      const response = await exportReport(queryParams).unwrap();

      // Get the filename or use default
      let filename = "customer-report.xlsx";

      // Create blob and trigger download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export report. Please try again.");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Form layout="vertical">
        {/* From -> To Date Picker */}
        <div style={{ marginBottom: "0.5rem", width: "100%" }}>
          <Row gutter={[8, 8]} wrap>
            <Col flex="1 1 200px">
              <Form.Item label="Start Date" style={{ marginBottom: "0.5rem" }}>
                <DatePicker
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(date) => setFromDate(date)}
                  style={{ width: "100%" }}
                  placeholder="Start Date"
                  className="mli-tall-picker"
                />
              </Form.Item>
            </Col>

            <Col flex="1 1 200px">
              <Form.Item label="End Date" style={{ marginBottom: "0.5rem" }}>
                <DatePicker
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(date) => setToDate(date)}
                  style={{ width: "100%" }}
                  placeholder="End Date"
                  className="mli-tall-picker"
                />
              </Form.Item>
            </Col>

            <Col flex="1 1 200px">
              <Form.Item
                label={<span className="mli-custom-label">Customer Name</span>}
                style={{ marginBottom: "0.5rem" }}
              >
                <Select
                  className="mli-custom-select mli-tall-select"
                  showSearch
                  value={selectedCustomer}
                  style={{ width: "100%" }}
                  placeholder="Select a Customer"
                  optionFilterProp="children"
                  onChange={setSelectedCustomer}
                  filterOption={(input, option) => {
                    const label = String(option?.children ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {customerOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col flex="1 1 200px">
              <Form.Item label="City" style={{ marginBottom: "0.5rem" }}>
                <Select
                  showSearch
                  value={selectedLocation}
                  style={{ width: "100%" }}
                  placeholder="Select a city"
                  optionFilterProp="children"
                  onChange={setSelectedLocation}
                  className="mli-tall-select"
                  filterOption={(input, option) => {
                    const label = String(option?.children ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {dynamicLocationOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col flex="1 1 200px">
              <Form.Item
                label="Membership Status"
                style={{ marginBottom: "0.5rem" }}
              >
                <Select
                  value={selectedSubscription}
                  style={{ width: "100%" }}
                  onChange={setSelectedSubscription}
                  className="mli-tall-select"
                >
                  {subscriptionOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Bottom row: 4 items + buttons */}
          <Row gutter={[8, 8]} wrap style={{ marginTop: 8 }}>
            <Col flex="1 1 220px">
              <Form.Item
                label="Payment Status"
                style={{ marginBottom: "0.5rem" }}
              >
                <Select
                  value={selectedPayment}
                  style={{ width: "100%" }}
                  onChange={setSelectedPayment}
                  className="mli-tall-select"
                >
                  {paymentOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col flex="1 1 220px">
              <Form.Item
                label="Select Chart Type"
                style={{ marginBottom: "0.5rem" }}
              >
                <Select
                  value={chartType}
                  style={{ width: "100%" }}
                  onChange={setChartType}
                  className="mli-tall-select"
                >
                  <Option value="Bar">Bar Chart</Option>
                  <Option value="Line">Line Chart</Option>
                  <Option value="Area">Area Chart</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col flex="1 1 220px">
              <Form.Item
                label="Select Metrics"
                style={{ marginBottom: "0.5rem" }}
              >
                <Select
                  value={selectedMetric}
                  style={{ width: "100%" }}
                  onChange={setSelectedMetric}
                  className="mli-tall-select"
                >
                  <Option value="all">All Metrics</Option>
                  {metricOptions
                    .filter(
                      (option) =>
                        user?.role !== "VIEW_MERCHANT" || option !== "Revenue",
                    )
                    .map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col flex="1 1 220px">
              <Form.Item label="Actions" style={{ marginBottom: "0.5rem" }}>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFromDate(null);
                      setToDate(null);
                      setSelectedCategory("All Categories");
                      setSelectedRegion("All Regions");
                      setSelectedCustomer("All Customers");
                      setSelectedLocation("All Cities");
                      setSelectedSubscription("All Status");
                      setSelectedPayment("All Payments");
                      setSelectedMetric("all");
                      setSelectedPointsFilter("All");
                      setChartType("Bar");
                    }}
                    className="bg-red-500 !border-red-500 px-6 py-[19px] rounded-md text-white hover:!text-red-500 text-[14px] font-bold"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    className="bg-primary px-6 py-[19px] rounded-md text-white hover:text-secondary text-[14px] font-bold"
                    onClick={handleExportReport}
                    loading={isExporting}
                    disabled={user?.role === "VIEW_MERCHANT"}
                  >
                    Export Report
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>

      {/* Chart */}
      <div
        className="p-4 rounded-lg border"
        style={{ width: "100%", height: 400, marginTop: "40px" }}
      >
        {isLoading || isFetching ? (
          <div className="flex justify-center items-center w-full h-full">
            <Spin size="large" />
          </div>
        ) : (
          <ResponsiveContainer>
          {chartType === "Bar" ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
              barGap={13}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") &&
                user?.role !== "VIEW_MERCHANT" && (
                  <Bar
                    dataKey="Revenue"
                    fill="#7086FD"
                    shape={(props) => (
                      <Custom3DBarWithWatermark {...props} dataKey="Revenue" />
                    )}
                  />
                )}
              {(selectedMetric === "all" || selectedMetric === "Visits") && (
                <Bar
                  dataKey="Visits"
                  fill="#6FD195"
                  shape={(props) => (
                    <Custom3DBarWithWatermark {...props} dataKey="Visits" />
                  )}
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Redeemed") && (
                <Bar
                  dataKey="Points Redeemed"
                  fill="#FFAE4C"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="Points Redeemed"
                    />
                  )}
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Accumulated") && (
                <Bar
                  dataKey="Points Accumulated"
                  fill="#ae00ff"
                  shape={(props) => (
                    <Custom3DBarWithWatermark
                      {...props}
                      dataKey="Points Accumulated"
                    />
                  )}
                />
              )}
            </BarChart>
          ) : chartType === "Line" ? (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") &&
                user?.role !== "VIEW_MERCHANT" && (
                  <Line type="monotone" dataKey="Revenue" stroke="#7086FD" />
                )}
              {(selectedMetric === "all" || selectedMetric === "Visits") && (
                <Line type="monotone" dataKey="Visits" stroke="#6FD195" />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Redeemed") && (
                <Line
                  type="monotone"
                  dataKey="Points Redeemed"
                  stroke="#FFAE4C"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Accumulated") && (
                <Line
                  type="monotone"
                  dataKey="Points Accumulated"
                  stroke="#ae00ff"
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(selectedMetric === "all" || selectedMetric === "Revenue") &&
                user?.role !== "VIEW_MERCHANT" && (
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#7086FD"
                    fill="#7086FD"
                  />
                )}
              {(selectedMetric === "all" || selectedMetric === "Visits") && (
                <Area
                  type="monotone"
                  dataKey="Visits"
                  stroke="#6FD195"
                  fill="#6FD195"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Redeemed") && (
                <Area
                  type="monotone"
                  dataKey="Points Redeemed"
                  stroke="#FFAE4C"
                  fill="#FFAE4C"
                />
              )}
              {(selectedMetric === "all" ||
                selectedMetric === "Points Accumulated") && (
                <Area
                  type="monotone"
                  dataKey="Points Accumulated"
                  stroke="#ae00ff"
                  fill="#ae00ff"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      {/* Reusable CustomTable */}
      <div style={{ marginTop: "50px" }}>
        <h1 className="text-[22px] font-bold mb-2">Data Table</h1>
        <CustomTable
          data={filteredData}
          columns={columns}
          pagination={{
            pageSize: paginationInfo.pageSize,
            total: paginationInfo.total,
            current: paginationInfo.current,
          }}
          onPaginationChange={handlePaginationChange}
          rowKey={(record) => record.key}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </div>
    </div>
  );
}
