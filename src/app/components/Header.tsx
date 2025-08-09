'use client';

import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Switch, Typography, Space, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, CrownOutlined } from '@ant-design/icons';
import Image from 'next/image';
import type { MenuProps } from 'antd';
import { useUserContext } from '../contexts/UserContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const { user, isLoading, isManager, refreshUser } = useUserContext();
  const [requestManager, setRequestManager] = useState<boolean>(false);
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      window.location.href = '/api/auth/logout';
    }
    // Handle other menu actions here
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
        <div className="p-2 min-w-[220px]">
          <div className="mb-2">
            <Text strong>{user?.name || 'User'}</Text>
            {isManager && (
              <span className="ml-2 text-xs text-yellow-500 font-bold">
                👑 Manager
              </span>
            )}
          </div>
          <div className="mb-3">
            <Text type="secondary" className="text-xs">
              {user?.email}
            </Text>
          </div>
          {!isManager && (
            <div className="mb-3 py-2 border-t border-b border-gray-100">
              <Space>
                <CrownOutlined className="text-yellow-500" />
                <Text className="text-xs">Request to be Manager</Text>
                <Switch
                  size="small"
                  checked={requestManager}
                  loading={updatingRole}
                  onChange={handleRoleUpdate}
                />
              </Space>
            </div>
          )}
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
          className="text-inherit no-underline hover:text-blue-600 transition-colors"
        >
          Dashboard
        </a>
      ),
    },
    {
      key: 'reports',
      label: (
        <a
          href="/reports"
          className="text-inherit no-underline hover:text-blue-600 transition-colors"
        >
          Reports
        </a>
      ),
    },
    {
      key: 'settings',
      label: (
        <a
          href="/settings"
          className="text-inherit no-underline hover:text-blue-600 transition-colors"
        >
          Settings
        </a>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AntHeader className="bg-white border-b border-gray-100 shadow-sm px-6 h-16 leading-16 sticky top-0 z-50" style={{ background: 'white' }}>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </AntHeader>
    );
  }

  return (
    <AntHeader className="bg-white border-b border-gray-100 shadow-sm px-6 leading-16 sticky top-0 z-50" style={{ background: 'white' }}>
      <div className="flex justify-between items-center max-w-7xl mx-auto h-full">
        {/* Logo Section - Left */}
        <div className="flex items-center gap-3">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://i.pinimg.com/736x/77/d6/70/77d670dc0d4c230d8f400845a8e59857.jpg"
              alt="CareTrack Logo"
              width={50}
              height={50}
              priority
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-black m-0 leading-none font-sans tracking-wider">
            CareTrack
          </h1>
        </div>


        <div className='flex items-center gap-4 flex-1 justify-end'>

          {/* Navigation - Center */}
          <div className="flex-1 flex justify-center max-w-md">
            <Menu
              mode="horizontal"
              items={navItems}
              className="border-none bg-transparent text-sm flex-1 justify-center"
              selectedKeys={[]}
            />
          </div>

          {/* User Profile Section - Right */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Welcome Text - Hidden on mobile */}
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-800 leading-tight">
                  Welcome back!
                </div>
                <div className="text-md uppercase text-gray-500 leading-tight font-semibold">
                  {user?.name || user?.email}
                </div>
              </div>

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
                <div className="cursor-pointer relative transition-transform hover:scale-105">
                  <Avatar
                    size={42}
                    src={"https://i.pinimg.com/1200x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
                    icon={!user?.picture && <UserOutlined />}
                    className={`transition-all duration-300 cursor-pointer ${isManager
                        ? 'border-2 border-yellow-400'
                        : 'border-2 border-blue-500'
                      }`}
                  />
                </div>
              </Dropdown>
            </div>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;