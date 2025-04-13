import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  message,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import moment from "moment";

const EditMedicine: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setFetchLoading(true);
        console.log(`Fetching medicine with ID: ${id}`);

        const response = await api.get(`/api/medicines/${id}`);
        console.log("Medicine data:", response.data);

        const medicine = response.data;
        form.setFieldsValue({
          ...medicine,
          expiry_date: medicine.expiry_date
            ? moment(medicine.expiry_date)
            : null,
        });
      } catch (error: any) {
        console.error("Failed to fetch medicine details:", error);

        if (error.response && error.response.status === 404) {
          message.error("Medicine not found");
        } else {
          message.error("Failed to fetch medicine details. Please try again.");
        }
        navigate("/medicines");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMedicine();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      console.log(`Updating medicine with ID: ${id}`, values);

      const formattedValues = {
        ...values,
        expiry_date: values.expiry_date
          ? values.expiry_date.format("YYYY-MM-DD")
          : null,
      };

      const response = await api.put(`/api/medicines/${id}`, formattedValues);
      console.log("Update response:", response.data);

      message.success("Medicine updated successfully");
      navigate("/medicines");
    } catch (error: any) {
      console.error("Failed to update medicine:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(`Failed to update: ${error.response.data.message}`);
      } else {
        message.error("Failed to update medicine. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading medicine data..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Card title="Edit Medicine">
        <Form
          form={form}
          name="edit-medicine"
          onFinish={onFinish}
          layout="vertical"
        >
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
              Update Medicine
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditMedicine;
