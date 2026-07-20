import React from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import FeaturedInput from "../../common/PackageFeatureInput";

const EditModal = ({
  isOpen,
  isEditing,
  currentPackage,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [form] = Form.useForm();

  // Set form values when modal opens or package changes
  React.useEffect(() => {
    if (isOpen && currentPackage) {
      form.setFieldsValue({
        title: currentPackage.title,
        description: currentPackage.description,
        price: Number(currentPackage.price),
        duration: currentPackage.duration,
        credit: currentPackage.credit || 0,
        paymentType: currentPackage.paymentType || "Monthly",
        loginLimit: currentPackage.loginLimit || 1,
        features: currentPackage.features || [],
        popular: currentPackage.popular || false,
      });
    } else if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, currentPackage, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = (values) => {
    const updatedValues = {
      ...values,
      paymentType: values.duration,
    };

    onSubmit(updatedValues);
  };

  return (
    <Modal
      title={isEditing ? "Edit Membership Plan" : "Add Membership Plan"}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      className="rounded-lg"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="flex flex-col gap-4"
      >
        <Form.Item
          name="title"
          label="Membership Plan Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="e.g. Basic Plan" className="mli-tall-input" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Description is required" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Short description of what this package offers"
            style={{ resize: "none", borderColor: "#d8d8d8" }}
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: "Price is required" },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") {
                    return Promise.resolve();
                  }
                  if (isNaN(value) || Number(value) < 0) {
                    return Promise.reject(
                      new Error("Price cannot be negative"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            className="w-1/2"
          >
            <Input
              type="number"
              prefix=""
              placeholder="29.99"
              className="mli-tall-input"
              min="0"
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: "Duration is required" }]}
            className="w-1/2"
          >
            <Select placeholder="Select duration" className="mli-tall-select">
              <Select.Option value="1 month">1 Month</Select.Option>
              <Select.Option value="4 months">4 Months</Select.Option>
              <Select.Option value="8 months">8 Months</Select.Option>
              <Select.Option value="1 year">1 Year</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="features"
          label="Features"
          rules={[
            { required: true, message: "At least one feature is required" },
          ]}
        >
          <FeaturedInput />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="border border-primary hover:!border-primary hover:!text-primary"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
            className="bg-primary text-white rounded-lg transition-all"
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
                ? "Update Membership Plan"
                : "Add Membership Plan"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditModal;
