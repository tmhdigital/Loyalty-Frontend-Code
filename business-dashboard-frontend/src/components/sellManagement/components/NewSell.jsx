import React from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Space,
  message,
  Modal,
} from "antd";
import { IoArrowBack } from "react-icons/io5";
import dayjs from "dayjs";
import {
  useLazyFindDigitalCardQuery,
  useRequestPromotionApprovalMutation,
  useCheckoutTransactionMutation,
} from "../../../redux/apiSlices/selleManagementSlice";

const NewSell = ({ onBack, onSubmit, editingRow }) => {
  const [form] = Form.useForm();
  const [cardCode, setCardCode] = React.useState("");
  const [selectedPromotions, setSelectedPromotions] = React.useState([]);
  const [digitalCardData, setDigitalCardData] = React.useState(null);
  const [approvalResponse, setApprovalResponse] = React.useState(null);
  const [isScanModalVisible, setIsScanModalVisible] = React.useState(false);
  const [scannedCode, setScannedCode] = React.useState("");
  const scanInputRef = React.useRef(null);
  const scanBufferRef = React.useRef("");
  const scanTimeoutRef = React.useRef(null);

  const selectedGrossValue = React.useMemo(() => {
    if (
      !digitalCardData?.promotions?.length ||
      selectedPromotions.length === 0
    ) {
      return 0;
    }

    return selectedPromotions.reduce((total, promotionId) => {
      const promotion = digitalCardData.promotions.find(
        (item) => item._id === promotionId,
      );
      const grossValue = parseFloat(promotion?.grossValue) || 0;
      return total + grossValue;
    }, 0);
  }, [digitalCardData, selectedPromotions]);

  const [findDigitalCard, { isLoading }] = useLazyFindDigitalCardQuery();
  const [requestPromotionApproval, { isLoading: isApproving }] =
    useRequestPromotionApprovalMutation();
  const [checkoutTransaction, { isLoading: isCheckingOut }] =
    useCheckoutTransactionMutation();

  const toggleSelectPromotion = (promotionId) => {
    setSelectedPromotions((prev) =>
      prev.includes(promotionId)
        ? prev.filter((id) => id !== promotionId)
        : [...prev, promotionId],
    );
  };

  const handleFindCard = async () => {
    if (!cardCode.trim()) {
      message.error("Please enter a card code");
      return;
    }
    try {
      const result = await findDigitalCard(cardCode).unwrap();
      if (result?.success && result?.data?.digitalCard) {
        setDigitalCardData(result.data.digitalCard);
        form.setFieldsValue({
          pointEarned: parseFloat(
            result.data.digitalCard.availablePoints || 0,
          ).toFixed(2),
        });
        message.success("Card found successfully");
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to find card");
      setDigitalCardData(null);
    }
  };

  const handleApplyGiftCard = async () => {
    if (!cardCode.trim()) {
      message.error("Please enter a card code first");
      return;
    }

    const totalBill = form.getFieldValue("totalAmount");
    const pointRedeemed = form.getFieldValue("pointRedeemed");

    if (!totalBill) {
      message.error("Please enter total bill amount");
      return;
    }

    try {
      const requestBody = {
        digitalCardCode: cardCode,
        promotionId: selectedPromotions,
        totalBill: parseFloat(totalBill),
        pointRedeemed: parseFloat(pointRedeemed) || 0,
      };

      const result = await requestPromotionApproval(requestBody).unwrap();
      if (result?.success) {
        setApprovalResponse(result.data);
        message.success("Gift card applied successfully");
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to apply gift card");
    }
  };

  // Barcode scan modal open handler
  const handleScanNow = () => {
    setIsScanModalVisible(true);
    setScannedCode("");
    scanBufferRef.current = "";
  };

  // Handle barcode scan input with better detection
  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    setScannedCode(value);
  };

  // Handle keypress for barcode scanner
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = scannedCode.trim();
      if (code) {
        handleScanComplete(code);
      }
    }
  };

  // Alternative: Listen for rapid keyboard input (barcode scanner pattern)
  React.useEffect(() => {
    if (!isScanModalVisible) return;

    const handleKeyDown = (e) => {
      // Ignore special keys
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt") {
        return;
      }

      // Clear previous timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // If Enter key, process the buffer
      if (e.key === "Enter") {
        e.preventDefault();
        const code = scanBufferRef.current.trim();
        if (code) {
          setScannedCode(code);
          handleScanComplete(code);
        }
        scanBufferRef.current = "";
        return;
      }

      // Add character to buffer
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
      }

      // Set timeout to clear buffer (barcode scanners type very fast)
      scanTimeoutRef.current = setTimeout(() => {
        scanBufferRef.current = "";
      }, 100);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isScanModalVisible]);

  // Process scanned barcode
  const handleScanComplete = async (code) => {
    if (!code) {
      message.error("No barcode detected");
      return;
    }

    // Set the card code and close modal
    setCardCode(code);
    setIsScanModalVisible(false);
    message.success("Barcode scanned successfully");

    // Automatically search for the card
    try {
      const result = await findDigitalCard(code).unwrap();
      if (result?.success && result?.data?.digitalCard) {
        setDigitalCardData(result.data.digitalCard);
        form.setFieldsValue({
          pointEarned: parseFloat(
            result.data.digitalCard.availablePoints || 0,
          ).toFixed(2),
        });
        message.success("Card found successfully");
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to find card");
      setDigitalCardData(null);
    }
  };

  // Manual scan complete (for testing or manual entry)
  const handleManualScanComplete = () => {
    if (scannedCode.trim()) {
      handleScanComplete(scannedCode.trim());
    }
  };

  // Cancel scan modal
  const handleCancelScan = () => {
    setIsScanModalVisible(false);
    setScannedCode("");
    scanBufferRef.current = "";
  };

  // Keep focus on scan input
  React.useEffect(() => {
    if (isScanModalVisible && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [isScanModalVisible]);

  React.useEffect(() => {
    if (editingRow) {
      form.setFieldsValue(editingRow);
      setCardCode(editingRow.cardIds || "");
      setDigitalCardData({
        availablePoints: editingRow.pointEarned || 0,
      });
    }
  }, [editingRow, form]);

  React.useEffect(() => {
    return () => {
      form.resetFields();
      setCardCode("");
      setSelectedPromotions([]);
      setDigitalCardData(null);
      setApprovalResponse(null);
    };
  }, []);

  React.useEffect(() => {
    form.setFieldsValue({
      discountedBill: selectedGrossValue.toFixed(2),
    });
  }, [form, selectedGrossValue]);

  const handleSubmit = async (_values) => {
    // Validate approval response exists before checkout
    if (!approvalResponse) {
      message.error("Please apply gift card first");
      return;
    }

    try {
      const checkoutBody = {
        digitalCardCode: approvalResponse.digitalCardCode,
        totalBill: approvalResponse.totalBill,
        promotionId: selectedPromotions,
        pointRedeemed: parseFloat(form.getFieldValue("pointRedeemed")) || 0,
      };

      const result = await checkoutTransaction(checkoutBody).unwrap();
      if (result?.success) {
        message.success("Transaction completed successfully!");
        // Reset form and states
        form.resetFields();
        setCardCode("");
        setSelectedPromotions([]);
        setDigitalCardData(null);
        setApprovalResponse(null);

        // Call parent callback - let parent handle refetch and cache clearing
        if (onSubmit) {
          await onSubmit(result.data);
        }
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to complete transaction");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex gap-4 items-center mb-3">
        <Button
          icon={<IoArrowBack />}
          onClick={onBack}
          className="mb-3"
        ></Button>
        <h1 className="text-[24px] font-bold mb-4">New Sell</h1>
      </div>

      {/* Barcode Scan Modal */}
      <Modal
        title="Scan Barcode"
        open={isScanModalVisible}
        onOk={handleManualScanComplete}
        onCancel={handleCancelScan}
        okText="Done"
        cancelText="Cancel"
        centered
      >
        <div className="flex flex-col items-center py-8">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-lg font-semibold mb-4">Ready to scan barcode...</p>
          <p className="text-gray-500 mb-6 text-center">
            Please scan the barcode using your barcode scanner
          </p>

          {/* Input field for barcode scanner */}
          <input
            ref={scanInputRef}
            type="text"
            value={scannedCode}
            onChange={handleBarcodeInput}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 border-2 border-primary rounded-lg text-center text-lg font-mono"
            placeholder="Waiting for barcode scan..."
            autoFocus
            autoComplete="off"
          />

          {scannedCode && (
            <div className="mt-4 text-green-600 font-semibold">
              Scanned: {scannedCode}
            </div>
          )}
        </div>
      </Modal>

      <Form layout="vertical" onFinish={handleSubmit} form={form}>
        <div className="flex justify-between gap-10">
          <div className="w-full border rounded-lg">
            <h1 className="text-[24px] font-bold text-primary bg-white px-6 py-2">
              New Transaction
            </h1>
            <div className="bg-[#D7F4DE] px-6 py-2 flex flex-col gap-4">
              <Form.Item
                label="Find Customer by Card ID"
                name="customerId"
                className="mb-3"
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    style={{ width: "70%" }}
                    className="mli-tall-input"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value)}
                    onPressEnter={handleFindCard}
                    placeholder="Enter card code or scan now"
                  />
                  <Button
                    style={{ width: "30%" }}
                    className="h-10 bg-primary text-white font-semibold text-[18px]"
                    onClick={handleFindCard}
                    loading={isLoading}
                  >
                    Find
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item
                label="Available Point"
                name="pointEarned"
                className="mb-3"
              >
                <Input
                  className="mli-tall-input"
                  placeholder="Available points will be shown here after finding the card"
                  disabled
                  style={{ backgroundColor: "#f1f1f1" }}
                  type="number"
                  step="0.01"
                />
              </Form.Item>
              <Form.Item
                label="Total Bill Amount (Excluding Promos)"
                name="totalAmount"
                className="mb-3"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const numValue = parseFloat(value);
                      if (isNaN(numValue)) {
                        return Promise.reject(
                          new Error("Please enter a valid number"),
                        );
                      }
                      if (numValue < 0) {
                        return Promise.reject(
                          new Error("Amount cannot be negative"),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  className="mli-tall-input"
                  type="number"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  placeholder="Enter total bill amount before applying promotions"
                />
              </Form.Item>

              <Form.Item
                label="Point Redeemed"
                name="pointRedeemed"
                className="mb-3"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value && value !== 0) return Promise.resolve();

                      const availablePoints =
                        parseInt(form.getFieldValue("pointEarned")) || 0;

                      // Allow decimals up to 2 places
                      if (!/^\d+(\.\d{1,2})?$/.test(value)) {
                        return Promise.reject(
                          new Error(
                            "Only numbers up to 2 decimal places are allowed",
                          ),
                        );
                      }

                      const numValue = parseFloat(value);

                      if (numValue > availablePoints) {
                        return Promise.reject(
                          new Error(
                            `Cannot exceed available points (${availablePoints})`,
                          ),
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  className="mli-tall-input"
                  type="number"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  placeholder="Enter points to redeem"
                  disabled={cardCode && cardCode.includes("PC")}
                />
              </Form.Item>
              {/* Gross Value */}
              <Form.Item
                label="Gross Value of Promotions"
                name="discountedBill"
              >
                <Input
                  className="mli-tall-input"
                  placeholder="0.00"
                  disabled
                  style={{ backgroundColor: "#f1f1f1" }}
                />
              </Form.Item>
              <Form.Item label="Expiry Date" name="date" className="mb-6">
                <DatePicker
                  className="mli-tall-picker"
                  defaultValue={editingRow ? dayjs(editingRow.date) : null}
                />
              </Form.Item>

              <div className="flex flex-wrap gap-4">
                {digitalCardData?.promotions &&
                digitalCardData.promotions.length > 0 ? (
                  digitalCardData.promotions.map((promotion) => (
                    <div
                      key={promotion._id}
                      onClick={() => toggleSelectPromotion(promotion._id)}
                      className={`flex flex-col items-center border rounded p-4 cursor-pointer transition-all ${
                        selectedPromotions.includes(promotion._id)
                          ? "border-primary bg-blue-100"
                          : "border-gray-300 bg-white hover:border-primary"
                      }`}
                    >
                      <h1 className="text-[14px] font-bold">
                        {promotion.name}
                      </h1>
                      <p className="text-[14px] font-normal text-secondary">
                        {promotion.discountPercentage}% Discount
                      </p>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {dayjs(promotion.startDate).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-[14px]">
                    No promotions available or card not found
                  </p>
                )}
              </div>
              <Button
                className="w-full bg-primary text-white mt-4 text-[16px] font-bold p-5"
                onClick={handleApplyGiftCard}
                loading={isApproving}
                disabled={
                  cardCode &&
                  cardCode.includes("PC") &&
                  selectedPromotions.length === 0
                }
              >
                Apply Calculation
              </Button>
              <div className="flex justify-between mt-4 mb-3">
                <Button
                  className="bg-primary text-white font-bold p-5 text-[16px]"
                  onClick={handleScanNow}
                >
                  Scan Now
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full border py-8 rounded-lg">
            <h1 className="text-[24px] font-bold text-primary bg-white px-6 pb-6">
              Summary
            </h1>
            <div className="px-6 flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="font-bold text-[24px] text-secondary">
                  Total Bill:
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  {approvalResponse?.totalBill ||
                    form.getFieldValue("totalAmount") ||
                    "0.00"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-bold text-[24px] text-secondary">
                  Points Redeemed:
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  {approvalResponse?.pointRedeemed ||
                    form.getFieldValue("pointRedeemed") ||
                    "0"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-bold text-[24px] text-secondary">
                  Points Earned:
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  +{approvalResponse?.pointsEarned || "0"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-bold text-[24px] text-secondary">
                  Promotion Discount:
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  {approvalResponse?.discountedBill || "0.00"}
                </p>
              </div>
              <div className="flex justify-between border-t-2 border-primary pt-2">
                <p className="font-bold text-[24px] text-secondary">
                  Final Amount:
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  {approvalResponse?.finalBill || "0.00"}
                </p>
              </div>
              <div className="flex justify-between pt-2">
                <p className="font-bold text-[24px] text-secondary">
                  Effective Discount %
                </p>
                <p className="font-bold text-[24px] text-secondary">
                  {approvalResponse?.totalBill
                    ? `${((approvalResponse?.discountedBill / approvalResponse?.totalBill) * 100 || 0).toFixed(2)}%`
                    : "0.0%"}
                </p>
              </div>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-primary text-white mt-6 text-[16px] font-bold p-5 !border-none"
                  loading={isCheckingOut}
                  disabled={!approvalResponse}
                >
                  Complete Transaction
                </Button>
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default NewSell;
