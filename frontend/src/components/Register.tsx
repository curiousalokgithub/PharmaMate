import React, { useState, useEffect, useRef } from "react";
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
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const { Title, Text } = Typography;

// Simple debounce function implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [usernameStatus, setUsernameStatus] = useState<
    "" | "warning" | "error" | "validating" | "success"
  >("");
  const [emailStatus, setEmailStatus] = useState<
    "" | "warning" | "error" | "validating" | "success"
  >("");
  const [usernameValue, setUsernameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const debouncedUsername = useDebounce(usernameValue, 500);
  const debouncedEmail = useDebounce(emailValue, 500);

  // Check username availability when debounced value changes
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) return;

      try {
        setUsernameStatus("validating");
        const response = await api.get(
          `/api/auth/check-availability?username=${debouncedUsername}`
        );
        if (response.data.exists.username) {
          setUsernameStatus("error");
          form.setFields([
            {
              name: "username",
              errors: ["Username already exists"],
            },
          ]);
        } else {
          setUsernameStatus("success");
        }
      } catch (error) {
        setUsernameStatus("");
      }
    };

    checkUsernameAvailability();
  }, [debouncedUsername, form]);

  // Check email availability when debounced value changes
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!debouncedEmail || !debouncedEmail.includes("@")) return;

      try {
        setEmailStatus("validating");
        const response = await api.get(
          `/api/auth/check-availability?email=${debouncedEmail}`
        );
        if (response.data.exists.email) {
          setEmailStatus("error");
          form.setFields([
            {
              name: "email",
              errors: ["Email already exists"],
            },
          ]);
        } else {
          setEmailStatus("success");
        }
      } catch (error) {
        setEmailStatus("");
      }
    };

    checkEmailAvailability();
  }, [debouncedEmail, form]);

  const onFinish = async (values: {
    username: string;
    password: string;
    email: string;
  }) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await register(values.username, values.password, values.email);
      message.success(
        "Registration successful! Please log in with your credentials."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setUsernameValue(username);
    if (username.length < 3) {
      setUsernameStatus("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailValue(email);
    if (!email.includes("@")) {
      setEmailStatus("");
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
          className="register-card"
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
            <Text type="secondary">Create a new account</Text>
          </div>

          {errorMessage && (
            <Alert
              message="Registration Error"
              description={errorMessage}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setErrorMessage(null)}
            />
          )}

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
              OR REGISTER BELOW
            </Text>
          </Divider>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="username"
              validateStatus={usernameStatus}
              hasFeedback
              rules={[
                { required: true, message: "Please input your username!" },
                { min: 3, message: "Username must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Username"
                onChange={handleUsernameChange}
              />
            </Form.Item>

            <Form.Item
              name="email"
              validateStatus={emailStatus}
              hasFeedback
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Email"
                onChange={handleEmailChange}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                placeholder="Password (at least 6 characters)"
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
                Create Account
              </Button>
            </Form.Item>

            <Divider plain>
              <Text type="secondary" style={{ fontSize: 12 }}>
                OR
              </Text>
            </Divider>

            <div style={{ textAlign: "center" }}>
              <Text type="secondary">Already have an account? </Text>
              <Link to="/login">Sign in now</Link>
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

export default Register;
