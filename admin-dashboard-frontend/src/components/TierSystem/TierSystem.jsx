import { useState, useEffect, useMemo } from "react";
import { Button, Pagination } from "antd";
import Swal from "sweetalert2";
import { Form } from "antd";
import EditTierModal from "./modal/EditTierModal.jsx";
import {
  useGetTierQuery,
  useAddTierMutation,
  useUpdateTierMutation,
  useDeleteTierMutation,
  useGetAllAuditLogQuery,
} from "../../redux/apiSlices/PointTierSlice";
import { toReadableTime } from "../common/TimeConversion.js";
import { useUser } from "../../provider/User.jsx";
import { Spin } from "antd";

export default function TierSystem() {
  const [form] = Form.useForm();
  const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [searchText] = useState("");
  const [page] = useState(1);
  const [limit] = useState(10);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogLimit, setAuditLogLimit] = useState(10);
  const { user } = useUser();

  // Fetch audit logs with pagination
  const auditLogQueryParams = [
    { name: "page", value: auditLogPage },
    { name: "limit", value: auditLogLimit },
  ];
  const {
    data: auditLogsResponse,
    isLoading: isLoadingLogs,
    refetch: refetchAuditLogs,
  } = useGetAllAuditLogQuery(auditLogQueryParams);

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
    error,
    refetch: refetchTiers,
  } = useGetTierQuery(queryParams);

  const [addTier, { isLoading: isAdding }] = useAddTierMutation();
  const [updateTier, { isLoading: isUpdating }] = useUpdateTierMutation();
  const [deleteTier] = useDeleteTierMutation();

  // Memoized tier data from API
  const tierData = useMemo(() => {
    const items = response?.data || [];
    return items.map((item, index) => ({
      key: item._id,
      id: index + 1 + (page - 1) * limit,
      _id: item._id,
      name: item.name,
      threshold: item.pointsThreshold,
      reward: item.reward,
      lockoutDuration: item.accumulationRule,
      pointsSystemLockoutDuration: item.redemptionRule,
      minSpend: item.minTotalSpend,
      isActive: item.isActive,
      admin: item.admin || "-",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      raw: item,
    }));
  }, [response, page, limit]);

  const [tiers, setTiers] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);

  // Update tiers when memoized data changes
  useEffect(() => {
    setTiers(tierData);
  }, [tierData]);

  // Open Set Rules/Edit Modal
  const showRulesModal = (tier) => {
    if (tier) {
      setEditingTier(tier);
      setIsAddMode(false);
      form.setFieldsValue(tier);
    } else {
      setEditingTier(null);
      setIsAddMode(true);
      form.resetFields();
    }
    setIsRulesModalVisible(true);
  };

  // Close Modal
  const handleCancelRules = () => {
    setIsRulesModalVisible(false);
    setEditingTier(null);
    setIsAddMode(false);
    form.resetFields();
  };

  // Save Tier (Add/Edit)
  const handleSaveRules = async (values) => {
    try {
      const payload = {
        name: values.name,
        pointsThreshold: Number(values.threshold) || 0,
        reward: String(values.reward || 0),
        accumulationRule: Number(values.lockoutDuration) || 0,
        redemptionRule: 0,
        minTotalSpend: Number(values.minSpend) || 0,
        isActive: true,
      };

      if (isAddMode) {
        await addTier(payload).unwrap();
        Swal.fire(
          "Added!",
          `The "${values.name}" tier has been created.`,
          "success",
        );
      } else {
        await updateTier({
          id: editingTier._id,
          body: payload,
        }).unwrap();
        Swal.fire(
          "Updated!",
          `The "${values.name}" tier has been updated.`,
          "success",
        );
      }
      handleCancelRules();
      // Refetch data to show updates without page refresh
      refetchTiers();
      refetchAuditLogs();
    } catch (error) {
      Swal.fire(
        "Error!",
        error?.data?.message || "Failed to save tier",
        "error",
      );
    }
  };

  // Remove Tier
  const handleRemove = (tierId) => {
    const tierToRemove = tiers.find((t) => t._id === tierId);
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to remove the "${tierToRemove?.name}" tier?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteTier(tierId).unwrap();
          Swal.fire(
            "Removed!",
            `The "${tierToRemove?.name}" tier has been removed.`,
            "success",
          );
          // Refetch data to show updates without page refresh
          refetchTiers();
          refetchAuditLogs();
        } catch (error) {
          Swal.fire(
            "Error!",
            error?.data?.message || "Failed to delete tier",
            "error",
          );
        }
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between flex-col md:flex-row md:items-end items-start gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold">Point & Tier System</h1>
          <p className="text-[16px] font-normal mt-2">
            Configure your tiers and point accumulation rules.
          </p>
        </div>
        <Button
          className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
          onClick={() => showRulesModal(null)}
          disabled={user?.role === "VIEW_ADMIN"}
        >
          Add New Tier
        </Button>
      </div>

      {/* Tier Cards */}
      <div className="px-8 py-8 flex flex-col gap-4 border border-gray-200 rounded-lg">
        {isLoading || isFetching ? (
          <div
            className="flex justify-center items-center"
            style={{ height: "20vh" }}
          >
            <Spin size="large" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">Failed to load tiers</p>
        ) : tiers.length === 0 ? (
          <p className="text-center text-gray-500">No tiers available</p>
        ) : (
          tiers.map((tier) => (
            <div
              key={tier._id}
              className="px-6 py-4 rounded-lg border border-primary bg-white"
            >
              <div className="flex justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-[24px] text-secondary">
                    {tier.name}
                  </h2>
                  <p>
                    <span className="font-semibold">Points Threshold:</span>{" "}
                    {tier.threshold}
                  </p>
                  <p>
                    <span className="font-semibold">Accumulation Rule:</span>{" "}
                    {tier.lockoutDuration}
                  </p>
                  {/* <p>
                    <span className="font-semibold">Minimum Spend:</span>{" "}
                    {tier.minSpend}
                  </p> */}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-primary px-6 py-3 rounded-full text-white hover:text-secondary text-[14px] font-bold"
                    onClick={() => showRulesModal(tier)}
                    disabled={user?.role === "VIEW_ADMIN"}
                  >
                    Set Rules
                  </Button>
                  <Button
                    className="bg-red-500 border-red-500 px-6 py-3 rounded-full text-white hover:text-secondary text-[14px] font-bold"
                    onClick={() => handleRemove(tier._id)}
                    disabled={user?.role === "VIEW_ADMIN"}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Change Log - Dynamic Data */}
      <div className="px-8 py-8">
        <div className="px-6 py-4 rounded-lg border border-primary bg-white flex flex-col gap-2 mt-2">
          <h2 className="font-bold text-[24px] text-secondary mb-2">
            Tier System Change Log
          </h2>

          {isLoadingLogs ? (
            <div
              className="flex justify-center items-center"
              style={{ height: "20vh" }}
            >
              <Spin size="large" />
            </div>
          ) : auditLogsResponse?.data?.data &&
            auditLogsResponse.data.data.length > 0 ? (
            <>
              {auditLogsResponse.data.data.map((log) => (
                <div
                  key={log._id}
                  className="py-2 border-b border-gray-100 last:border-b-0"
                >
                  <p className="text-gray-800">{log.details}</p>
                  <p className="text-sm text-gray-600">{log.email}</p>
                  <p className="text-sm text-gray-600">
                    {toReadableTime(log.createdAt)}
                  </p>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex justify-center mt-4">
                <Pagination
                  current={auditLogPage}
                  total={auditLogsResponse?.data?.meta?.total || 0}
                  pageSize={auditLogLimit}
                  onChange={(page, pageSize) => {
                    setAuditLogPage(page);
                    setAuditLogLimit(pageSize);
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500">No audit logs available</p>
          )}
        </div>
      </div>

      {/* Set Rules / Add Tier Modal */}
      <EditTierModal
        visible={isRulesModalVisible}
        isAddMode={isAddMode}
        editingTier={editingTier}
        form={form}
        isAdding={isAdding}
        isUpdating={isUpdating}
        onCancel={handleCancelRules}
        onSave={handleSaveRules}
      />
    </div>
  );
}
