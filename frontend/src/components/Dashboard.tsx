import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Button,
  List,
  Avatar,
  Divider,
  Tag,
  Progress,
  Calendar,
  message,
} from "antd";
import {
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import moment from "moment";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;

interface Medicine {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiry_date: string;
}

interface Sale {
  id: number;
  medicine_name: string;
  quantity: number;
  total_price: number;
  sale_date: string;
}

const Dashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Demo data for fallback when API calls fail
  const demoMedicines: Medicine[] = [
    {
      id: 1,
      name: "Aspirin",
      quantity: 150,
      price: 5.99,
      expiry_date: "2025-06-30",
    },
    {
      id: 2,
      name: "Amoxicillin",
      quantity: 5,
      price: 12.5,
      expiry_date: "2024-12-15",
    },
    {
      id: 3,
      name: "Ibuprofen",
      quantity: 200,
      price: 7.25,
      expiry_date: "2025-03-22",
    },
    {
      id: 4,
      name: "Paracetamol",
      quantity: 8,
      price: 4.5,
      expiry_date: "2024-05-18",
    },
    {
      id: 5,
      name: "Loratadine",
      quantity: 30,
      price: 9.99,
      expiry_date: "2023-09-30",
    },
    {
      id: 6,
      name: "Omeprazole",
      quantity: 75,
      price: 15.75,
      expiry_date: "2024-10-05",
    },
    {
      id: 7,
      name: "Simvastatin",
      quantity: 6,
      price: 18.99,
      expiry_date: "2025-01-15",
    },
  ];

  const demoSales: Sale[] = [
    {
      id: 1,
      medicine_name: "Aspirin",
      quantity: 5,
      total_price: 29.95,
      sale_date: moment().subtract(1, "days").toISOString(),
    },
    {
      id: 2,
      medicine_name: "Ibuprofen",
      quantity: 3,
      total_price: 21.75,
      sale_date: moment().subtract(2, "days").toISOString(),
    },
    {
      id: 3,
      medicine_name: "Amoxicillin",
      quantity: 2,
      total_price: 25.0,
      sale_date: moment().toISOString(),
    },
    {
      id: 4,
      medicine_name: "Loratadine",
      quantity: 1,
      total_price: 9.99,
      sale_date: moment().toISOString(),
    },
    {
      id: 5,
      medicine_name: "Paracetamol",
      quantity: 4,
      total_price: 18.0,
      sale_date: moment().subtract(3, "days").toISOString(),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [medicinesRes, salesRes] = await Promise.all([
          api.get("/api/medicines"),
          api.get("/api/sales"),
        ]);
        setMedicines(medicinesRes.data);
        setSales(salesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.info("Using demo data due to connection issues");
        // Use demo data as fallback
        setMedicines(demoMedicines);
        setSales(demoSales);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  const lowStockMedicines = medicines.filter((med) => isLowStock(med.quantity));
  const lowStockCount = lowStockMedicines.length;
  const expiringSoonMedicines = medicines.filter((med) =>
    isExpiringSoon(med.expiry_date)
  );
  const expiringSoonCount = expiringSoonMedicines.length;
  const expiredCount = medicines.filter((med) =>
    isExpired(med.expiry_date)
  ).length;

  // Add a safe number conversion helper function near the top of the component
  const safeParseFloat = (value: any): number => {
    // Handle the case where value might be null, undefined, or non-numeric string
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update the totalRevenue calculation to use the safe conversion
  const totalSales = sales.length;
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + safeParseFloat(sale.total_price),
    0
  );

  // For recent sales chart
  const recentSales = sales.slice(0, 5);

  // For calendar display
  const getCalendarData = (value: Dayjs) => {
    const dateString = value.format("YYYY-MM-DD");
    const daySales = sales.filter(
      (sale) => moment(sale.sale_date).format("YYYY-MM-DD") === dateString
    );

    if (daySales.length > 0) {
      const dayRevenue = daySales.reduce(
        (sum, sale) => sum + safeParseFloat(sale.total_price),
        0
      );
      return {
        hasSales: true,
        count: daySales.length,
        revenue: dayRevenue,
      };
    }
    return null;
  };

  const dateCellRender = (value: Dayjs) => {
    const data = getCalendarData(value);
    return data ? (
      <div className="notes-month">
        <Tag color="blue">${safeParseFloat(data.revenue).toFixed(2)}</Tag>
      </div>
    ) : null;
  };

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="1">
            <Title level={2}>Dashboard</Title>
            <Text type="secondary">Welcome to PharmaMate Dashboard</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/medicines/add")}
            >
              Add New Medicine
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate("/medicines")}>
            <Statistic
              title="Total Medicines"
              value={totalMedicines}
              prefix={<MedicineBoxOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">View all medicines</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate("/inventory")}>
            <Statistic
              title="Low Stock Items"
              value={lowStockCount}
              valueStyle={{ color: lowStockCount > 0 ? "#faad14" : undefined }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {lowStockCount > 0 ? "Requires attention" : "Stock levels good"}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate("/inventory")}>
            <Statistic
              title="Expiring Soon"
              value={expiringSoonCount}
              valueStyle={{
                color: expiringSoonCount > 0 ? "#faad14" : undefined,
              }}
              prefix={<ExclamationCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {expiringSoonCount > 0
                  ? "Check expiry dates"
                  : "No expiring items"}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate("/sales")}>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">From {totalSales} sales</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <>
                <ShoppingCartOutlined /> Recent Sales
              </>
            }
            extra={<Link to="/sales">View All</Link>}
            style={{ marginBottom: 24 }}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentSales}
              renderItem={(sale) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                    title={sale.medicine_name}
                    description={
                      <>
                        <Text type="secondary">
                          {moment(sale.sale_date).format("MMM DD, YYYY HH:mm")}
                        </Text>
                        <div>Quantity: {sale.quantity}</div>
                      </>
                    }
                  />
                  <div>
                    <Tag color="green">
                      ${safeParseFloat(sale.total_price).toFixed(2)}
                    </Tag>
                  </div>
                </List.Item>
              )}
              locale={{
                emptyText: "No recent sales",
              }}
            />
          </Card>

          <Card
            title={
              <>
                <ClockCircleOutlined /> Sales Calendar
              </>
            }
            style={{ marginBottom: 24 }}
          >
            <Calendar fullscreen={false} cellRender={dateCellRender} />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <>
                <WarningOutlined /> Low Stock Items
              </>
            }
            extra={<Link to="/inventory">Manage</Link>}
            style={{ marginBottom: 24 }}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={lowStockMedicines}
              renderItem={(medicine) => (
                <List.Item>
                  <List.Item.Meta
                    title={medicine.name}
                    description={
                      <>
                        <Progress
                          percent={medicine.quantity * 10}
                          size="small"
                          status="exception"
                          format={() => `${medicine.quantity} left`}
                        />
                      </>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: "No low stock items",
              }}
            />
          </Card>

          <Card
            title={
              <>
                <ExclamationCircleOutlined /> Expiring Soon
              </>
            }
            extra={<Link to="/medicines">View All</Link>}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={expiringSoonMedicines}
              renderItem={(medicine) => (
                <List.Item>
                  <List.Item.Meta
                    title={medicine.name}
                    description={
                      <>
                        <Tag color="orange">
                          Expires:{" "}
                          {moment(medicine.expiry_date).format("MMM DD, YYYY")}
                        </Tag>
                        <div>
                          <Text type="secondary">
                            {moment(medicine.expiry_date).fromNow()}
                          </Text>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: "No items expiring soon",
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
