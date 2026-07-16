import { Menu, Modal } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IoIosLogOut } from "react-icons/io";
import {
  Dashboard,
  Marchant,
  Settings,
  SubscriptionManagement,
  People,
  PromotionManagement,
  SalesRep,
  AuditLog,
  Rewords,
  PushNotifications,
} from "../../components/common/Svg";
import { getImageUrl } from "../../components/common/imageUrl";
import logo from "../../assets/favicon.png";
import { useUser } from "../../provider/User";
import { api } from "../../redux/api/baseApi";
import { logoutSession } from "../../utils/authSession";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const path = location.pathname;
  const [selectedKey, setSelectedKey] = useState("");
  const [openKeys, setOpenKeys] = useState([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();

  const showLogoutConfirm = () => setIsLogoutModalOpen(true);
  const handleLogout = async () => {
    await logoutSession();

    dispatch(api.util.resetApiState());

    setIsLogoutModalOpen(false);
    navigate("/auth/login", { replace: true });
  };
  const handleCancel = () => setIsLogoutModalOpen(false);

  const isItemActive = (itemKey) =>
    selectedKey === itemKey ||
    (itemKey === "subMenuSetting" &&
      ["/profile", "/terms-and-conditions", "/privacy-policy"].includes(
        selectedKey,
      ));

  const renderIcon = (IconComponent, itemKey) => {
    const isActive = isItemActive(itemKey);
    return (
      <div
        style={{ width: 20, height: 20 }}
        className={isActive ? "svg-active" : ""}
      >
        <IconComponent
          className="menu-icon"
          fill={isActive ? "#ffffff" : "#1E1E1E"}
        />
      </div>
    );
  };

  // Sales Rep Portal
  const salesRepMenu = {
    key: "/sales-rep-portal",
    icon: renderIcon(SalesRep, "/sales-rep-portal"),
    label: (
      <Link to="/sales-rep-portal">{collapsed ? "" : "Sales Rep Portal"}</Link>
    ),
  };

  // Sales Rep Portal
  const ReportMenu = {
    key: "/reporting-analytics",
    icon: renderIcon(Rewords, "/reporting-analytics"),
    label: (
      <Link to="/reporting-analytics">
        {collapsed ? "" : "Reporting & Analytics"}
      </Link>
    ),
  };

  // Get base menu items for all roles
  const getMenuItems = () => {
    const isAdminRep = user?.role === "ADMIN_SELL";
    const isAdminRep2 = user?.role === "ADMIN_REP";
    const isViewAdmin = user?.role === "VIEW_ADMIN";

    // Settings submenu - with conditional children based on role
    const settingsMenu = {
      key: "subMenuSetting",
      icon: renderIcon(Settings, "subMenuSetting"),
      label: collapsed ? "" : "Settings",
      children:
        isAdminRep || isAdminRep2
          ? [
              {
                key: "/profile",
                label: (
                  <Link to="/profile">{collapsed ? "" : "Update Profile"}</Link>
                ),
              },
            ]
          : [
              {
                key: "/profile",
                label: (
                  <Link to="/profile">{collapsed ? "" : "Update Profile"}</Link>
                ),
              },
              ...(isViewAdmin
                ? []
                : [
                    {
                      key: "/user-management",
                      label: (
                        <Link to="/user-management">
                          {collapsed ? "" : "User Management"}
                        </Link>
                      ),
                    },
                  ]),
              {
                key: "/terms-and-conditions",
                label: (
                  <Link to="/terms-and-conditions">
                    {collapsed ? "" : "Terms And Conditions"}
                  </Link>
                ),
              },
              {
                key: "/privacy-policy",
                label: (
                  <Link to="/privacy-policy">
                    {collapsed ? "" : "Privacy Policy"}
                  </Link>
                ),
              },
            ],
    };

    if (isAdminRep) {
      // Show only Sales Rep Portal, Settings, and Logout for ADMIN_REP
      return [
        salesRepMenu,
        settingsMenu,
        {
          key: "/logout",
          icon: <IoIosLogOut size={24} />,
          label: <p onClick={showLogoutConfirm}>{collapsed ? "" : "Logout"}</p>,
        },
      ];
    }

    if (isAdminRep2) {
      // Show only Sales Rep Portal, Settings, and Logout for ADMIN_REP
      return [
        salesRepMenu,
        ReportMenu,
        settingsMenu,
        {
          key: "/logout",
          icon: <IoIosLogOut size={24} />,
          label: <p onClick={showLogoutConfirm}>{collapsed ? "" : "Logout"}</p>,
        },
      ];
    }

    // Base menu items
    const baseMenuItems = [];

    // Add Dashboard Overview only if not VIEW_ADMIN
    if (!isViewAdmin) {
      baseMenuItems.push({
        key: "/",
        icon: renderIcon(Dashboard, "/"),
        label: <Link to="/">{collapsed ? "" : "Dashboard Overview"}</Link>,
      });
    }

    baseMenuItems.push(
      {
        key: "/merchant-management",
        icon: renderIcon(Marchant, "/merchant-management"),
        label: (
          <Link to="/merchant-management">
            {collapsed ? "" : "Merchant Management"}
          </Link>
        ),
      },
      {
        key: "/customer-management",
        icon: renderIcon(People, "/customer-management"),
        label: (
          <Link to="/customer-management">
            {collapsed ? "" : "Customer Profile"}
          </Link>
        ),
      },
      {
        key: "/tier-system",
        icon: renderIcon(People, "/tier-system"),
        label: (
          <Link to="/tier-system">
            {collapsed ? "" : "Point & Tier System"}
          </Link>
        ),
      },
      {
        key: "/reporting-analytics",
        icon: renderIcon(Rewords, "/reporting-analytics"),
        label: (
          <Link to="/reporting-analytics">
            {collapsed ? "" : "Reporting & Analytics"}
          </Link>
        ),
      },
      {
        key: "/membership-plans",
        icon: renderIcon(SubscriptionManagement, "/membership-plans"),
        label: (
          <Link to="/membership-plans">
            {collapsed ? "" : "Membership Plans"}
          </Link>
        ),
      },
      {
        key: "/promotion-management",
        icon: renderIcon(PromotionManagement, "/promotion-management"),
        label: (
          <Link to="/promotion-management">
            {collapsed ? "" : "Promotion Management"}
          </Link>
        ),
      },
      {
        key: "/support-messages",
        icon: renderIcon(PromotionManagement, "/support-messages"),
        label: (
          <Link to="/support-messages">
            {collapsed ? "" : "Support Messages"}
          </Link>
        ),
      },
      ...(isViewAdmin
        ? []
        : [
            {
              key: "/push-notifications",
              icon: renderIcon(PushNotifications, "/push-notifications"),
              label: (
                <Link to="/push-notifications">
                  {collapsed ? "" : "Push Notifications"}
                </Link>
              ),
            },
          ]),
      salesRepMenu,
      {
        key: "/audit-logs",
        icon: renderIcon(AuditLog, "/audit-logs"),
        label: <Link to="/audit-logs">{collapsed ? "" : "Audit Logs"}</Link>,
      },
    );

    // Add settings and logout
    baseMenuItems.push(settingsMenu);
    baseMenuItems.push({
      key: "/logout",
      icon: <IoIosLogOut size={24} />,
      label: <p onClick={showLogoutConfirm}>{collapsed ? "" : "Logout"}</p>,
    });

    return baseMenuItems;
  };

  const menuItems = getMenuItems();

  useEffect(() => {
    const selectedItem = menuItems.find(
      (item) =>
        item.key === path ||
        (item.children && item.children.some((sub) => sub.key === path)),
    );
    if (selectedItem) {
      setSelectedKey(path);
      if (selectedItem.children) setOpenKeys([selectedItem.key]);
      else {
        const parentItem = menuItems.find(
          (item) =>
            item.children && item.children.some((sub) => sub.key === path),
        );
        if (parentItem) setOpenKeys([parentItem.key]);
      }
    }
  }, [path, menuItems]);

  const handleOpenChange = (keys) => setOpenKeys(keys);

  return (
    <div
      className="h-full flex flex-col bg-white border-r border-primary transition-all duration-300"
      style={{ width: collapsed ? 80 : 250 }}
    >

      {/* Logo */}
      {!collapsed && (
        <Link
          to={"/"}
          className="logo-container flex items-center justify-center py-4"
        >
          <img
            src={getImageUrl(user?.profile) || logo}
            alt="profile"
            style={{
              clipPath: "circle()",
              width: 120,
              height: 120,
              objectFit: "cover",
            }}
          />
        </Link>
      )}

      {/* Menu */}
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          className="font-poppins text-black border-none"
          items={menuItems.map((item) => ({
            ...item,
            children: item.children
              ? item.children.map((subItem) => ({ ...subItem }))
              : undefined,
          }))}
        />
      </div>

      {/* Logout Modal */}
      <Modal
        centered
        title="Confirm Logout"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={handleCancel}
        okText="Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </div>
  );
};

export default Sidebar;
