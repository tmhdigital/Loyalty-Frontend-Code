import { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import { Button, message, Modal, Spin } from "antd";
import DOMPurify from "dompurify";
import {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "../../redux/apiSlices/termsAndConditionSlice";

const TermsAndConditions = () => {
  const editor = useRef(null);

  const {
    data: termsData,
    isLoading: _isLoading,
    isError: _isError,
  } = useGetTermsAndConditionsQuery();

  const [updateTermsAndConditions, { isLoading: isUpdating }] =
    useUpdateTermsAndConditionsMutation();

  // Initialize content state from API data or default
  const [termsContent, setTermsContent] = useState(
    termsData?.data?.content ||
      "<p>Your terms and conditions content goes here.</p>",
  );

  // Update state when API data loads
  useEffect(() => {
    if (termsData?.data?.content) {
      setTermsContent(termsData.data.content);
    }
  }, [termsData?.data?.content]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = async () => {
    try {
      await updateTermsAndConditions({ content: termsContent }).unwrap();
      setIsModalOpen(false);
      message.success("Terms & Conditions updated successfully!");
    } catch (error) {
      message.error("Failed to update Terms & Conditions");
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="">
      <div className="flex justify-start items-end mb-6">
        <h2 className="text-xl font-bold">Terms & Conditions</h2>
      </div>

      <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
        {_isLoading ? (
          <div className="flex justify-center items-center" style={{ height: "20vh" }}>
            <Spin size="large" />
          </div>
        ) : _isError ? (
          <div>Error loading Terms & Conditions.</div>
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(termsContent || ""),
            }}
          />
        )}
      </div>

      <Modal
        title="Update Terms & Conditions"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="65%"
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="bg-red-500 text-white mr-2 py-5"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleOk}
            disabled={isUpdating}
            className="bg-secondary text-white"
          >
            {isUpdating ? "Updating..." : "Update Terms & Conditions"}
          </Button>,
        ]}
      >
        {isModalOpen && (
          <div className="mb-6">
            <JoditEditor
              ref={editor}
              value={termsContent}
              onChange={(newContent) => {
                setTermsContent(newContent);
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TermsAndConditions;
