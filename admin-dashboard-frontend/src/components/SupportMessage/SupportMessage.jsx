import { useState } from "react";
import { Modal, Button, Tooltip } from "antd";
import CustomTable from "../common/CustomTable";
import { useGetContactMessagesQuery } from "../../redux/apiSlices/contactSlice";

export default function SupportMessage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const queryParams = [
    { name: "page", value: page },
    { name: "limit", value: limit },
  ];

  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetContactMessagesQuery(queryParams);

  const handleViewMessage = (record) => {
    setSelectedMessage(record);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: "SI",
      dataIndex: "si",
      key: "si",
      align: "center",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 200,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      align: "center",
      width: 200,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      align: "center",
      width: 300,
      render: (text) => (
        <div className="line-clamp-2" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => (
        // <Space>
        //   <Button
        //     type="primary"
        //     icon={<IoEyeSharp />}
        //     onClick={() => handleViewMessage(record)}
        //     className="bg-transparent border border-primary text-primary text-lg hover:bg-primary hover:text-white"
        //   ></Button>
        // </Space>
        <div className="">
          <Tooltip title="View Details">
            <button
              onClick={() => handleViewMessage(record)}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              View Details
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tableData = (response?.data || []).map((item, index) => ({
    key: item._id,
    si: index + 1 + (page - 1) * limit,
    name: item.name || "-",
    email: item.email || "-",
    subject: item.subject || "-",
    message: item.message || "-",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-",
    raw: item,
  }));

  const paginationData = {
    pageSize: limit,
    total: response?.pagination?.total || 0,
    current: page,
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-[24px] font-bold">Support Messages</h1>
        <p className="text-[16px] font-normal mt-2">
          View and manage contact messages from users
        </p>
      </div>

      <CustomTable
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={paginationData}
        onPaginationChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          if (nextPageSize !== limit) {
            setLimit(nextPageSize);
          }
        }}
        rowKey="key"
      />

      {/* View Message Modal */}
      <Modal
        title="Message Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedMessage(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewModalVisible(false);
              setSelectedMessage(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700">Name:</label>
              <p className="mt-1 text-gray-900">{selectedMessage.name}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Email:</label>
              <p className="mt-1 text-gray-900">{selectedMessage.email}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Subject:</label>
              <p className="mt-1 text-gray-900">{selectedMessage.subject}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Message:</label>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Date:</label>
              <p className="mt-1 text-gray-900">{selectedMessage.createdAt}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
