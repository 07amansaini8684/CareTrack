'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import RoleGuard from '../../components/RoleGuard';
import LocationMap from '../../components/Map';
import { Collapse, Avatar, Button, Space, Tag, Tooltip, Dropdown, Modal, Form, Input, Table, Select, Card, message } from 'antd';
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
  TableOutlined,
  EditOutlined
} from '@ant-design/icons';
import { users, locationData, IndividualShiftData } from '@/app/api/Data/dummy';
import { useUserContext } from '../../contexts/UserContext';
import { ROLES } from '../../utils/roleManager';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function WorkerDashboard() {
  const { user, isLoading, isManager, mounted, dbUser } = useUserContext();
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isShiftDetailsVisible, setIsShiftDetailsVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current'); // 'current' or 'previous'

  // Shift management states
  const [activeShift, setActiveShift] = useState<any>(null);
  const [userShifts, setUserShifts] = useState<any[]>([]);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isEndingShift, setIsEndingShift] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [startShiftForm] = Form.useForm();
  const [isStartShiftModalVisible, setIsStartShiftModalVisible] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (mounted && user && !isLoading) {
      // Redirect manager to manager dashboard
      if (isManager) {
        router.push('/dashboard/manager');
      }
    }
  }, [user, isLoading, mounted, router, isManager]);

  // Fetch user shifts and locations
  useEffect(() => {
    if (mounted && user && !isManager && dbUser) {
      fetchUserShifts();
      fetchLocations();
    }
  }, [mounted, user, isManager, dbUser]);

  const fetchUserShifts = async () => {
    try {
      const response = await fetch('/api/shifts');
      if (response.ok) {
        const data = await response.json();
        setUserShifts(data.shifts);

        // Find active shift
        const active = data.shifts.find((shift: any) => shift.status === 'IN_PROGRESS');
        setActiveShift(active || null);

        // Update current location based on active shift's location
        if (active && active.location) {
          setCurrentLocation(active.location);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);

        // Set current location based on active shift or first available location
        if (data.locations.length > 0) {
          setCurrentLocation(data.locations[0]); // Use first location as default
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleStartShift = async () => {
    try {
      const values = await startShiftForm.validateFields();
      setIsStartingShift(true);

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Shift started successfully');
        setIsStartShiftModalVisible(false);
        startShiftForm.resetFields();
        await fetchUserShifts();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to start shift');
      }
    } catch (error) {
      message.error('Failed to start shift. Please try again.');
    } finally {
      setIsStartingShift(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    try {
      setIsEndingShift(true);

      const response = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'end_shift'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Shift ended successfully');
        await fetchUserShifts();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to end shift');
      }
    } catch (error) {
      message.error('Failed to end shift. Please try again.');
    } finally {
      setIsEndingShift(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedShift) return;

    try {
      const values = await noteForm.validateFields();

      const response = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_note',
          shiftId: selectedShift.id,
          note: values.note
        }),
      });

      if (response.ok) {
        const data = await response.json();
        message.success(data.message || 'Note updated successfully');
        setIsNoteModalVisible(false);
        noteForm.resetFields();
        await fetchUserShifts();
        setSelectedShift(null);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Failed to update note');
      }
    } catch (error) {
      message.error('Failed to update note. Please try again.');
    }
  };

  const handleRowClick = (record: any) => {
    setSelectedShift(record);
    setIsShiftDetailsVisible(true);
  };

  const handleShiftDetailsClose = () => {
    setIsShiftDetailsVisible(false);
    setSelectedShift(null);
  };

  const handleEditNote = (shift: any) => {
    setSelectedShift(shift);
    noteForm.setFieldsValue({ note: shift.note || '' });
    setIsNoteModalVisible(true);
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

  // Table columns for user shifts
  const shiftTableColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(text)}</div>
          <div className="text-sm text-gray-500">{record.day}</div>
        </div>
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (record: any) => (
        <div>
          <div className="text-gray-900">{formatTime(record.startTime)} - {record.endTime ? formatTime(record.endTime) : 'Ongoing'}</div>
          <div className="text-sm text-gray-500">{record.totalHours}h</div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: any) => <span className="text-gray-600">{location?.name || 'No location'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          COMPLETED: { color: 'green', text: 'Completed' },
          IN_PROGRESS: { color: 'blue', text: 'In Progress' },
          SCHEDULED: { color: 'orange', text: 'Scheduled' },
          MISSED: { color: 'red', text: 'Missed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleEditNote(record);
          }}
        >
          Edit Note
        </Button>
      ),
    },
  ];

  // Process data for chart - Individual worker data with month filtering
  const processChartData = () => {
    // Get current date and calculate month boundaries
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetMonth, targetYear;

    if (selectedMonth === 'current') {
      targetMonth = currentMonth;
      targetYear = currentYear;
    } else {
      // Previous month
      targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    }

    // Filter user shifts based on selected month
    const filteredData = userShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === targetMonth &&
        shiftDate.getFullYear() === targetYear &&
        shift.status !== 'MISSED';
    });

    const series = [
      {
        name: 'Hours Worked',
        data: filteredData.map(shift => shift.totalHours || 0)
      }
    ];

    const categories = filteredData.map(shift => `${shift.day} (${formatDate(shift.date)})`);

    return { categories, series };
  };

  const { categories, series } = processChartData();

  // Calculate individual worker statistics based on selected month
  const getMonthData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetMonth, targetYear;

    if (selectedMonth === 'current') {
      targetMonth = currentMonth;
      targetYear = currentYear;
    } else {
      // Previous month
      targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    }

    return userShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === targetMonth &&
        shiftDate.getFullYear() === targetYear;
    });
  };

  const monthData = getMonthData();
  const totalShifts = monthData.filter(shift => shift.status === 'COMPLETED').length;
  const totalHours = monthData.reduce((total, shift) => total + (shift.totalHours || 0), 0);
  const completedShifts = monthData.filter(shift => shift.status === 'COMPLETED').length;
  const ongoingShifts = monthData.filter(shift => shift.status === 'IN_PROGRESS').length;
  const avgHoursPerShift = totalShifts > 0 ? (totalHours / totalShifts).toFixed(1) : '0';

  if (!mounted || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard requiredRole={ROLES.WORKER}>
      <DashboardLayout>
        <div className="px-6 py-8 sm:px-8 max-w-8xl mx-auto">


          {/* Main Content Grid - First Row */}
          <div className="flex gap-4 h-full mb-6">
            {/* Show Location Information only when active shift */}
            {activeShift ? (
              /* Active Shift - Location Info Section */
              <div className="flex-1 bg-white p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Current Work Location</h2>
                </div>

                {/* Two-column layout for location info */}
                <div className="flex gap-4 mb-4">
                  {/* Left Section - Location Details */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 rounded-xl">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">
                        {activeShift.location ? activeShift.location.name : 'No Location Set'}
                      </div>
                      <div className="text-xs text-gray-500">Location Details</div>
                      <div className="text-xs text-gray-500">
                        Radius: {activeShift.location ? `${activeShift.location.radius}km` : 'N/A'}
                      </div>
                      {activeShift.location && (
                        <div className="text-xs text-gray-500">
                          Coordinates: {activeShift.location.latitude.toFixed(4)}, {activeShift.location.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Shift Status */}
                  <div className="flex-1 bg-green-50 rounded-lg p-4 rounded-xl">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                          <ClockCircleOutlined className="text-white text-sm" />
                        </div>
                        <span className="text-xs font-medium text-green-800">Currently Clocked In</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap ">
                        <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                          <EnvironmentOutlined className="text-white text-sm" />
                        </div>
                        <span className="text-xs font-medium text-green-800">
                          Working at {activeShift.location ? activeShift.location.name : 'Unknown location'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Title Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Staff Information</h3>
                  <h1 className="text-2xl font-bold text-gray-900">ACTIVE SHIFT</h1>
                </div>

                {/* Action Card - Dark Background */}
                <div className="bg-gray-800 p-5 text-white rounded-3xl mb-4">
                  <div className="mb-3">
                    <div className="text-xs text-gray-300 mb-1">Current Status</div>
                    <div className="text-lg font-bold text-white">ACTIVE SHIFT</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <ClockCircleOutlined className="text-white text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-orange-400">Started</div>
                          <div className="text-xs text-gray-300">
                            {new Date(activeShift.startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">🟢</div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <EnvironmentOutlined className="text-white text-sm" />
                      </div>
                      <div className="text-sm text-white">
                        {activeShift.location ?
                          `${activeShift.location.name} (${activeShift.location.latitude.toFixed(2)}, ${activeShift.location.longitude.toFixed(2)})` :
                          'No location specified'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* End Shift Button - Full Width */}
                <Button
                  type="primary"
                  size="large"
                  icon={<PauseCircleOutlined />}
                  onClick={handleEndShift}
                  loading={isEndingShift}
                  className="w-full bg-red-500 border-red-500 hover:bg-red-600 text-white font-medium"
                  block
                >
                  End Current Shift
                </Button>
              </div>
            ) : (
              /* No Active Shift - Simple Start Button */
              /* Enhanced No Active Shift - Professional Start Interface */
              <div className="flex-1 bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl flex flex-col justify-center shadow-sm border border-gray-100">
                <div className="text-center max-w-md mx-auto">
                  {/* Welcome Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start?</h2>
                    <p className="text-gray-600 text-sm">Begin your shift and start tracking your work time</p>
                  </div>

                  {/* Icon Container */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 border border-blue-100">
                    <div className="relative">
                      {/* Main Clock Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ClockCircleOutlined className="text-white text-3xl" style={{ fontSize: '32px' }} />
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-2 right-8 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>
                      <div className="absolute bottom-2 left-8 w-2 h-2 bg-indigo-300 rounded-full opacity-40"></div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center">
                      <p className="text-gray-700 font-medium mb-1">No Active Shift</p>
                      <p className="text-gray-500 text-xs">Click below to begin tracking</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined style={{ fontSize: '18px' }} />}
                    onClick={() => setIsStartShiftModalVisible(true)}
                    loading={isStartingShift}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 border-0 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    block
                  >
                    {isStartingShift ? 'Starting Shift...' : 'Start New Shift'}
                  </Button>

                  {/* Quick Stats or Info */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-center items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <CalendarOutlined className="mr-1" />
                        Today
                      </span>
                      <span className="flex items-center">
                        <UserOutlined className="mr-1" />
                        Ready
                      </span>
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-1" />
                        All Set
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Section */}
            <div className="flex-1 bg-white rounded-lg p-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <EnvironmentOutlined className="text-blue-600 text-xl" style={{ fontSize: '28px', color: 'black' }} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {activeShift && activeShift.location ? 'Current Work Location' : 'Location Map'}
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  {activeShift && activeShift.location ? 
                    `Currently working at ${activeShift.location.name}` : 
                    'Real-time location tracking and monitoring'
                  }
                </p>
              </div>
              <div className="w-full h-full">
                <LocationMap 
                  currentLocation={activeShift && activeShift.location ? 
                    {
                      latitude: activeShift.location.latitude,
                      longitude: activeShift.location.longitude,
                      name: activeShift.location.name
                    } : 
                    currentLocation
                  } 
                />
              </div>
            </div>

            {/* Statistics Box - Individual Worker Stats */}
            <div className="flex-1 bg-white rounded-lg p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Statistics - {selectedMonth === 'current' ? 'Current Month' : 'Previous Month'}
                </h2>
                <p className="text-sm text-gray-600">Your work summary</p>
              </div>

              <div className="space-y-4">
                {/* Total Shifts */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <CalendarOutlined className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Total Shifts</p>
                        <p className="text-lg font-bold text-blue-900">{totalShifts}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Hours */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <ClockCircleOutlined className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">Total Hours</p>
                        <p className="text-lg font-bold text-green-900">{totalHours.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Shifts */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <CheckCircleOutlined className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Completed</p>
                        <p className="text-lg font-bold text-yellow-900">{completedShifts}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Hours */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <SaveOutlined className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Avg Hours</p>
                        <p className="text-lg font-bold text-purple-900">{avgHoursPerShift}h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second row containing the table and chart */}
          <div className="flex gap-4 h-full w-full gap-2 mt-6 flex-col ">
            {/* the chart box */}
            <div className="w-full flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BarChartOutlined className="text-blue-600 text-xl" style={{ fontSize: '28px', color: 'black' }} />
                    <h2 className="text-lg font-semibold text-gray-900">
                      My Work Hours Trend - {selectedMonth === 'current' ? 'Current Month' : 'Previous Month'}
                    </h2>
                  </div>
                  <Select
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    style={{ width: 150 }}
                    options={[
                      { value: 'current', label: 'Current Month' },
                      { value: 'previous', label: 'Previous Month' }
                    ]}
                  />
                </div>
                <p className="text-sm text-gray-600">Track your daily work hours over time</p>
              </div>
              <div className="h-full">
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
                      background: 'transparent'
                    },
                    dataLabels: {
                      enabled: false
                    },
                    stroke: {
                      curve: 'smooth',
                      width: 3
                    },
                    colors: ['#3B82F6'],
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.2,
                        stops: [0, 90, 100],
                        colorStops: [
                          {
                            offset: 0,
                            color: '#3B82F6',
                            opacity: 0.8
                          },
                          {
                            offset: 100,
                            color: '#3B82F6',
                            opacity: 0.1
                          }
                        ]
                      }
                    },
                    xaxis: {
                      categories: categories,
                      labels: {
                        style: {
                          colors: '#6B7280',
                          fontSize: '12px'
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
                        text: 'Hours Worked',
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
                          return val + ' hours';
                        }
                      }
                    },
                    legend: {
                      position: 'bottom',
                      horizontalAlign: 'left',
                      fontSize: '12px'
                    },
                    title: {
                      text: 'Daily Work Hours',
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

            {/* the table box */}
            <div className='w-full flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TableOutlined className="text-blue-600 text-xl" style={{ fontSize: '28px', color: 'black' }} />
                  <h2 className="text-lg font-semibold text-gray-900">My Shifts</h2>
                </div>
                <p className="text-sm text-gray-600">Track your individual shifts</p>
              </div>
              <Table
                columns={shiftTableColumns}
                dataSource={userShifts}
                rowKey="id"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: 'cursor-pointer hover:bg-blue-50 transition-colors duration-200'
                })}
                pagination={{
                  pageSize: 7,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                scroll={{ x: 600 }}
                size="small"
              />
            </div>
          </div>
        </div>

        {/* Start Shift Modal */}
        <Modal
          title="Start New Shift"
          open={isStartShiftModalVisible}
          onOk={handleStartShift}
          onCancel={() => {
            setIsStartShiftModalVisible(false);
            startShiftForm.resetFields();
          }}
          okText="Start Shift"
          cancelText="Cancel"
          confirmLoading={isStartingShift}
        >
          <Form form={startShiftForm} layout="vertical">
            <Form.Item
              name="locationId"
              label="Location (Optional)"
            >
              <Select
                placeholder="Select a location"
                allowClear
                options={locations.map(location => ({
                  value: location.id,
                  label: location.name
                }))}
              />
            </Form.Item>
            <Form.Item
              name="note"
              label="Note (Optional)"
            >
              <Input.TextArea
                rows={3}
                placeholder="Add a note about this shift..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Note Modal */}
        <Modal
          title="Edit Shift Note"
          open={isNoteModalVisible}
          onOk={handleUpdateNote}
          onCancel={() => {
            setIsNoteModalVisible(false);
            noteForm.resetFields();
          }}
          okText="Update Note"
          cancelText="Cancel"
        >
          <Form form={noteForm} layout="vertical">
            <Form.Item
              name="note"
              label="Note"
            >
              <Input.TextArea
                rows={4}
                placeholder="Add a note about this shift..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Shift Details Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-600" />
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
          width={600}
        >
          {selectedShift && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <CalendarOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedShift.day}</h3>
                  <p className="text-gray-600">{formatDate(selectedShift.date)}</p>
                  <Tag color={
                    selectedShift.status === 'COMPLETED' ? 'green' :
                      selectedShift.status === 'IN_PROGRESS' ? 'blue' :
                        selectedShift.status === 'SCHEDULED' ? 'orange' : 'gray'
                  }>
                    {selectedShift.status === 'COMPLETED' ? 'Completed' :
                      selectedShift.status === 'IN_PROGRESS' ? 'In Progress' :
                        selectedShift.status === 'SCHEDULED' ? 'Scheduled' : selectedShift.status}
                  </Tag>
                </div>
              </div>

              {/* Shift Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined className="text-blue-600" />
                    <span className="font-medium">Time:</span>
                  </div>
                  <p className="text-gray-600 ml-6">
                    {formatTime(selectedShift.startTime)} - {selectedShift.endTime ? formatTime(selectedShift.endTime) : 'Ongoing'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <SaveOutlined className="text-blue-600" />
                    <span className="font-medium">Total Hours:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{selectedShift.totalHours || 0} hours</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-blue-600" />
                    <span className="font-medium">Location:</span>
                  </div>
                  <p className="text-gray-600 ml-6">{selectedShift.location?.name || 'No location specified'}</p>
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
                  <span className="font-medium">Note:</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg ml-6">
                  <p className="text-gray-700">
                    {selectedShift.note || 'No notes available for this shift.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  );
} 