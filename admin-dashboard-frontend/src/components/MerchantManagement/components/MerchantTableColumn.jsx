import { Rate, Switch, Tooltip } from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import ReusableTable from "../../common/CustomTable";
import { useUser } from "../../../provider/User";

const MerchantTableColumn = ({
  data,
  isLoading,
  isFetching,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onApprove,
  onReject,
}) => {
  const { user } = useUser();
  const columnsWithActions = [
    { title: "SL", dataIndex: "sl", key: "sl", align: "center" },
    {
      title: "Merchant ID",
      dataIndex: "merchantCardId",
      key: "merchantCardId",
      align: "center",
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      align: "center",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
    },
    {
      title: "Sales Rep",
      dataIndex: "salesRep",
      key: "salesRep",
      align: "center",
    },
    {
      title: "Total Sales",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "center",
    },
    {
      title: "Total Visits",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "center",
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Ratings",
      dataIndex: "ratings",
      key: "ratings",
      align: "center",
      render: (_, record) => {
        const rating = Number(record.ratings) || 0;

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
      render: (_, record) => {
        // If merchant is pending show Add and Reject actions
        if (record.approveStatus === "pending") {
          return (
            <div className="flex gap-2 justify-center items-center py-[7px] px-[15px]">
              <button
                onClick={() => onApprove(record.recordId || record.id)}
                className="bg-primary text-white px-3 py-1 rounded-md hover:opacity-90"
                disabled={user?.role === "VIEW_MERCHANT"}
              >
                Add
              </button>

              <button
                onClick={() => onReject(record.recordId || record.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:opacity-90"
                disabled={user?.role === "VIEW_ADMIN"}
              >
                Reject
              </button>
            </div>
          );
        }

        // if approval is rejected show Rejected text
        if (record.approveStatus === "rejected") {
          return <span className="text-red-500 font-semibold">Rejected</span>;
        }

        // Otherwise show the regular action set
        return (
          <div
            className="flex gap-2 justify-between items-center py-[7px] px-[15px] border border-primary rounded-md"
            style={{ alignItems: "center" }}
          >
            <Tooltip title="View Details">
              <button
                onClick={() => onView(record)}
                className="text-primary hover:text-green-700 text-xl"
              >
                <IoEyeSharp />
              </button>
            </Tooltip>

            <Tooltip
              title={
                record.status === "Inactive"
                  ? "Cannot edit inactive merchant"
                  : "Edit"
              }
            >
              <button
                onClick={() => onEdit(record)}
                disabled={
                  record.status === "Inactive" || user?.role === "VIEW_ADMIN"
                }
                className={`text-xl ${
                  record.status === "Inactive"
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary hover:text-green-700"
                }`}
              >
                <FaEdit />
              </button>
            </Tooltip>

            <Tooltip title="Delete">
              <button
                onClick={() => onDelete(record.recordId || record.id)}
                className="text-red-500 hover:text-red-700 text-[17px] disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                disabled={user?.role === "VIEW_ADMIN"}
              >
                <FaTrash />
              </button>
            </Tooltip>

            <Switch
              size="small"
              checked={record.status === "Active"}
              disabled={user?.role === "VIEW_ADMIN"}
              style={{
                backgroundColor:
                  record.status === "Active" ? "#3fae6a" : "gray",
              }}
              onChange={(checked) => {
                Swal.fire({
                  title: "Are you sure?",
                  text: `You are about to change status to ${
                    checked ? "Active" : "Inactive"
                  }.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, change it!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    onStatusChange(
                      record.recordId || record.id,
                      checked ? "Active" : "Inactive",
                    );
                  }
                });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <ReusableTable
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      columns={columnsWithActions}
      rowKey="id"
    />
  );
};

export default MerchantTableColumn;
