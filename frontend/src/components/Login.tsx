import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      message.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Function to bypass authentication and go directly to dashboard
  const goToDashboard = () => {
    // Store a demo token to simulate being logged in
    localStorage.setItem("token", "demo-token-for-bypassing-auth");
    message.success("Skipping authentication. Redirecting to dashboard...");
    navigate("/dashboard");
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card
          bordered={false}
          className="login-card"
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <MedicineBoxOutlined
              style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
            />
            <Title level={2} style={{ marginBottom: 8 }}>
              PharmaMate
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          <Button
            type="primary"
            icon={<DashboardOutlined />}
            size="large"
            block
            onClick={goToDashboard}
            style={{
              marginBottom: 16,
              height: 45,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Skip Authentication & Go to Dashboard
          </Button>

          <Divider plain>
            <Text type="secondary" style={{ fontSize: 12 }}>
              OR SIGN IN BELOW
            </Text>
          </Divider>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 45 }}
              >
                Sign In
              </Button>
            </Form.Item>

            <Divider plain>
              <Text type="secondary" style={{ fontSize: 12 }}>
                OR
              </Text>
            </Divider>

            <div style={{ textAlign: "center" }}>
              <Text type="secondary">Don't have an account? </Text>
              <Link to="/register">Register now</Link>
            </div>
          </Form>
        </Card>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            &copy; {new Date().getFullYear()} PharmaMate. All rights reserved.
          </Text>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
