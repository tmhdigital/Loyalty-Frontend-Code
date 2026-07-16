import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  Input,
  Button,
  message,
  Tag,
} from "antd";
import NewSell from "./components/NewSell";
import CustomTable from "../common/CustomTable";
import { useGetTodaysSellsQuery } from "../../redux/apiSlices/selleManagementSlice";
import { useUser } from "../../provider/User";

const { Option } = Select;

const SellManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState([]);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isNewSellPage, setIsNewSellPage] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const isInitialMount = React.useRef(true);

  const { user } = useUser();

  const [searchInput, setSearchInput] = useState(searchText);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(searchInput);
      setPagination((prev) => ({ ...prev, current: 1 }));

      updateURL({ searchTerm: searchInput, page: 1 });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (isInitialMount.current) {
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 10;
      const term = searchParams.get("searchTerm") || "";
      const monthParam = searchParams.get("month") || "";
      const view = searchParams.get("view") || "";

      setPagination({ current: page, pageSize: limit });
      setSearchText(term);
      setSelectedMonth(monthParam);
      setIsNewSellPage(view === "newsell");

      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", pagination.current);
      newParams.set("limit", pagination.pageSize);
      setSearchParams(newParams);
    }
  }, [pagination.current, pagination.pageSize]);

  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetTodaysSellsQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    month: selectedMonth,
    searchTerm: searchText,
  });

  // ✅ FIXED: stable data handling (no conditional length check)
  useEffect(() => {
    const list = Array.isArray(apiData?.data) ? apiData.data : [];

    const formattedData = list.map((item, index) => ({
      id: `${item._id}-${index}`,
      customerName: item.name || "-",
      email: item.email || "-",
      phone: item.phone || "-",
      totalTransactions: (item.totalTransactions || 0).toFixed(2),
      totalAmount: (item.totalBilled || 0).toFixed(2),
      pointEarned: (item.totalPointsEarned || 0).toFixed(2),
      pointRedeem: (item.totalPointsRedeemed || 0).toFixed(2),
      finalAmount: (item.finalBilled || 0).toFixed(2),
      cardIds: item.cardIds || "-",
      transactionStatus: item.status || "Pending",
      date: item.date,
    }));

    setData(formattedData);
  }, [apiData]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month || "");
    setPagination({ current: 1, pageSize: pagination.pageSize });

    updateURL({ month: month || "", page: 1 });
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };

  const handleNewSellSubmit = async () => {
    setEditingRow(null);

    setPagination({ current: 1, pageSize: 10 });

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("view");
    newParams.delete("page");
    newParams.delete("limit");
    setSearchParams(newParams);

    setIsNewSellPage(false);

    try {
      // ✅ Just refetch safely (RTK Query handles cache automatically)
      await refetch();

      // message.success("Transaction completed and data refreshed!");
    } catch (error) {
      console.error("Refetch error:", error);
      message.error("Failed to refresh data");
    }
  };

  const handleBackFromNewSell = () => {
    setIsNewSellPage(false);
    setEditingRow(null);
    updateURL({ view: "" });

    refetch();
  };

  const handleTableChange = (pageNumber, pageSize) => {
    setPagination({
      current: pageNumber || 1,
      pageSize: pageSize || 10,
    });
  };

  const columns = [
    {
      title: "SL",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Card IDs",
      dataIndex: "cardIds",
      key: "cardIds",
      align: "center",
    },
    {
      title: "Total Transactions",
      dataIndex: "totalTransactions",
      key: "totalTransactions",
      align: "center",
    },
    {
      title: "Total Billed",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "center",
    },
    {
      title: "Final Billed",
      dataIndex: "finalAmount",
      key: "finalAmount",
      align: "center",
    },
    {
      title: "Points Earned",
      dataIndex: "pointEarned",
      key: "pointEarned",
      align: "center",
    },
    {
      title: "Points Redeemed",
      dataIndex: "pointRedeem",
      key: "pointRedeem",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "transactionStatus",
      key: "transactionStatus",
      align: "center",
      render: (status) => {
        const statusColors = {
          completed: "green",
          pending: "orange",
          failed: "red",
          rejected: "red",
        };
        return (
          <Tag
            className="px-5 py-1 text-green-800"
            color={statusColors[status?.toLowerCase()] || "default"}
          >
            {status?.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  if (isNewSellPage) {
    return (
      <NewSell
        onBack={handleBackFromNewSell}
        onSubmit={handleNewSellSubmit}
        editingRow={editingRow}
        refetch={refetch}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[24px] font-bold">Today’s Sell</h1>
      </div>

      <div className="flex flex-row items-start justify-between gap-4 mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search by Customer Name or Card ID"
            value={searchInput}
            onChange={handleSearchChange}
            onClear={() => {
              setSearchText("");
              setPagination({ current: 1, pageSize: pagination.pageSize });

              const newParams = new URLSearchParams(searchParams);
              newParams.delete("searchTerm");
              newParams.set("page", 1);
              setSearchParams(newParams);
            }}
            style={{ width: 300, height: 40 }}
            allowClear
          />

          <Select
            placeholder="Filter by Month"
            style={{ width: 200, height: 40 }}
            onChange={handleMonthChange}
            value={selectedMonth || undefined}
            allowClear
          >
            <Option value="">All Months</Option>
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={String(i + 1)}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </Option>
            ))}
          </Select>
        </div>

        <Button
          onClick={() => {
            setIsNewSellPage(true);
            updateURL({ view: "newsell" });
          }}
          className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
          disabled={user?.role === "VIEW_MERCHANT"}
        >
          Create New Sell
        </Button>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: apiData?.pagination?.total || 0,
          }}
          onPaginationChange={handleTableChange}
          rowKey={(record) => record.id}
        />
      </div>
    </div>
  );
};

export default SellManagement;
