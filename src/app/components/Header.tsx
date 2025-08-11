'use client';

import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Switch, Typography, Space, message, Button, Drawer, Badge } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, CrownOutlined, MenuOutlined, CloseOutlined, BellOutlined, HomeOutlined, BarChartOutlined, ToolOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { MenuProps } from 'antd';
import { useUserContext } from '../contexts/UserContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const { user, isLoading, isManager, refreshUser } = useUserContext();
  const [requestManager, setRequestManager] = useState<boolean>(false);
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      window.location.href = '/api/auth/logout';
    }
    // Close mobile menu when item is clicked
    setMobileMenuOpen(false);
  };

  const handleRoleUpdate = async (checked: boolean) => {
    if (!user?.email) {
      message.error('User email not found');
      return;
    }

    setUpdatingRole(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: checked ? 'MANAGER' : 'CAREWORKER'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || `Role updated to ${checked ? 'MANAGER' : 'CAREWORKER'} successfully`);
        setRequestManager(checked);
        // Refresh user context to get updated role
        if (refreshUser) {
          refreshUser();
        }
        // Reload the page to reflect the new role
        window.location.reload();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to update role');
        setRequestManager(!checked); // Revert the switch
      }
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('Failed to update role. Please try again.');
      setRequestManager(!checked); // Revert the switch
    } finally {
      setUpdatingRole(false);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="p-4 min-w-[280px] sm:min-w-[320px]">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                size={48}
                src={"https://i.pinimg.com/1200x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
                icon={!user?.picture && <UserOutlined />}
                className={`${isManager
                    ? 'border-3 border-yellow-400 shadow-lg'
                    : 'border-3 border-blue-500 shadow-lg'
                  }`}
              />
              <div className="flex-1">
                <Text strong className="text-base sm:text-lg block">{user?.name || 'User'}</Text>
                {isManager && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                    👑 Manager
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Text type="secondary" className="text-sm">
                {user?.email}
              </Text>
            </div>
            {!isManager && (
              <div className="mb-4 py-3 border-t border-gray-100">
                <Space direction="vertical" size="small" className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CrownOutlined className="text-yellow-500 text-lg" />
                      <Text className="text-sm font-medium">Request Manager Role</Text>
                    </div>
                    <Switch
                      size="small"
                      checked={requestManager}
                      loading={updatingRole}
                      onChange={handleRoleUpdate}
                    />
                  </div>
                </Space>
              </div>
            )}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const navItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: (
        <a
          href="/dashboard"
          className="flex items-center gap-2 text-inherit no-underline hover:text-blue-600 transition-all duration-200 text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <HomeOutlined />
          Dashboard
        </a>
      ),
    },
    {
      key: 'reports',
      label: (
        <a
          href="/reports"
          className="flex items-center gap-2 text-inherit no-underline hover:text-blue-600 transition-all duration-200 text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <BarChartOutlined />
          Reports
        </a>
      ),
    },
    {
      key: 'settings',
      label: (
        <a
          href="/settings"
          className="flex items-center gap-2 text-inherit no-underline hover:text-blue-600 transition-all duration-200 text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <ToolOutlined />
          Settings
        </a>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AntHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 border-b border-blue-500 shadow-lg px-3 sm:px-6 h-16 sm:h-18 leading-16 sm:leading-18 sticky top-0 z-[9999]">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
        </div>
      </AntHeader>
    );
  }

  return (
    <>
      <AntHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 border-b border-blue-500 shadow-lg px-3 sm:px-6 leading-16 sm:leading-18 sticky top-0 z-[9999]">
        <div className="flex justify-between items-center max-w-7xl mx-auto h-full">
          {/* Logo Section - Left */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/20 backdrop-blur-sm">
              <Image
                src="https://i.pinimg.com/736x/77/d6/70/77d670dc0d4c230d8f400845a8e59857.jpg"
                alt="CareTrack Logo"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white m-0 leading-none font-sans tracking-wider drop-shadow-lg">
                CareTrack
              </h1>
              <div className="text-xs sm:text-sm text-blue-100 font-medium tracking-wide">
                Healthcare Management
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
            {/* Navigation - Center */}
            <div className="flex-1 flex justify-center max-w-lg">
              <Menu
                mode="horizontal"
                items={navItems}
                className="border-none bg-transparent text-sm flex-1 justify-center [&_.ant-menu-item]:text-white [&_.ant-menu-item]:hover:text-blue-100 [&_.ant-menu-item]:hover:bg-white/10 [&_.ant-menu-item]:rounded-lg"
                selectedKeys={[]}
              />
            </div>

            {/* User Profile Section - Right */}
            {user && (
              <div className="flex items-center gap-4">
                {/* Welcome Text */}
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-medium text-blue-100 leading-tight">
                    Welcome back!
                  </div>
                  <div className="text-sm font-semibold text-white leading-tight">
                    {user?.name || user?.email}
                  </div>
                </div>

                {/* Notification Bell */}
                <Badge count={3} size="small" className="cursor-pointer">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="text-white hover:text-blue-100 hover:bg-white/10 border-0 h-10 w-10 flex items-center justify-center rounded-lg"
                  />
                </Badge>

                {/* User Avatar with Dropdown */}
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: handleMenuClick
                  }}
                  placement="bottomRight"
                  arrow
                  trigger={['click']}
                >
                  <div className="cursor-pointer relative transition-all duration-300 hover:scale-105 group">
                    <Avatar
                      size={40}
                      src={"https://i.pinimg.com/1200x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
                      icon={!user?.picture && <UserOutlined />}
                      className={`transition-all duration-300 cursor-pointer shadow-lg group-hover:shadow-xl ${
                        isManager
                          ? 'border-3 border-yellow-400 ring-2 ring-yellow-200'
                          : 'border-3 border-blue-300 ring-2 ring-blue-200'
                        }`}
                    />
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isManager ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                  </div>
                </Dropdown>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <div className="md:hidden flex items-center gap-3">
            {/* Notification Bell - Mobile */}
            <Badge count={3} size="small" className="cursor-pointer">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-white hover:text-blue-100 hover:bg-white/10 border-0 h-9 w-9 flex items-center justify-center rounded-lg"
              />
            </Badge>

            {/* User Avatar - Mobile */}
            {user && (
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleMenuClick
                }}
                placement="bottomRight"
                arrow
                trigger={['click']}
              >
                <div className="cursor-pointer relative transition-transform hover:scale-105">
                  <Avatar
                    size={36}
                    src={"https://i.pinimg.com/1200x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
                    icon={!user?.picture && <UserOutlined />}
                    className={`transition-all duration-300 cursor-pointer shadow-lg ${
                      isManager
                        ? 'border-2 border-yellow-400'
                        : 'border-2 border-blue-300'
                      }`}
                  />
                </div>
              </Dropdown>
            )}
            
            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 h-9 w-9 flex items-center justify-center border border-white/20 rounded-lg text-white hover:text-blue-100 hover:bg-white/10"
            />
          </div>
        </div>
      </AntHeader>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src="https://i.pinimg.com/736x/77/d6/70/77d670dc0d4c230d8f400845a8e59857.jpg"
                alt="CareTrack Logo"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <span className="text-lg font-bold text-gray-900">Menu</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width="85%"
        className="md:hidden"
        styles={{
          body: { padding: '20px' },
          header: { padding: '20px' }
        }}
      >
        <div className="space-y-6">
          {/* Mobile Navigation Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
            <div className="space-y-2">
              {/* Dashboard Link */}
              <a
                href="/dashboard"
                className="flex items-center gap-3 py-4 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeOutlined className="text-lg" />
                Dashboard
              </a>
              
              {/* Reports Link */}
              <a
                href="/reports"
                className="flex items-center gap-3 py-4 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChartOutlined className="text-lg" />
                Reports
              </a>
              
              {/* Settings Link */}
              <a
                href="/settings"
                className="flex items-center gap-3 py-4 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ToolOutlined className="text-lg" />
                Settings
              </a>
            </div>
          </div>

          {/* Mobile User Info */}
          {user && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">User Profile</h3>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <Avatar
                  size={48}
                  src={"https://i.pinimg.com/1200x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
                  icon={!user?.picture && <UserOutlined />}
                  className={`shadow-lg ${
                    isManager
                      ? 'border-3 border-yellow-400'
                      : 'border-3 border-blue-500'
                    }`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user?.email}
                  </div>
                  {isManager && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 mt-2">
                      👑 Manager
                    </div>
                  )}
                </div>
              </div>

              {/* Manager Request Toggle - Mobile */}
              {!isManager && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CrownOutlined className="text-yellow-500 text-lg" />
                      <span className="text-sm font-medium text-gray-700">Request Manager Role</span>
                    </div>
                    <Switch
                      size="small"
                      checked={requestManager}
                      loading={updatingRole}
                      onChange={handleRoleUpdate}
                    />
                  </div>
                </div>
              )}

              {/* Mobile Logout Button */}
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/api/auth/logout';
                }}
                className="w-full h-12 text-base font-medium rounded-xl"
                size="large"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Header;