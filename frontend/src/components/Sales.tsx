import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  DatePicker,
} from "antd";
import api from "../api/axios";
import moment from "moment";
import { useAuth } from "../context/AuthContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Medicine {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  total_price: number;
  sale_date: string;
}

const Sales: React.FC = () => {
  // Helper function to safely convert values to numbers for toFixed
  const safeParseFloat = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<
    [moment.Moment | null, moment.Moment | null] | null
  >(null);
  const { token } = useAuth();
  const [form] = Form.useForm();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/sales");
      setSales(response.data);
    } catch (error) {
      message.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get("/api/medicines");
      setMedicines(response.data);
    } catch (error) {
      message.error("Failed to fetch medicines");
    }
  };

  useEffect(() => {
    fetchSales();
    fetchMedicines();
  }, [token]);

  const handleAddSale = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.submit();
  };

  const onFinish = async (values: any) => {
    try {
      const selectedMedicine = medicines.find(
        (m) => m.id === values.medicine_id
      );
      if (!selectedMedicine) {
        message.error("Medicine not found");
        return;
      }

      if (selectedMedicine.quantity < values.quantity) {
        message.error("Insufficient stock");
        return;
      }

      const totalPrice =
        safeParseFloat(selectedMedicine.price) * values.quantity;

      await api.post("/api/sales", {
        medicine_id: values.medicine_id,
        quantity: values.quantity,
        total_price: totalPrice,
      });

      message.success("Sale recorded successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchSales();
      fetchMedicines(); // Refresh medicines to update stock counts
    } catch (error) {
      message.error("Failed to record sale");
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const handleGenerateReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning("Please select a date range");
      return;
    }

    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      const response = await api.get(
        `/api/sales/reports?start_date=${startDate}&end_date=${endDate}`
      );

      // Handle the report data - you could display it in a modal or new component
      message.success(
        `Total revenue: $${safeParseFloat(response.data.total_revenue).toFixed(
          2
        )}`
      );
    } catch (error) {
      message.error("Failed to generate report");
    }
  };

  const columns = [
    {
      title: "Medicine",
      dataIndex: "medicine_name",
      key: "medicine_name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price: number) => `$${safeParseFloat(price).toFixed(2)}`,
    },
    {
      title: "Date",
      dataIndex: "sale_date",
      key: "sale_date",
      render: (date: string) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button type="primary" onClick={handleAddSale}>
          New Sale
        </Button>
        <div>
          <RangePicker
            onChange={handleDateRangeChange}
            style={{ marginRight: 8 }}
          />
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={sales}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Record Sale"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="medicine_id"
            label="Medicine"
            rules={[{ required: true, message: "Please select a medicine" }]}
          >
            <Select placeholder="Select medicine">
              {medicines.map((medicine) => (
                <Option key={medicine.id} value={medicine.id}>
                  {medicine.name} - ${safeParseFloat(medicine.price).toFixed(2)}{" "}
                  (Stock: {medicine.quantity})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sales;
