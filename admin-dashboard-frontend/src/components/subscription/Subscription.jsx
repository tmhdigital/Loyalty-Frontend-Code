import { useState, useMemo, useEffect } from "react";
import { Card, Button, List, message } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import EditModal from "./components/EditModal";
import {
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useTogglePackageStatusMutation,
} from "../../redux/apiSlices/packageSlice";
import SubscriptionHeadingIcon from "../../assets/subscription-heading.png";
import { useUser } from "../../provider/User";
import { Spin } from "antd";

const PackagesPlans = () => {
  const { user } = useUser();
  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useGetPackagesQuery([]);

  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useTogglePackageStatusMutation();

  // Transform API data to UI format
  const packages = useMemo(() => {
    const items = response?.data || [];
    return items.map((item) => ({
      id: item?._id,
      title: item?.title,
      description: item?.description,
      price: item?.price,
      duration: item?.duration,
      features: item?.features,
      popular: item?.isFreeTrial || false,
      active: item?.status === "Active",
      paymentType: item?.paymentType,
      loginLimit: item?.loginLimit,
    }));
  }, [response]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1280) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    const maxSlide = Math.max(0, packages.length - cardsPerView);
    if (currentSlide > maxSlide) {
      setCurrentSlide(maxSlide);
    }
  }, [packages.length, cardsPerView, currentSlide]);

  const togglePackageStatus = async (id) => {
    try {
      await toggleStatus(id).unwrap();
      message.success("Package status updated successfully!");
    } catch (error) {
      console.error("Failed to toggle status:", error);
      message.error(error?.data?.message || "Failed to toggle package status");
    }
  };

  const showModal = (pkg = null) => {
    setIsEditing(!!pkg);
    setCurrentPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentPackage(null);
  };

  const handleSubmit = async (values) => {
    try {
      // Determine paymentType based on duration
      let paymentType = "Monthly";
      if (values.duration && values.duration.toLowerCase().includes("year")) {
        paymentType = "Yearly";
      } else if (
        values.duration &&
        values.duration.toLowerCase().includes("month")
      ) {
        paymentType = "Monthly";
      }

      const packageData = {
        title: values?.title,
        description: values?.description,
        price: Number(values?.price),
        duration: values?.duration,
        credit: values?.credit ? Number(values?.credit) : 0,
        paymentType: paymentType,
        loginLimit: values?.loginLimit ? Number(values?.loginLimit) : 1,
        features: values?.features.filter((f) => f && f.trim() !== ""),
      };

      if (isEditing) {
        // Update existing package
        await updatePackage({ id: currentPackage.id, ...packageData }).unwrap();
        message.success("Package updated successfully!");
      } else {
        // Create new package
        await createPackage(packageData).unwrap();
        message.success("Package created successfully!");
      }

      setIsModalOpen(false);
      setCurrentPackage(null);
    } catch (error) {
      console.error("Failed to save package:", error);
      message.error(
        error?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} package`,
      );
    }
  };

  const getCardStyle = (pkg) => {
    if (pkg.popular) {
      return "shadow-sm rounded-xl  bg-gradient-to-b from-blue-50 to-white hover:shadow-md transition-all transform hover:-translate-y-1";
    }
    return "shadow-sm rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all transform hover:-translate-y-1";
  };

  const maxSlide = Math.max(0, packages.length - cardsPerView);
  const visiblePackages = packages.slice(
    currentSlide,
    currentSlide + cardsPerView,
  );

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  if (error) {
    return (
      <div className="pt-1 px-4">
        <div className="flex justify-center items-center py-20">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold mb-2">
              Error loading membership plans
            </p>
            <p className="text-sm">
              {error?.data?.message || "Something went wrong"}
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="pt-1 px-4">
      <div className="flex flex-col justify-center items-center mb-8">
        <h2 className="text-[28px] font-semibold text-secondary">
          Plans for all sizes
        </h2>
        <p className="text-[15px] font-normal mb-[10px]">
          Simple, transparent pricing that grows with you. Try any plan free for
          30 days.
        </p>
        <Button
          icon={<PlusOutlined />}
          className="bg-primary px-8 py-5 rounded-full text-white hover:text-secondary text-[17px] font-bold"
          onClick={() => showModal()}
          disabled={user?.role === "VIEW_ADMIN"}
        >
          Add Membership Plan
        </Button>
      </div>
      <div className="flex justify-center">
        <div className="w-full 3xl:w-4/5 mb-6">
          {isLoading || isFetching ? (
            <div
              className="flex justify-center items-center"
              style={{ height: "40vh" }}
            >
              <Spin size="large" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No membership plans available.</p>
              <p>
                Click the "Add Membership Plan" button to create your first
                membership plan.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  onClick={handlePrev}
                  disabled={packages.length <= cardsPerView}
                  className="h-10 w-10 p-0 flex items-center justify-center"
                >
                  <LeftOutlined />
                </Button>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visiblePackages.map((pkg) => (
                    <div key={pkg.id} className="px-1">
                      <Card
                        title={null}
                        bordered={false}
                        className={`${getCardStyle(
                          pkg,
                        )} transition-transform duration-300 h-full flex flex-col`}
                        styles={{ body: { flexGrow: 1, display: 'flex', flexDirection: 'column' } }}
                        bodyStyle={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                      >
                        <div className="flex justify-end mb-2">
                          <div className="flex gap-2">
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => showModal(pkg)}
                              className="text-gray-800 border-gray-800 hover:text-primary hover:border-primary"
                              disabled={user?.role === "VIEW_ADMIN"}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-center items-center mb-2">
                          <img
                            src={SubscriptionHeadingIcon}
                            alt="Subscription Icon"
                            className="w-[40px] h-[40px] mb-4"
                          />
                          <h3 className="text-[20px] font-semibold text-primary ">
                            {pkg.title}
                          </h3>
                          <div>
                            <span className="text-secondary font-semibold text-[38px]">
                              {pkg.price}
                            </span>{" "}
                            / {pkg.duration}
                          </div>
                          <p className="text-[16px] font-normal text-center text-[#667085]">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex-grow mb-4">
                          <List
                            size="small"
                            dataSource={pkg.features}
                            renderItem={(feature) => (
                              <List.Item className="text-gray-700 border-none py-1">
                                <div className="flex items-start">
                                  <CheckCircleFilled className="text-green-500 mr-2 mt-1" />
                                  <span>{feature}</span>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>

                        <Button
                          className={`w-full mt-4 border h-10 ${pkg.active
                              ? "bg-primary border-primary text-white hover:!bg-primary hover:!border-primary hover:!text-white disabled:!bg-gray-300 disabled:!border-gray-300 disabled:!text-gray-500"
                              : "bg-red-500 border-red-500 text-white hover:!bg-gray-400 hover:!border-gray-400 hover:!text-white disabled:!bg-gray-300 disabled:!border-gray-300 disabled:!text-gray-500"
                            }`}
                          style={{ marginTop: 'auto' }}
                          onClick={() => togglePackageStatus(pkg.id)}
                          disabled={isToggling || user?.role === "VIEW_ADMIN"}
                        >
                          {pkg.active ? "Turn Off" : "Turn On"}
                        </Button>
                      </Card>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={packages.length <= cardsPerView}
                  className="h-10 w-10 p-0 flex items-center justify-center"
                >
                  <RightOutlined />
                </Button>
              </div>

              {maxSlide > 0 && (
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full ${currentSlide === index ? "bg-primary" : "bg-gray-300"
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EditModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        currentPackage={currentPackage}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isLoading={isEditing ? isUpdating : isCreating}
      />
    </div>
  );
};

export default PackagesPlans;
