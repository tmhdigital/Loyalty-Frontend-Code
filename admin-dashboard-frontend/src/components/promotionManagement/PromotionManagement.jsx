"use client";
import { useMemo, useState, useEffect } from "react";
import { Button, Switch, Tooltip, Modal, Tag } from "antd";
import { FaEdit } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import NotificationsModal from "../promotionManagement/components/NotificationsModal.jsx";
import DetailsModal from "../promotionManagement/components/DetailsModal.jsx";
import CustomTable from "../../components/common/CustomTable.jsx";
import { useSearchParams } from "react-router-dom";
import {
  useGetPromoDetailsQuery,
  useTogglePromoStatusMutation,
  useUpdatePromotionMutation,
  useCreatePromotionMutation,
  useDeletePromotionMutation,
} from "../../redux/apiSlices/promoSlice.js";
import { useUser } from "../../provider/User.jsx";
import NewCampaign from "./components/NewCampaign.jsx";

const CUSTOMER_SEGMENT_MAP = {
  vip_customer: "VIP Customers",
  new_customer: "New Customers",
  returning_customer: "Returning Customers",
  loyal_customer: "Loyal Customers",
  all_customer: "All Customers",
};

const PROMOTION_TYPE_MAP = {
  seasonal: "Seasonal",
  referral: "Referral",
  flash_sale: "Flash Sale",
  loyalty: "Loyalty",
};

const getCustomerSegmentLabel = (value) => {
  return CUSTOMER_SEGMENT_MAP[value] || value;
};

const getPromotionTypeLabel = (value) => {
  return PROMOTION_TYPE_MAP[value] || value;
};

const PromotionManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText] = useState("");
  const { user } = useUser();
  const [page, setPage] = useState(() => {
    const urlPage = searchParams.get("page");
    return urlPage ? parseInt(urlPage, 10) : 1;
  });
  const [limit, setLimit] = useState(() => {
    const urlLimit = searchParams.get("limit");
    return urlLimit ? parseInt(urlLimit, 10) : 10;
  });

  // Sync page and limit changes to URL
  useEffect(() => {
    setSearchParams({ page, limit });
  }, [page, limit, setSearchParams]);

  const queryParams = [
    { name: "page", value: page },
    { name: "limit", value: limit },
  ];
  if (searchText.trim()) {
    queryParams.push({ name: "searchTerm", value: searchText.trim() });
  }

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetPromoDetailsQuery(queryParams);

  const [togglePromoStatus] = useTogglePromoStatusMutation();
  const [updatePromotion] = useUpdatePromotionMutation();
  const [createPromotion] = useCreatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const tableData = useMemo(() => {
    const items = response?.data || [];
    return items.map((item, index) => ({
      key: item._id,
      id: index + 1 + (page - 1) * limit,
      promotionName: item.name,
      promotionType: item.promotionType,
      customerSegment: item.customerSegment,
      discountPercentage: item.discountPercentage,
      grossValue: item.grossValue || 0,
      startDate: item.startDate,
      endDate: item.endDate,
      selectedDays:
        item.availableDays && item.availableDays[0] === "all"
          ? ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
          : item.availableDays || item.promotionDays || [],
      status: item.status === "active" ? "Active" : "Inactive",
      raw: item,
    }));
  }, [response, page, limit]);

  const paginationData = {
    pageSize: limit,
    total: response?.pagination?.total || 0,
    current: page,
  };

  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
    }
  };

  const [isNewCampaignModalVisible, setIsNewCampaignModalVisible] =
    useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNotifyModalVisible, setIsNotifyModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleAddCampaign = async (newCampaign) => {
    try {
      const formData = new FormData();

      // Check if all days are selected
      const promotionDays = newCampaign.promotionDays || [];
      const isAllDays = promotionDays.length === 7;

      // Create the data object matching the required structure
      const dataObj = {
        name: newCampaign.promotionName,
        discountPercentage: Number(newCampaign.discountPercentage),
        grossValue: newCampaign.grossValue
          ? Number(newCampaign.grossValue)
          : null,
        promotionType: newCampaign.promotionType?.toLowerCase() || "seasonal",
        customerSegment:
          newCampaign.customerSegment?.toLowerCase().replace(/\s+/g, "_") ||
          "all_customer",
        startDate: newCampaign.startDate
          ? new Date(newCampaign.startDate).toISOString()
          : null,
        endDate: newCampaign.endDate
          ? new Date(
              new Date(newCampaign.endDate).setHours(23, 59, 59, 999),
            ).toISOString()
          : null,
        availableDays: isAllDays ? ["all"] : promotionDays,
      };

      // Append data as JSON string
      formData.append("data", JSON.stringify(dataObj));

      // Refetch data after successful creation
      await refetch();

      // Append image if exists
      if (newCampaign.imageFile) {
        formData.append("image", newCampaign.imageFile);
      }

      await createPromotion(formData).unwrap();

      setIsNewCampaignModalVisible(false);
      Swal.fire({
        icon: "success",
        title: "Campaign Added!",
        text: "Your new campaign has been added successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error?.data?.message || "Failed to create campaign.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleEditSave = async (updatedCampaign) => {
    try {
      const formData = new FormData();

      // Check if all days are selected
      const promotionDays = updatedCampaign.promotionDays || [];
      const isAllDays = promotionDays.length === 7;

      // Create the data object matching the required structure
      const dataObj = {
        name: updatedCampaign.promotionName,
        discountPercentage: Number(updatedCampaign.discountPercentage),
        grossValue: updatedCampaign.grossValue
          ? Number(updatedCampaign.grossValue)
          : null,
        promotionType:
          updatedCampaign.promotionType?.toLowerCase() || "seasonal",
        customerSegment:
          updatedCampaign.customerSegment?.toLowerCase().replace(/\s+/g, "_") ||
          "all_customer",
        startDate: updatedCampaign.startDate
          ? new Date(updatedCampaign.startDate).toISOString()
          : null,
        endDate: updatedCampaign.endDate
          ? new Date(
              new Date(updatedCampaign.endDate).setHours(23, 59, 59, 999),
            ).toISOString()
          : null,
        availableDays: isAllDays ? ["all"] : promotionDays,
      };

      // Append data as JSON string
      formData.append("data", JSON.stringify(dataObj));

      // Append image if exists
      if (updatedCampaign.imageFile) {
        formData.append("image", updatedCampaign.imageFile);
      }

      // Refetch data after successful update
      await refetch();

      await updatePromotion({
        id: editingCampaign.raw._id,
        formData,
      }).unwrap();

      setIsEditModalVisible(false);
      setEditingCampaign(null);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Your campaign has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error?.data?.message || "Failed to update campaign.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingCampaign(null);
  };

  const handleEditClick = (record) => {
    setEditingCampaign(record);
    setIsEditModalVisible(true);
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedRecord(null);
  };

  const handleDeleteClick = async (record) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${record.promotionName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deletePromotion(record.raw._id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Promotion has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error?.data?.message || "Failed to delete promotion.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const columns = [
    { title: "SL", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Promotion Name",
      dataIndex: "promotionName",
      key: "promotionName",
      align: "center",
    },
    {
      title: "Promotion Type",
      dataIndex: "promotionType",
      key: "promotionType",
      align: "center",
      render: (type) => <Tag color="blue">{getPromotionTypeLabel(type)}</Tag>,
    },
    {
      title: "Customer Segment",
      dataIndex: "customerSegment",
      key: "customerSegment",
      align: "center",
      render: (segment) => (
        <Tag color="purple">{getCustomerSegmentLabel(segment)}</Tag>
      ),
    },
    {
      title: "Discount Percentage",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      align: "center",
    },
    {
      title: "Date",
      key: "dateRange",
      align: "center",
      render: (_, record) => {
        const start = record.startDate
          ? new Date(record.startDate).toLocaleDateString()
          : "-";
        const end = record.endDate
          ? new Date(record.endDate).toLocaleDateString()
          : "-";
        return (
          <div className="flex flex-col items-start justify-center gap-1">
            <p>
              <span className="font-bold">Start Date: </span>
              <span className="border border-primary px-[5px] py-[1px] rounded-[4px]">
                {start}
              </span>
            </p>
            <p>
              <span className="font-bold">End Date: </span>
              <span className="border border-primary px-[5px] py-[1px] rounded-[4px]">
                {end}
              </span>
            </p>
          </div>
        );
      },
    },
    {
      title: "Days",
      dataIndex: "selectedDays",
      key: "selectedDays",
      align: "center",
      render: (days) => {
        // Check if days array contains "all" or has all 7 days
        const isAllDays = days && (days.includes("all") || days.length === 7);

        if (isAllDays) {
          return (
            <div className="flex justify-center">
              <span className="border border-primary px-3 py-1 rounded-[4px] text-xs font-semibold bg-primary/10">
                All Days
              </span>
            </div>
          );
        }

        return (
          <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
            {days && days.length > 0 ? (
              days.map((day, index) => (
                <span
                  key={index}
                  className="border border-primary px-2 py-0 rounded-[4px] text-xs"
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              ))
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <div className="py-[10px] px-[10px] border border-primary rounded-md">
          <div className="flex gap-2 justify-between items-center">
            <Tooltip title="View details">
              <button
                onClick={() => handleViewClick(record)}
                className="text-primary hover:text-green-700 text-xl mr-1"
              >
                <IoEyeSharp />
              </button>
            </Tooltip>
            <Tooltip title="Edit">
              <button
                onClick={() => handleEditClick(record)}
                className="text-primary hover:text-green-700 text-xl disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                disabled={
                  record.status === "Inactive" || user?.role === "VIEW_ADMIN"
                }
              >
                <FaEdit />
              </button>
            </Tooltip>
            <Tooltip title="Delete">
              <button
                onClick={() => handleDeleteClick(record)}
                className="text-red-500 hover:text-red-700 text-2xl disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                disabled={user?.role === "VIEW_ADMIN"}
              >
                <MdDelete />
              </button>
            </Tooltip>
            <Switch
              size="small"
              checked={record.status === "Active"}
              style={{
                backgroundColor:
                  record.status === "Active" ? "#3fae6a" : "gray",
              }}
              disabled={user?.role === "VIEW_ADMIN"}
              onChange={async (checked) => {
                const result = await Swal.fire({
                  title: "Are you sure?",
                  text: `You are about to change status to ${
                    checked ? "Active" : "Inactive"
                  }.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, change it!",
                });

                if (result.isConfirmed) {
                  try {
                    await togglePromoStatus(
                      record.raw._id,
                    ).unwrap();
                    Swal.fire({
                      title: "Updated!",
                      text: `Status has been changed to ${
                        checked ? "Active" : "Inactive"
                      }.`,
                      icon: "success",
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  } catch (error) {
                    Swal.fire({
                      title: "Error!",
                      text: error?.data?.message || "Failed to update status.",
                      icon: "error",
                      timer: 2000,
                      showConfirmButton: false,
                    });
                  }
                }
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-end flex-col md:flex-row gap-4 mb-4">
        <div>
          <h1 className="text-[24px] font-bold">Promotions List</h1>
          <p className="text-[16px] font-normal mt-2">
            View and manage all your active campaigns in one place.
          </p>
        </div>
        <div className="flex gap-4 flex-col md:flex-row">
          {/* <Button
            className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
            onClick={() => setIsNotifyModalVisible(true)}
          >
            Notification Management
          </Button> */}
          <Button
            className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
            onClick={() => setIsNewCampaignModalVisible(true)}
            disabled={user?.role === "VIEW_ADMIN"}
          >
            New Promotion
          </Button>
        </div>
      </div>

      <CustomTable
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={paginationData}
        onPaginationChange={handlePaginationChange}
        rowKey="key"
      />

      {/* Edit Campaign Modal */}
      <Modal
        title="Edit Campaign"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={1000}
        closable={true}
      >
        {editingCampaign && (
          <NewCampaign
            onSave={handleEditSave}
            onCancel={handleEditCancel}
            editData={editingCampaign}
            isEdit={true}
          />
        )}
      </Modal>

      {/* New Campaign Modal */}
      <Modal
        title="New Campaign"
        visible={isNewCampaignModalVisible}
        onCancel={() => setIsNewCampaignModalVisible(false)}
        footer={null}
        width={1000}
        closable={true}
      >
        <NewCampaign
          onSave={handleAddCampaign}
          onCancel={() => setIsNewCampaignModalVisible(false)}
        />
      </Modal>

      {/* Notification Modal */}
      <NotificationsModal
        visible={isNotifyModalVisible}
        onCancel={() => setIsNotifyModalVisible(false)}
      />

      {/* Details Modal */}
      <DetailsModal
        visible={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        record={selectedRecord}
      />
    </div>
  );
};

export default PromotionManagement;
