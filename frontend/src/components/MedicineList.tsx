import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Input,
  Statistic,
  Tooltip,
  Badge,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import moment from "moment";

const { Title, Text } = Typography;
const { Search } = Input;

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  expiry_date: string;
}

const MedicineList: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Demo data for fallback if API fails
  const demoMedicines: Medicine[] = [
    {
      id: 1,
      name: "Aspirin",
      description: "Pain reliever and fever reducer",
      price: 5.99,
      quantity: 100,
      expiry_date: "2025-06-30",
    },
    {
      id: 2,
      name: "Amoxicillin",
      description: "Antibiotic used to treat bacterial infections",
      price: 12.5,
      quantity: 50,
      expiry_date: "2024-08-15",
    },
    {
      id: 3,
      name: "Ibuprofen",
      description: "Non-steroidal anti-inflammatory drug",
      price: 7.25,
      quantity: 75,
      expiry_date: "2025-03-22",
    },
    {
      id: 4,
      name: "Paracetamol",
      description: "Fever reducer and pain reliever",
      price: 4.5,
      quantity: 8,
      expiry_date: "2024-05-18",
    },
    {
      id: 5,
      name: "Loratadine",
      description: "Antihistamine for allergy relief",
      price: 9.99,
      quantity: 30,
      expiry_date: "2023-09-30",
    },
  ];

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/medicines");
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
      message.error("Using demo data due to connection issues");
      // Use demo data as fallback
      setMedicines(demoMedicines);
      setFilteredMedicines(demoMedicines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      console.log(`Deleting medicine with ID: ${id}`);

      const response = await api.delete(`/api/medicines/${id}`);
      console.log("Delete response:", response.data);

      message.success("Medicine deleted successfully");

      // Refresh the medicines list
      fetchMedicines();
    } catch (error: any) {
      console.error("Failed to delete medicine:", error);

      // Show specific error message if available
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to delete medicine. Please try again.");
      }

      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value) {
      setFilteredMedicines(medicines);
      return;
    }

    const filtered = medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(value.toLowerCase()) ||
        medicine.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredMedicines(filtered);
  };

  const isLowStock = (quantity: number) => quantity <= 10;
  const isExpiringSoon = (date: string) => {
    const expiryDate = moment(date);
    const today = moment();
    const daysUntilExpiry = expiryDate.diff(today, "days");
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };
  const isExpired = (date: string) => moment(date).isBefore(moment(), "day");

  // Calculate statistics
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((med) =>
    isLowStock(med.quantity)
  ).length;
  const expiringSoonCount = medicines.filter((med) =>
    isExpiringSoon(med.expiry_date)
  ).length;
  const expiredCount = medicines.filter((med) =>
    isExpired(med.expiry_date)
  ).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Title level={2}>
              <MedicineBoxOutlined /> Medicine Inventory
            </Title>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/medicines/add")}
              style={{ marginRight: 8 }}
            >
              Add New Medicine
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchMedicines}
              size="large"
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Medicines"
              value={totalMedicines}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockCount}
              valueStyle={{ color: lowStockCount > 0 ? "#faad14" : undefined }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringSoonCount}
              valueStyle={{
                color: expiringSoonCount > 0 ? "#faad14" : undefined,
              }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expired Items"
              value={expiredCount}
              valueStyle={{ color: expiredCount > 0 ? "#ff4d4f" : undefined }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search medicines by name or description"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Row gutter={[16, 16]}>
          {loading ? (
            [...Array(4)].map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card loading={true} />
              </Col>
            ))
          ) : filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <Col xs={24} sm={12} md={8} lg={6} key={medicine.id}>
                <Badge.Ribbon
                  text={
                    isExpired(medicine.expiry_date)
                      ? "Expired"
                      : isExpiringSoon(medicine.expiry_date)
                      ? "Expiring Soon"
                      : null
                  }
                  color={isExpired(medicine.expiry_date) ? "red" : "orange"}
                  style={{
                    display:
                      isExpired(medicine.expiry_date) ||
                      isExpiringSoon(medicine.expiry_date)
                        ? "block"
                        : "none",
                  }}
                >
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Edit">
                        <EditOutlined
                          key="edit"
                          onClick={() =>
                            navigate(`/medicines/edit/${medicine.id}`)
                          }
                        />
                      </Tooltip>,
                      <Popconfirm
                        title="Are you sure you want to delete this medicine?"
                        onConfirm={() => handleDelete(medicine.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete">
                          <DeleteOutlined key="delete" />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Title level={4} style={{ marginBottom: 4 }}>
                        {medicine.name}
                      </Title>
                      <Text
                        type="secondary"
                        ellipsis={{ tooltip: medicine.description }}
                      >
                        {medicine.description}
                      </Text>
                    </div>

                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Statistic
                          title="Price"
                          value={medicine.price}
                          precision={2}
                          prefix={<DollarOutlined />}
                          valueStyle={{ fontSize: "16px" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Stock"
                          value={medicine.quantity}
                          valueStyle={{
                            color: isLowStock(medicine.quantity)
                              ? "#ff4d4f"
                              : undefined,
                            fontSize: "16px",
                          }}
                        />
                      </Col>
                    </Row>

                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary">Expires: </Text>
                      <Tag
                        color={
                          isExpired(medicine.expiry_date)
                            ? "red"
                            : isExpiringSoon(medicine.expiry_date)
                            ? "orange"
                            : "green"
                        }
                      >
                        {moment(medicine.expiry_date).format("MMM DD, YYYY")}
                      </Tag>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty
                description={
                  searchText
                    ? "No medicines found matching your search"
                    : "No medicines found"
                }
              />
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default MedicineList;
