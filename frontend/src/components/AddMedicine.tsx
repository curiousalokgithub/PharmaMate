import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import moment from "moment";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  details?: string;
}

const AddMedicine: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        expiry_date: values.expiry_date.format("YYYY-MM-DD"),
      };

      // Using our configured API instance with the correct URL
      await api.post("/api/medicines", formattedValues);

      message.success("Medicine added successfully");
      navigate("/medicines");
    } catch (error: unknown) {
      console.error("Error adding medicine:", error);

      // More descriptive error message
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.message || "Server error";
        message.error(`Failed to add medicine: ${errorMessage}`);
      } else if (error && typeof error === "object" && "request" in error) {
        message.error("Failed to add medicine: No response from server");
      } else {
        message.error(
          `Failed to add medicine: ${
            (error as Error).message || "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Card title="Add New Medicine">
        <Form name="add-medicine" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input the medicine name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input the price!" }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please input the quantity!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Expiry Date"
            name="expiry_date"
            rules={[
              { required: true, message: "Please select the expiry date!" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Add Medicine
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddMedicine;
