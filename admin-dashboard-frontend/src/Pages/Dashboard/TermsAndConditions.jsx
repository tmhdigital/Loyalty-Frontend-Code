import { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import { Button, message, Modal, Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { Spin } from "antd";

import {
  useGetMerchantTermsAndConditionsQuery,
  useGetCustomerTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "../../redux/apiSlices/termsAndConditionSlice";
import { useUser } from "../../provider/User";

const TermsAndConditions = () => {
  const editor = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();

  // Get active tab from URL or default to "customer"
  const activeTab = searchParams.get("tab") || "customer";

  // Fetch data for both merchant and customer
  const {
    data: merchantTermsData,
    isLoading: isLoadingMerchant,
    isError: isErrorMerchant,
  } = useGetMerchantTermsAndConditionsQuery();

  const {
    data: customerTermsData,
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
  } = useGetCustomerTermsAndConditionsQuery();

  const [updateTermsAndConditions, { isLoading: isUpdating }] =
    useUpdateTermsAndConditionsMutation();

  // Initialize content state from API data or default
  const [merchantContent, setMerchantContent] = useState(
    merchantTermsData?.data?.content ||
      "<p>Your merchant terms and conditions content goes here.</p>",
  );

  const [customerContent, setCustomerContent] = useState(
    customerTermsData?.data?.content ||
      "<p>Your customer terms and conditions content goes here.</p>",
  );

  // Update state when API data loads
  useEffect(() => {
    if (merchantTermsData?.data?.content) {
      setMerchantContent(merchantTermsData.data.content);
    }
  }, [merchantTermsData?.data?.content]);

  useEffect(() => {
    if (customerTermsData?.data?.content) {
      setCustomerContent(customerTermsData.data.content);
    }
  }, [customerTermsData?.data?.content]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const type =
        activeTab === "merchant"
          ? "merchant-terms-and-conditions"
          : "customer-terms-and-conditions";
      const content =
        activeTab === "merchant" ? merchantContent : customerContent;

      // Send update request to API
      await updateTermsAndConditions({
        type,
        content,
      }).unwrap();
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

  const handleTabChange = (key) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", key);
      return newParams;
    });
  };

  const currentContent =
    activeTab === "merchant" ? merchantContent : customerContent;

  return (
    <div className="">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold">Terms & Conditions</h2>
        <Button
          onClick={showModal}
          className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary hover:bg-primary text-[17px] font-bold"
          disabled={user?.role === "VIEW_ADMIN"}
        >
          Edit Terms & Conditions
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="mb-6"
        items={[
          {
            key: "customer",
            label: "Customer Terms & Conditions",
            children: (
              <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
                {isLoadingCustomer ? (
                  <div
                    className="flex justify-center items-center"
                    style={{ height: "20vh" }}
                  >
                    <Spin size="large" />
                  </div>
                ) : isErrorCustomer ? (
                  <div>Error loading customer terms and conditions.</div>
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(customerContent || ""),
                    }}
                  />
                )}
              </div>
            ),
          },
          {
            key: "merchant",
            label: "Merchant Terms & Conditions",
            children: (
              <div className="saved-content mt-6 border p-6 rounded-lg bg-white">
                {isLoadingMerchant ? (
                  <div
                    className="flex justify-center items-center"
                    style={{ height: "20vh" }}
                  >
                    <Spin size="large" />
                  </div>
                ) : isErrorMerchant ? (
                  <div>Error loading merchant terms and conditions.</div>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: merchantContent }}
                    className="prose max-w-none"
                  />
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={`Update ${
          activeTab === "merchant" ? "Merchant" : "Customer"
        } Terms & Conditions`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="65%"
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="bg-red-500 text-white mr-2 h-10"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleOk}
            disabled={isUpdating}
            className="bg-primary h-10 text-white"
          >
            {isUpdating ? "Updating..." : "Update Terms & Conditions"}
          </Button>,
        ]}
      >
        {isModalOpen && (
          <div className="mb-6">
            <JoditEditor
              ref={editor}
              value={currentContent}
              onChange={(newContent) => {
                if (activeTab === "merchant") {
                  setMerchantContent(newContent);
                } else {
                  setCustomerContent(newContent);
                }
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TermsAndConditions;
