import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, InputNumber, Select, message } from "antd";
import api from "../api/axios";
import moment from "moment";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;

interface Medicine {
  id: number;
  name: string;
  quantity: number;
}

interface InventoryLog {
  id: number;
  medicine_id: number;
  medicine_name: string;
  previous_quantity: number;
  new_quantity: number;
  change_type: string;
  log_date: string;
}

const Inventory: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { token } = useAuth();
  const [form] = Form.useForm();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/inventory/logs");
      setLogs(response.data);
    } catch (error) {
      message.error("Failed to fetch inventory logs");
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
    fetchLogs();
    fetchMedicines();
  }, [token]);

  const handleUpdateInventory = () => {
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

      if (
        values.change_type === "REMOVE" &&
        selectedMedicine.quantity < values.quantity
      ) {
        message.error("Insufficient stock");
        return;
      }

      await api.post("/api/inventory/update", {
        medicine_id: values.medicine_id,
        quantity: values.quantity,
        change_type: values.change_type,
      });

      message.success("Inventory updated successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchLogs();
      fetchMedicines(); // Refresh medicines to update stock counts
    } catch (error) {
      message.error("Failed to update inventory");
    }
  };

  const columns = [
    {
      title: "Medicine",
      dataIndex: "medicine_name",
      key: "medicine_name",
    },
    {
      title: "Previous Quantity",
      dataIndex: "previous_quantity",
      key: "previous_quantity",
    },
    {
      title: "New Quantity",
      dataIndex: "new_quantity",
      key: "new_quantity",
    },
    {
      title: "Change Type",
      dataIndex: "change_type",
      key: "change_type",
    },
    {
      title: "Date",
      dataIndex: "log_date",
      key: "log_date",
      render: (date: string) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleUpdateInventory}>
          Update Inventory
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Update Inventory"
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
                  {medicine.name} (Current Stock: {medicine.quantity})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="change_type"
            label="Operation"
            rules={[{ required: true, message: "Please select an operation" }]}
          >
            <Select placeholder="Select operation">
              <Option value="ADD">Add Stock</Option>
              <Option value="REMOVE">Remove Stock</Option>
              <Option value="UPDATE">Set Stock</Option>
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

export default Inventory;
