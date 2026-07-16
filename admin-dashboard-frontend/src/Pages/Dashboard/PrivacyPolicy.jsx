import { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import { Button, message, Modal, Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { Spin } from "antd";
import {
  useGetMerchantPrivacyPolicyQuery,
  useGetCustomerPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "../../redux/apiSlices/privacyPolicySlice";
import { useUser } from "../../provider/User";

const PrivacyPolicy = () => {
  const editor = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();

  // Get active tab from URL or default to "customer"
  const activeTab = searchParams.get("tab") || "customer";

  // Fetch data for both merchant and customer
  const {
    data: merchantPrivacyData,
    isLoading: isLoadingMerchant,
    isError: isErrorMerchant,
  } = useGetMerchantPrivacyPolicyQuery();

  const {
    data: customerPrivacyData,
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
  } = useGetCustomerPrivacyPolicyQuery();

  const [updatePrivacyPolicy, { isLoading: isUpdating }] =
    useUpdatePrivacyPolicyMutation();

  // Initialize content state from API data or default
  const [merchantContent, setMerchantContent] = useState(
    merchantPrivacyData?.data?.content ||
      "<p>Your merchant privacy policy content goes here.</p>",
  );

  const [customerContent, setCustomerContent] = useState(
    customerPrivacyData?.data?.content ||
      "<p>Your customer privacy policy content goes here.</p>",
  );

  // Update state when API data loads
  useEffect(() => {
    if (merchantPrivacyData?.data?.content) {
      setMerchantContent(merchantPrivacyData.data.content);
    }
  }, [merchantPrivacyData?.data?.content]);

  useEffect(() => {
    if (customerPrivacyData?.data?.content) {
      setCustomerContent(customerPrivacyData.data.content);
    }
  }, [customerPrivacyData?.data?.content]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const type =
        activeTab === "merchant"
          ? "merchant-privacy-policy"
          : "customer-privacy-policy";
      const content =
        activeTab === "merchant" ? merchantContent : customerContent;

      // Send update request to API
      await updatePrivacyPolicy({
        type,
        content,
      }).unwrap();
      setIsModalOpen(false);
      message.success("Privacy Policy updated successfully!");
    } catch (error) {
      message.error("Failed to update Privacy Policy");
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
        <h2 className="text-xl font-bold">Privacy Policy</h2>
        <Button
          onClick={showModal}
          className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
          disabled={user?.role === "VIEW_ADMIN"}
        >
          Edit Privacy Policy
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="mb-6"
        items={[
          {
            key: "customer",
            label: "Customer Privacy Policy",
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
                  <div>Error loading customer privacy policy.</div>
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
            label: "Merchant Privacy Policy",
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
                  <div>Error loading merchant privacy policy.</div>
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
        } Privacy Policy`}
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
            {isUpdating ? "Updating..." : "Update Privacy Policy"}
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

export default PrivacyPolicy;
