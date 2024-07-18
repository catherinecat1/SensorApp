import React from 'react';
import { Layout, Menu } from 'antd';
import { UploadOutlined, DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CSVUpload from './components/CSVUpload';
import PrivateRoute from './components/PrivateRoute';

const { Header, Content, Footer } = Layout;

const App = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      {isAuthenticated && (
        <Header style={{ background: "#1f1f1f" }}>
          <div style={{ float: 'left', color: 'white', fontSize: '18px', marginRight: '80px' }}>
            <b>Smart Sensor Platform</b>
          </div>
          <Menu mode="horizontal" defaultSelectedKeys={['dashboard']}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="upload" icon={<UploadOutlined />}>
              <Link to="/upload">Upload CSV</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu>
        </Header>
      )}
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ padding: 24, minHeight: 380 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <PrivateRoute>
                  <CSVUpload />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Smart Sensor Platform ©2024</Footer>
    </Layout>
  );
};

export default App;