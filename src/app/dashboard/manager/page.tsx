'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import RoleGuard from '../../components/RoleGuard';
import LocationMap from '../../components/Map';
import { Collapse, Avatar, Button, Space, Tag, Tooltip, Dropdown, Modal, Form, Input, Table, message } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SaveOutlined,
  TeamOutlined,
  HeartOutlined,
  EllipsisOutlined,
  BarChartOutlined,
  TableOutlined
} from '@ant-design/icons';
import { locationData } from '@/app/api/Data/dummy';
import { useUserContext } from '../../contexts/UserContext';
import { ROLES } from '../../utils/roleManager';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ManagerDashboard() {
  const { user, isLoading, isManager, mounted } = useUserContext();
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isShiftDetailsVisible, setIsShiftDetailsVisible] = useState(false);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  
 
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
        if (data.locations.length > 0) {
          setCurrentLocation(data.locations[0]);  
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setError(null);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch users: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to connect to server. Please try again.');
    }
  };

  const fetchAllShifts = async () => {
    try {
      setError(null);
      const response = await fetch('/api/shifts/all');
      if (response.ok) {
        const data = await response.json();
        setAllShifts(data.shifts || []);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch shifts: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to connect to server. Please try again.');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setDataLoaded(false);
    try {
      await Promise.all([
        fetchLocations(),
        fetchAllUsers(),
        fetchAllShifts()
      ]);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && user && !isLoading) {
      // Redirect non-managers to worker dashboard
      if (!isManager) {
        router.push('/dashboard/worker');
      }
    }
  }, [user, isLoading, mounted, router, isManager]);

  // Fetch data on component mount
  useEffect(() => {
    if (mounted && user && isManager) {
      fetchAllData();
    }
  }, [mounted, user, isManager]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsCreatingLocation(true);

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Location created successfully');
        setIsModalVisible(false);
        form.resetFields();
        // Refresh locations
        await fetchLocations();
        // Set the new location as current
        setCurrentLocation(data.location);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to create location');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create location. Please try again.');
      }
    } finally {
      setIsCreatingLocation(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleRowClick = (record: any) => {
    setSelectedShift(record);
    setIsShiftDetailsVisible(true);
  };

  const handleShiftDetailsClose = () => {
    setIsShiftDetailsVisible(false);
    setSelectedShift(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (user: any) => {
    if (!user.lastClockIn) return <CloseCircleOutlined className="text-red-500" />;

    const lastClockIn = new Date(user.lastClockIn);
    const now = new Date();
    const diffInHours = (now.getTime() - lastClockIn.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return <PlayCircleOutlined className="text-green-500" />;
    if (diffInHours < 8) return <PauseCircleOutlined className="text-yellow-500" />;
    return <CloseCircleOutlined className="text-red-500" />;
  };

  const getStatusText = (user: any) => {
    if (!user.lastClockIn) return 'Inactive';

    const lastClockIn = new Date(user.lastClockIn);
    const now = new Date();
    const diffInHours = (now.getTime() - lastClockIn.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Active';
    if (diffInHours < 8) return 'On Break';
    return 'Offline';
  };

  // Table columns for shift data
  const shiftTableColumns = [
    {
      title: 'Worker',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" src={user?.profilePicUrl} icon={<UserOutlined />} />
          <div className="flex flex-col ml-2">
            <div className="font-medium text-sm">{user?.name || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Date & Day',
      key: 'date',
      render: (record: any) => (
        <div>
          <div className="font-medium text-sm">{formatDate(record.date)}</div>
          <div className="text-xs text-gray-500">{record.day}</div>
        </div>
      ),
      responsive: ['md'],
    },
    {
      title: 'Time',
      key: 'time',
      render: (record: any) => (
        <div>
          <div className="text-sm">{formatTime(record.startTime)} - {record.endTime ? formatTime(record.endTime) : 'Ongoing'}</div>
          <div className="text-xs text-gray-500">{record.totalHours}h</div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: any) => (
        <div>
          <div className="font-medium text-sm">{location?.name || 'No location'}</div>
          {location && (
            <div className="text-xs text-gray-500">
              {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
            </div>
          )}
        </div>
      ),
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          COMPLETED: { color: 'green', text: 'Completed' },
          IN_PROGRESS: { color: 'blue', text: 'In Progress' },
          MISSED: { color: 'red', text: 'Missed' },
          SCHEDULED: { color: 'orange', text: 'Scheduled' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => (
        <span className="text-xs text-gray-600">
          {note ? (note.length > 30 ? `${note.substring(0, 30)}...` : note) : '-'}
        </span>
      ),
    },
  ];

  // Process data for chart - Time series by date
  const processChartData = () => {
 
    const shiftsByDate = allShifts.reduce((acc, shift) => {
      const date = new Date(shift.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          total: 0,
          completed: 0,
          in_progress: 0,
          missed: 0,
          scheduled: 0
        };
      }
      acc[date].total += 1;

     
      if (shift.status === 'COMPLETED') acc[date].completed += 1;
      else if (shift.status === 'IN_PROGRESS') acc[date].in_progress += 1;
      else if (shift.status === 'MISSED') acc[date].missed += 1;
      else if (shift.status === 'SCHEDULED') acc[date].scheduled += 1;

      return acc;
    }, {} as Record<string, { total: number; completed: number; in_progress: number; missed: number; scheduled: number }>);

    // Sort dates and create series
    const sortedDates = Object.keys(shiftsByDate).sort();

    const series = [
      {
        name: 'Total Shifts',
        data: sortedDates.map(date => shiftsByDate[date].total)
      },
      {
        name: 'Completed',
        data: sortedDates.map(date => shiftsByDate[date].completed)
      },
      {
        name: 'In Progress',
        data: sortedDates.map(date => shiftsByDate[date].in_progress)
      },
      {
        name: 'Missed',
        data: sortedDates.map(date => shiftsByDate[date].missed)
      },
      {
        name: 'Scheduled',
        data: sortedDates.map(date => shiftsByDate[date].scheduled)
      }
    ];

    return { categories: sortedDates, series };
  };

  const { categories, series } = processChartData();

  if (!mounted || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading dashboard...</div>
            <div className="text-sm text-gray-500 mt-2">
              {loading ? 'Fetching data from database...' : 'Initializing...'}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <div className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button 
              type="primary" 
              onClick={fetchAllData}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter out manager and only show careworkers
      const careworkers = allUsers.filter(user => user.role === 'CAREWORKER');

  return (
    <RoleGuard requiredRole={ROLES.MANAGER}>
      <DashboardLayout>
        <div className="px-3 py-4 sm:px-6 lg:px-8 max-w-8xl mx-auto dashboard-content">
          {/* Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8 w-full">
            {/* Total Shifts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 justify-between">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg p-2">
                  <CalendarOutlined className="text-white text-lg sm:text-2xl" />
                </div>
                <div className='text-right'>
                  <p className="text-base sm:text-xl font-semibold text-gray-600">Total Shifts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{allShifts.length}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {allShifts.filter(shift => shift.status === 'COMPLETED').length} completed
                  </p>
                </div>
              </div>
            </div>

            {/* Total Workers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 justify-between">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg p-2">
                  <TeamOutlined className="text-white text-lg sm:text-2xl" />
                </div>
                <div className='text-right'>
                  <p className="text-base sm:text-xl font-semibold text-gray-600">Total Workers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{allUsers.filter(user => user.role === 'CAREWORKER').length}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {allUsers.filter(user => user.role === 'CAREWORKER' && user.lastClockIn).length} active
                  </p>
                </div>
              </div>
            </div>

            {/* Total Hours */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 justify-between">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg p-2">
                  <ClockCircleOutlined className="text-white text-lg sm:text-2xl" />
                </div>
                <div className='text-right'>
                  <p className="text-base sm:text-xl font-semibold text-gray-600">Total Hours</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {allShifts.reduce((total, shift) => {
                      return total + shift.totalHours;
                    }, 0).toFixed(0)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {allShifts.filter(shift => shift.status === 'COMPLETED').length} shifts completed
                  </p>
                </div>
              </div>
            </div>

            {/* Average Shift Duration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 justify-between">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg p-2">
                  <SaveOutlined className="text-white text-lg sm:text-2xl" />
                </div>
                <div className='text-right'>
                  <p className="text-base sm:text-xl font-semibold text-gray-600">Avg. Shift Duration</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {allShifts.length > 0 ? (allShifts.reduce((total, shift) => {
                      return total + shift.totalHours;
                    }, 0) / allShifts.length).toFixed(1) : '0'}h
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {allShifts.filter(shift => shift.status === 'IN_PROGRESS').length} in progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 h-full max-w-7xl mx-auto">
            {/* Clock-in Location Info Section */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl xl:rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Location Information</h2>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'setLocation',
                        label: 'Create New Location',
                      },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'setLocation') {
                        setIsModalVisible(true);
                        form.resetFields();
                      }
                    },
                  }}
                  trigger={['click']}
                >
                  <Space className="cursor-pointer">
                    <EllipsisOutlined style={{ color: 'black', fontSize: '20px' }} className="text-lg sm:text-2xl" />
                  </Space>
                </Dropdown>
              </div>

              {/* Two-column layout for location info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                {/* Left Section - White Background */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900">{currentLocation?.name}</div>
                    <div className="text-xs text-gray-500">Location Details</div>
                    <div className="text-xs text-gray-500">Radius: {currentLocation?.radius}km</div>
                  </div>
                </div>

                {/* Right Section - Light Green Background */}
                <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-400 rounded-full flex items-center justify-center">
                        <TeamOutlined className="text-white text-xs sm:text-sm" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-green-800">Clock-in Time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <HeartOutlined className="text-white text-xs sm:text-sm" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-green-800">Radius: {currentLocation?.radius}km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Title Section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Staff Information</h3>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">CLOCK-IN STAFF</h1>
              </div>

              {/* Action Card - Dark Background */}
              <div className="bg-gray-800 p-4 sm:p-5 text-white rounded-2xl xl:rounded-3xl">
                <div className="mb-3">
                  <div className="text-xs text-gray-300 mb-1">Location Information</div>
                  <div className="text-base sm:text-lg font-bold text-white">CLOCK-IN STAFF</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <SaveOutlined className="text-white text-xs sm:text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-400">Save</div>
                        <div className="text-xs text-gray-300">Clock-in time</div>
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white">{careworkers.length}</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <EnvironmentOutlined className="text-white text-xs sm:text-sm" />
                    </div>
                    <div className="text-sm text-white">
                      {currentLocation?.name} ({currentLocation?.latitude.toFixed(2)}, {currentLocation?.longitude.toFixed(2)})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <EnvironmentOutlined className="text-blue-600 text-lg sm:text-xl" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Location Map</h2>
                </div>
                <p className="text-sm text-gray-600">Real-time location tracking and monitoring</p>
              </div>
              <div className="w-full h-64 sm:h-80 xl:h-full">
                <LocationMap currentLocation={currentLocation} />
              </div>
            </div>
            {/* User List Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Active Workers ({careworkers?.length})</h2>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {careworkers && careworkers.length > 0 ? careworkers.map((user, index) => (
                  <Collapse
                    key={user.id}
                    ghost
                    size="small"
                    className="border-none w-full"
                    expandIconPosition="end"
                    expandIcon={() => <div></div>}
                    items={[
                      {
                        key: user.id,
                        label: (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-3 py-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                            {/* Left side - Avatar and Name */}
                            <div className="flex items-center space-x-3 sm:space-x-4 gap-2">
                              <Avatar
                                size={40}
                                src={user.profilePicUrl}
                                icon={<UserOutlined />}
                                className="border-2 border-gray-200"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 text-sm sm:text-base">{user.name}</span>
                                <span className="text-xs sm:text-sm text-gray-500">{user.role}</span>
                              </div>
                            </div>

                            {/* Middle section - Status and Data */}
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                  {user.lastClockIn ? getTimeAgo(user.lastClockIn) : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.totalShifts || 0} shifts
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                        children: (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <div className="flex flex-wrap gap-4">
                              {/* Basic Info */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <MailOutlined className="mr-2" />
                                  Contact Info
                                </h4>
                                <div className="text-sm text-gray-600">
                                  <div>Email: {user.email}</div>
                                  <div>Role: {user.role}</div>
                                  <div>Joined: {formatDate(user.createdAt)}</div>
                                </div>
                              </div>

                              {/* Work Stats */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <ClockCircleOutlined className="mr-2" />
                                  Work Stats
                                </h4>
                                <div className="text-sm text-gray-600">
                                  <div>Total Shifts: {user.totalShifts || 0}</div>
                                  <div>Avg Hours: {user.averageHours || 0}h</div>
                                  <div>Last Active: {user.lastClockIn ? getTimeAgo(user.lastClockIn) : 'Never'}</div>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <TeamOutlined className="mr-2" />
                                  Status
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(user)}
                                  <span className="text-sm text-gray-600">{getStatusText(user)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      }
                    ]}
                  />
                )) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <div className="text-sm text-gray-500">Loading workers...</div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-400 text-4xl mb-2">👥</div>
                          <div className="text-sm text-gray-500">No careworkers found</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Charts and Tables Row - Full Width Stacked */}
          <div className="space-y-6 mt-6 max-w-7xl mx-auto">
            {/* Table Section - Full Width */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4'>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TableOutlined className="text-blue-600 text-lg sm:text-xl" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Shift Management</h2>
                </div>
                <p className="text-sm text-gray-600">Track and manage employee shifts</p>
              </div>
              <div className="overflow-x-auto table-container table-responsive">
                <Table
                  columns={shiftTableColumns}
                  dataSource={allShifts}
                  rowKey="id"
                  loading={loading}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    className: 'cursor-pointer hover:bg-blue-50 transition-colors duration-200'
                  })}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                    size: 'small',
                    responsive: true,
                  }}
                  scroll={{ x: 'max-content' }}
                  size="small"
                  className="responsive-table"
                  locale={{ 
                    emptyText: dataLoaded ? 'No shifts found' : 'Loading shifts...' 
                  }}
                />
              </div>
            </div>
            {/* Chart Section - Full Width */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChartOutlined className="text-blue-600 text-lg sm:text-xl" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daily Shift Activity</h2>
                </div>
                <p className="text-sm text-gray-600">Track shifts by date with completion status</p>
              </div>
              <div className="h-64 sm:h-80 xl:h-96 chart-container chart-responsive">
                <Chart
                  options={{
                    chart: {
                      type: 'area',
                      toolbar: {
                        show: false
                      },
                      zoom: {
                        enabled: false
                      },
                      stacked: false
                    },
                    dataLabels: {
                      enabled: false
                    },
                    stroke: {
                      curve: 'smooth',
                      width: 2
                    },
                    colors: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#10B981'],
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.3,
                        stops: [0, 90, 100]
                      }
                    },
                    xaxis: {
                      categories: categories,
                      labels: {
                        style: {
                          colors: '#6B7280'
                        },
                        formatter: function (value) {
                          // Format date for better display
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          });
                        }
                      }
                    },
                    yaxis: {
                      labels: {
                        style: {
                          colors: '#6B7280'
                        }
                      },
                      title: {
                        text: 'Number of Shifts',
                        style: {
                          color: '#6B7280'
                        }
                      }
                    },
                    tooltip: {
                      theme: 'dark',
                      shared: true,
                      intersect: false,
                      style: {
                        fontSize: '12px',
                        fontFamily: 'Arial, sans-serif'
                      },
                      y: {
                        formatter: function (val) {
                          return val + ' shifts';
                        }
                      },
                      x: {
                        formatter: function (value) {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        }
                      }
                    },
                    legend: {
                      position: 'bottom',
                      horizontalAlign: 'left',
                      fontSize: '12px'
                    },
                    title: {
                      text: 'Daily Shift Activity',
                      align: 'left',
                      style: {
                        fontSize: '14px',
                        color: '#374151'
                      }
                    }
                  }}
                  series={series}
                  type="area"
                  height={250}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Location Modal */}
        <Modal
          title="Create New Location"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="Save"
          cancelText="Cancel"
          width="90%"
          style={{ maxWidth: '600px' }}
          confirmLoading={isCreatingLocation}
        >
          <Form
            form={form}
            layout="vertical"
            name="locationForm"
          >
            <Form.Item
              name="name"
              label="Location Name"
              rules={[{ required: true, message: 'Please enter location name' }]}
            >
              <Input placeholder="Enter location name" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="latitude"
                label="Latitude"
                rules={[
                  { required: true, message: 'Please enter latitude' },
                  { 
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') {
                        return Promise.resolve();
                      }
                      const num = parseFloat(value);
                      if (isNaN(num) || num < -90 || num > 90) {
                        return Promise.reject('Latitude must be between -90 and 90');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" step="any" placeholder="Enter latitude" />
              </Form.Item>

              <Form.Item
                name="longitude"
                label="Longitude"
                rules={[
                  { required: true, message: 'Please enter longitude' },
                  { 
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') {
                        return Promise.resolve();
                      }
                      const num = parseFloat(value);
                      if (isNaN(num) || num < -180 || num > 180) {
                        return Promise.reject('Longitude must be between -180 and 180');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" step="any" placeholder="Enter longitude" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please enter start time' }]}
              >
                <Input type="time" />
              </Form.Item>

              <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please enter end time' }]}
              >
                <Input type="time" />
              </Form.Item>
            </div>

            <Form.Item
              name="radius"
              label="Radius (km)"
              rules={[
                { required: true, message: 'Please enter radius' },
                { 
                  validator: (_, value) => {
                    if (value === undefined || value === null || value === '') {
                      return Promise.resolve();
                    }
                    const num = parseFloat(value);
                    if (isNaN(num) || num <= 0) {
                      return Promise.reject('Radius must be greater than 0');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input type="number" step="0.1" placeholder="Enter radius in km" />
            </Form.Item>
          </Form>
        </Modal>
        {/* Shift Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-blue-600" />
              <span>Shift Details</span>
            </div>
          }
          open={isShiftDetailsVisible}
          onCancel={handleShiftDetailsClose}
          footer={[
            <Button key="close" onClick={handleShiftDetailsClose}>
              Close
            </Button>
          ]}
          width="90%"
          style={{ maxWidth: '600px' }}
        >
          {selectedShift && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pb-4 border-b border-gray-200">
                <Avatar size={64} src={selectedShift.profile_pic} icon={<UserOutlined />} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedShift.name}</h3>
                  <p className="text-gray-600">{selectedShift.email}</p>
                  <Tag color={
                    selectedShift.status === 'completed' ? 'green' :
                      selectedShift.status === 'in_progress' ? 'blue' :
                        selectedShift.status === 'missed' ? 'red' : 'orange'
                  }>
                    {selectedShift.status === 'completed' ? 'Completed' :
                      selectedShift.status === 'in_progress' ? 'In Progress' :
                        selectedShift.status === 'missed' ? 'Missed' : 'Scheduled'}
                  </Tag>
                </div>
              </div>

              {/* Shift Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-blue-600" />
                    <span className="font-medium">Shift Date:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{formatDate(selectedShift.shift_date)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined className="text-blue-600" />
                    <span className="font-medium">Duration:</span>
                  </div>
                  <p className="text-gray-600 ml-6">
                    {formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-blue-600" />
                    <span className="font-medium">Location ID:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{selectedShift.location_id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MailOutlined className="text-blue-600" />
                    <span className="font-medium">Shift ID:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{selectedShift.id}</p>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MailOutlined className="text-blue-600" />
                  <span className="font-medium">Notes:</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg ml-6">
                  <p className="text-gray-700">
                    {selectedShift.notes || 'No notes available for this shift.'}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                  </div>
                  <p className="text-gray-500 text-sm ml-6">{formatDate(selectedShift.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                  </div>
                  <p className="text-gray-500 text-sm ml-6">{formatDate(selectedShift.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  );
} 