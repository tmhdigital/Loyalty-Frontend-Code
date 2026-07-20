import { useState, useEffect } from "react";
import { Button, Modal, Input, Tooltip, Table, message } from "antd";
import { useSearchParams } from "react-router-dom";
import MarchantIcon from "../../assets/image-fallback.jpg";
import { Rate } from "antd";
import CustomTable from "../common/CustomTable";
import DetailsModal from "./components/DetailsModal";
import {
  useGetCustomersQuery,
  useLazyExportCustomersQuery,
} from "../../redux/apiSlices/selleManagementSlice";
import { useUser } from "../../provider/User";

const CustomerManagement = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { user } = useUser();

  const [searchParams, setSearchParams] = useSearchParams();

  // Get search term from URL on mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get("searchTerm") || "";
    setSearchText(urlSearchTerm);
  }, []);

  // Fetch customers from API with search
  const {
    data: apiData,
    isLoading,
    isFetching,
  } = useGetCustomersQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    searchTerm: searchText,
  });

  // Export customers
  const [triggerExport, { isLoading: isExportLoading }] =
    useLazyExportCustomersQuery();

  const handleExportCustomers = async () => {
    try {
      const result = await triggerExport([]);

      if (result.data) {
        // Create a blob URL and trigger download
        const blob = result.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Generate filename with current date
        const dateStr = new Date().toISOString().split("T")[0];
        link.download = `customers-export-${dateStr}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Failed to export customers");
    }
  };

  // Update local data when API data changes
  useEffect(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      const formattedData = apiData.data.map((item, index) => ({
        id: index + 1,
        customerID: item._id || "-",
        name: item.name || "-",
        image: item.profile || MarchantIcon,
        customUserId: item.customUserId || "-",
        totalPointsEarned: (item.totalPointsEarned || 0).toFixed(2),
        email: item.email || "-",
        phone: item.phone || "-",
        location: item.country || "-",
        sales: (item.totalBilled || 0).toFixed(2),
        salesRep: item.salesRep || "-",
        status: item.status || "Completed",
        feedback: item.rating || 0,
        ratingComment: item.ratingComment || "",
        pointsRedeemed: (item.totalPointsRedeemed || 0).toFixed(2),
        remainingRedemptionPoints: (
          item.remainingRedemptionPoints || 0
        ).toFixed(2),
        totalTransactions: item.totalTransactions || 0,
        // totalPointsEarned: item.totalPointsEarned || 0,
        cardIds: item.cardIds || "-",
      }));
      setData(formattedData);

      // Update pagination info if available
      if (apiData.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: apiData.pagination.total,
        }));
      }
    }
  }, [apiData]);

  // Show view details modal
  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedRecord(null);
  };

  // Close feedback modal
  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalVisible(false);
    setSelectedRecord(null);
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Columns for loyalty points / orders
  const columns2 = [
    {
      title: "SL",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Reward",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Points Used",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  // Columns for feedback table
  const columnsFeedback = [
    { title: "Product Name", dataIndex: "product", key: "product" },
    { title: "Rating", dataIndex: "rating", key: "rating" },
    { title: "Feedback", dataIndex: "feedback", key: "feedback" },
    { title: "Date", dataIndex: "date", key: "date" },
  ];

  // Main table columns
  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Customer ID",
      dataIndex: "customUserId",
      key: "customUserId",
      align: "center",
    },
    { title: "Customer Name", dataIndex: "name", key: "name", align: "center" },
    // {
    //   title: "Business Name",
    //   dataIndex: "businessName",
    //   key: "businessName",
    //   align: "center",
    // },
    {
      title: "Points Redeemed",
      dataIndex: "pointsRedeemed",
      key: "pointsRedeemed",
      align: "center",
    },
    {
      title: "Rem. Redemption Points",
      dataIndex: "remainingRedemptionPoints",
      key: "remainingRedemptionPoints",
      align: "center",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Reward",
      dataIndex: "totalPointsEarned",
      key: "totalPointsEarned",
      align: "center",
    },
    {
      title: "Total Sales",
      dataIndex: "sales",
      key: "sales",
      align: "center",
      render: (sales) => {
        if (typeof sales === "number") {
          return `${sales.toFixed(2)}`;
        }
        return `${sales || 0}`;
      },
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Ratings",
      dataIndex: "feedback",
      key: "feedback",
      align: "center",
      render: (_, record) => {
        const rating = Number(record.feedback) || 0;

        return (
          <Tooltip title={rating.toFixed(1)}>
            <Rate
              allowHalf
              disabled
              value={rating}
              style={{ fontSize: 16, color: "#FFD700" }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        // <div className=" py-[12px] border border-primary rounded-md">
        <div className="flex- gap-2 ">
          <div className="">
          <Tooltip title="View Details">
            <button
              onClick={() => showViewModal(record)}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              View Details
            </button>
          </Tooltip>
        </div>
        </div>
      ),
    },
  ];

  // Filtered data based on backend results
  const filteredData = data;

  return (
    <div className="">
      <div className="flex justify-between flex-col md:flex-row md:items-end">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 ">
          <div>
            <h1 className="text-[24px] font-bold">Customer Management</h1>
            <p className="text-[16px] font-normal mt-2">
              Seamlessly manage customer profiles and interactions.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Search by Customer ID, Name or Location"
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              setPagination({ current: 1, pageSize: 10 });
              // Update URL with search term
              if (value.trim()) {
                setSearchParams({ searchTerm: value });
              } else {
                setSearchParams({});
              }
            }}
            className="w-96"
          />
          <Button
            className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
            onClick={handleExportCustomers}
            loading={isExportLoading}
            disabled={user?.role === "VIEW_MERCHANT"}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <CustomTable
          data={filteredData}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onPaginationChange={handleTableChange}
          rowKey="id"
        />
      </div>

      {/* View Details Modal */}
      <DetailsModal
        isVisible={isViewModalVisible}
        selectedRecord={selectedRecord}
        onClose={handleCloseViewModal}
        columns2={columns2}
        data={data}
      />

      {/* Feedback Modal */}
      <Modal
        visible={isFeedbackModalVisible}
        onCancel={handleCloseFeedbackModal}
        width={700}
        footer={[]}
      >
        {selectedRecord && (
          <div>
            <h2 className="text-[22px] font-bold text-primary mb-2">
              Feedback Details
            </h2>
            <p className="text-[16px] font-medium mb-4">
              Customer:{" "}
              <span className="font-semibold">{selectedRecord.name}</span>
            </p>

            <Table
              columns={columnsFeedback}
              dataSource={selectedRecord.feedback}
              rowKey="date"
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
