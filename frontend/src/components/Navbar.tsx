import React from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Space,
  Avatar,
  Dropdown,
} from "antd";
import {
  MedicineBoxOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  PlusOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;
const { Title } = Typography;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item icon={<LogoutOutlined />} onClick={handleLogout} key="logout">
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#001529",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          className="logo"
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 24,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <MedicineBoxOutlined
            style={{ fontSize: 24, color: "#fff", marginRight: 8 }}
          />
          <Title level={4} style={{ margin: 0, color: "#fff" }}>
            PharmaMate
          </Title>
        </div>

        {isAuthenticated && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{
              lineHeight: "64px",
              border: 0,
            }}
          >
            <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/medicines" icon={<MedicineBoxOutlined />}>
              <Link to="/medicines">Medicines</Link>
            </Menu.Item>
            <Menu.Item key="/medicines/add" icon={<PlusOutlined />}>
              <Link to="/medicines/add">Add Medicine</Link>
            </Menu.Item>
            <Menu.Item key="/sales" icon={<ShoppingCartOutlined />}>
              <Link to="/sales">Sales</Link>
            </Menu.Item>
            <Menu.Item key="/inventory" icon={<DatabaseOutlined />}>
              <Link to="/inventory">Inventory</Link>
            </Menu.Item>
          </Menu>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: "#1890ff" }}
                icon={<UserOutlined />}
              />
              <span style={{ color: "#fff" }}>Admin</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
