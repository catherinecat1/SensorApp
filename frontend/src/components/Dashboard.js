import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Radio, Table, Typography, Button } from 'antd';
import ReactECharts from 'echarts-for-react';
import { getAverageSensorData, getLatestSensorData, getAllEquipment, getLatestSensorDataByLocation } from '../services/api';
import ScatterMap from '../components/ScatterMap';
import * as echarts from 'echarts';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [averageData, setAverageData] = useState({});
  const [lineChartData, setLineChartData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(720);
  const [selectedPeriodMap, setSelectedPeriodMap] = useState(24);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(moment());

  useEffect(() => {
    fetchEquipmentList();
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // Fetch data every 10 minute
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  useEffect(() => {
    fetchLineChartData();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchMapData();
  }, [selectedPeriodMap]);

  useEffect(() => {
    fetchTableData();
  }, [selectedEquipment]);

  const fetchData = async () => {
    try {
      fetchAverageData();
      fetchLineChartData();
      fetchMapData();
      fetchTableData();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setSelectedPeriod(720);
      setSelectedPeriodMap(24);
      setLastRefreshTime(moment());
    }
  };

  const fetchAverageData = async () => {
    const periods = [24, 48, 168, 720];
    const data = {};
    for (let period of periods) {
      const response = await getAverageSensorData(period);
      data[period] = response.data[0]?.average || 0;
    }
    setAverageData(data);
  };

  const fetchLineChartData = async () => {
    const response = await getAverageSensorData(selectedPeriod);
    setLineChartData(response.data);
  };

  const fetchMapData = async () => {
    const response = await getLatestSensorDataByLocation(selectedPeriodMap);
    setMapData(response.data);
  };

  const fetchTableData = async () => {
    const response = await getLatestSensorData(24, selectedEquipment);
    setTableData(response.data);
  };

  const fetchEquipmentList = async () => {
    const response = await getAllEquipment();
    setEquipmentList(response.data);
  };

  const getLineChartOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: lineChartData.map(item => item.hours) },
    yAxis: { type: 'value' },
    series: [{
      data: lineChartData.map(item => item.average),
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.5,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(128, 255, 165)'
          },
          {
            offset: 1,
            color: 'rgb(1, 191, 236)'
          }
        ])
      },
    }]
  });

  const columns = [
    { title: 'Equipment ID', dataIndex: 'equipment_id', key: 'equipment_id' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  return (
    <div style={{ padding: '0px 20px' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ paddingBottom: '10px' }}>
        <Col>
          <Text>Refresh every 10 minutes. Last refreshed: {lastRefreshTime ? lastRefreshTime.format('YYYY-MM-DD HH:mm:ss') : 'Never'}</Text>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Card title="Avg. 24 Hour">
            <h2>{averageData[24]? parseFloat(averageData[24]).toFixed(2) : 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Avg. 48 Hour">
            <h2>{averageData[48]? parseFloat(averageData[48]).toFixed(2) : 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Avg. 1 Week ">
            <h2>{averageData[168]? parseFloat(averageData[168]).toFixed(2) : 0}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Avg. 1 Month">
            <h2>{averageData[720]? parseFloat(averageData[720]).toFixed(2) : 0}</h2>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Average Values by Hours">
            <Radio.Group value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} style={{ marginBottom: '10px' }}>
              <Radio.Button value={24}>24 Hours</Radio.Button>
              <Radio.Button value={48}>48 Hours</Radio.Button>
              <Radio.Button value={168}>1 Week</Radio.Button>
              <Radio.Button value={720}>1 Month</Radio.Button>
            </Radio.Group>
            <ReactECharts option={getLineChartOption()} style={{ height: '300px' }} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Global Sensor Data Map">
          <Radio.Group value={selectedPeriodMap} onChange={(e) => setSelectedPeriodMap(e.target.value)} style={{ marginBottom: '10px' }}>
              <Radio.Button value={24}>24 Hours</Radio.Button>
              <Radio.Button value={48}>48 Hours</Radio.Button>
              <Radio.Button value={168}>1 Week</Radio.Button>
              <Radio.Button value={720}>1 Month</Radio.Button>
            </Radio.Group>
            <ScatterMap data={mapData} />
          </Card>
        </Col>
      </Row>


      <Row style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Sensor Data List in Latest 24 Hours">
            <Select 
              value={selectedEquipment} 
              onChange={(value) => setSelectedEquipment(value)} 
              style={{ marginBottom: '10px', width: '200px' }}
              allowClear
              showSearch
              placeholder="Select Equipment"
            >
              {equipmentList.map(eq => (
                <Option key={eq.equipment_id} value={eq.equipment_id}>{eq.equipment_id}</Option>
              ))}
            </Select>
            <Table columns={columns} dataSource={tableData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;