import { Tooltip, Switch } from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import CustomTable from "../../common/CustomTable";

const UserTableColumn = ({
  data,
  isLoading,
  isFetching,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting = false,
  isUpdatingStatus = false,
}) => {
  const columns = [
    { title: "SL", dataIndex: "si", key: "si", align: "center" },
    {
      title: "User Name",
      dataIndex: "firstName",
      key: "firstName",
      align: "center",
    },
    { title: "Email", dataIndex: "email", key: "email", align: "center" },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    { title: "Role", dataIndex: "role", key: "role", align: "center" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
    },
    { title: "Status", dataIndex: "status", key: "status", align: "center" },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div
          className="flex gap-4 justify-between align-middle py-[7px] px-[15px] border border-primary rounded-md"
          style={{ alignItems: "center" }}
        >
          <Tooltip title="View & Update Details">
            <button
              onClick={() => onEdit(record)}
              className="text-primary hover:text-green-700 text-xl"
            >
              <FaEdit />
            </button>
          </Tooltip>

          <Tooltip title="Delete">
            <button
              disabled={isDeleting}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, delete it!",
                }).then((result) => {
                  if (result.isConfirmed) {
                    onDelete(record.recordId);
                    Swal.fire({
                      title: "Deleted!",
                      text: "Your record has been deleted.",
                      icon: "success",
                    });
                  }
                });
              }}
              className="text-red-500 hover:text-red-700 text-lg"
            >
              <FaTrash />
            </button>
          </Tooltip>

          <Tooltip
            title={record.status === "Active" ? "Deactivate" : "Activate"}
          >
            <Switch
              size="small"
              disabled={isUpdatingStatus}
              checked={record.status === "Active"}
              style={{
              backgroundColor: record.status === "Active" ? "#3fae6a" : "gray",
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
                    record.recordId,
                    checked ? "Active" : "Inactive"
                  );
                }
              });
            }}
          />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowKey="id"
    />
  );
};

export default UserTableColumn;
