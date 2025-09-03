import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, FileText, Settings, MessageSquare, Users, 
  Car, MapPin, LogOut, Menu, X, Bell, User, ChevronDown, Globe, TrendingUp,
  Clock, CheckCircle, AlertTriangle, Eye, Phone, Mail, Edit, Archive, Plus,
  BarChart3, Activity, RefreshCw, RotateCcw, Search, Moon, Sun, DollarSign
} from 'lucide-react';
import { useAuth } from '../../components/Login';
import DataService from '../../components/services/DataService.jsx';

const CombinedDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalCars: 0,
      totalTours: 0,
      totalBookings: 0,
      pendingBookings: 0,
      totalMessages: 0,
      newMessages: 0
    },
    recentBookings: [],
    recentMessages: []
  });
  const [recentCars, setRecentCars] = useState([]);
  const [recentTours, setRecentTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get the current path from location or use dashboard as default
  const currentPath = location.pathname;
  
  // Extract the active view from the path or default to dashboard
  // This will be used to determine which content to show
  const getActiveView = (path) => {
    if (path === '/owner' || path === '/owner/dashboard') return 'dashboard';
    
    const segments = path.split('/');
    // Get the last segment of the path, or second-to-last if the last is empty
    const lastSegment = segments[segments.length - 1] || segments[segments.length - 2];
    
    // Extract the view name from path segments
    if (segments.includes('manage-cars')) return 'manage-cars';
    if (segments.includes('manage-tours')) return 'manage-tours';
    if (segments.includes('manage-bookings')) return 'manage-bookings';
    if (segments.includes('reports')) return 'reports';
    if (segments.includes('content-management')) return 'content-management';
    if (segments.includes('messages')) return 'messages';
    if (segments.includes('employee-management')) return 'employee-management';
    if (segments.includes('customer-view')) return 'customer-view';
    
    // Default to dashboard
    return 'dashboard';
  };
  
  const [activeView, setActiveView] = useState(getActiveView(currentPath));

  // Update active view when location changes
  useEffect(() => {
    setActiveView(getActiveView(currentPath));
  }, [currentPath]);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/owner', 
      view: 'dashboard',
      icon: LayoutDashboard,
      current: activeView === 'dashboard',
    },
    { 
      name: 'Manage Cars', 
      href: '/owner/manage-cars', 
      view: 'manage-cars',
      icon: Car,
      current: activeView === 'manage-cars',
      badge: 0
    },
    { 
      name: 'Manage Tours', 
      href: '/owner/manage-tours', 
      view: 'manage-tours',
      icon: MapPin,
      current: activeView === 'manage-tours',
      badge: 0
    },
    { 
      name: 'Manage Bookings', 
      href: '/owner/manage-bookings', 
      view: 'manage-bookings',
      icon: Calendar,
      current: activeView === 'manage-bookings',
      badge: notifications.filter(n => n.type === 'booking').length
    },
    { 
      name: 'Reports', 
      href: '/owner/reports', 
      view: 'reports',
      icon: FileText,
      current: activeView === 'reports',
      badge: 0
    },
    { 
      name: 'Content Management', 
      href: '/owner/content-management', 
      view: 'content-management',
      icon: Settings,
      current: activeView === 'content-management',
      badge: 0
    },
    { 
      name: 'Messages', 
      href: '/owner/messages', 
      view: 'messages',
      icon: MessageSquare,
      current: activeView === 'messages',
      badge: notifications.filter(n => n.type === 'message').length
    },
    { 
      name: 'Employee Management', 
      href: '/owner/employee-management', 
      view: 'employee-management',
      icon: Users,
      current: activeView === 'employee-management',
      badge: 0
    },
    { 
      name: 'Customer View', 
      href: '/owner/customer-view', 
      view: 'customer-view',
      icon: Globe,
      current: activeView === 'customer-view',
      badge: 0
    }
  ];

  // Dashboard data fetching
  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data from database');

      // Fetch all data in parallel
      const [analyticsResponse, carsResponse, toursResponse] = await Promise.all([
        DataService.fetchDashboardAnalytics(),
        DataService.fetchAllCars({ page: 1, limit: 10 }),
        DataService.fetchAllTours({ page: 1, limit: 10 })
      ]);
      
      if (analyticsResponse.success && analyticsResponse.data) {
        const summary = analyticsResponse.data.summary || {
          totalCars: 0,
          totalTours: 0,
          totalBookings: 0,
          pendingBookings: 0,
          totalMessages: 0,
          newMessages: 0
        };

        const recentBookings = Array.isArray(analyticsResponse.data.recentBookings) 
          ? analyticsResponse.data.recentBookings 
          : [];

        const recentMessages = Array.isArray(analyticsResponse.data.recentMessages) 
          ? analyticsResponse.data.recentMessages 
          : [];

        setDashboardData({
          summary,
          recentBookings: recentBookings.slice(0, 5),
          recentMessages: recentMessages.slice(0, 5)
        });
      }

      // Set recent cars and tours
      if (carsResponse.success) {
        setRecentCars(carsResponse.data || []);
      }

      if (toursResponse.success) {
        setRecentTours(toursResponse.data || []);
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message);
      
      // Set safe fallback data
      setDashboardData({
        summary: {
          totalCars: 0,
          totalTours: 0,
          totalBookings: 0,
          pendingBookings: 0,
          totalMessages: 0,
          newMessages: 0
        },
        recentBookings: [],
        recentMessages: []
      });
      setRecentCars([]);
      setRecentTours([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only load dashboard data when viewing the dashboard
    if (activeView === 'dashboard') {
      fetchDashboardData();
    }
    
    // Simulate notifications - in real app, fetch from API
    setNotifications([
      { id: 1, type: 'booking', message: 'New booking received from John Doe', time: '5 min ago', read: false },
      { id: 2, type: 'message', message: 'Customer inquiry about weekend tours', time: '10 min ago', read: false },
      { id: 3, type: 'system', message: 'System update completed successfully', time: '1 hour ago', read: true },
    ]);
  }, [activeView]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
      confirmed: { color: 'bg-emerald-100 text-emerald-800', label: 'Confirmed' },
      cancelled: { color: 'bg-rose-100 text-rose-800', label: 'Cancelled' },
      completed: { color: 'bg-sky-100 text-sky-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} inline-flex items-center gap-1`}>
        {status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  const handleArchiveCar = async (carId) => {
    try {
      await DataService.updateCar(carId, { available: false });
      setRecentCars(prev => prev.map(car => 
        car._id === carId ? { ...car, available: false } : car
      ));
      fetchDashboardData(true);
    } catch (error) {
      console.error('❌ Error archiving car:', error);
    }
  };

  const handleArchiveTour = async (tourId) => {
    try {
      await DataService.updateTour(tourId, { available: false });
      setRecentTours(prev => prev.map(tour => 
        tour._id === tourId ? { ...tour, available: false } : tour
      ));
      fetchDashboardData(true);
    } catch (error) {
      console.error('❌ Error archiving tour:', error);
    }
  };

  const handleRestoreCar = async (carId) => {
    try {
      await DataService.updateCar(carId, { available: true });
      setRecentCars(prev => prev.map(car => 
        car._id === carId ? { ...car, available: true } : car
      ));
      fetchDashboardData(true);
    } catch (error) {
      console.error('❌ Error restoring car:', error);
    }
  };

  const handleRestoreTour = async (tourId) => {
    try {
      await DataService.updateTour(tourId, { available: true });
      setRecentTours(prev => prev.map(tour => 
        tour._id === tourId ? { ...tour, available: true } : tour
      ));
      fetchDashboardData(true);
    } catch (error) {
      console.error('❌ Error restoring tour:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (href, view) => {
    navigate(href);
    setActiveView(view);
    setSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd apply dark mode classes or context here
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Loading state for initial data fetch
  if (loading && activeView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md mx-auto">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-100"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Dashboard</h3>
          <p className="text-slate-500 text-sm">Fetching your latest business data...</p>
        </div>
      </div>
    );
  }
  
  // Different content views based on the active menu item
  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'manage-cars':
        return renderManageCarsView();
      case 'manage-tours':
        return renderManageToursView();
      case 'manage-bookings':
        return renderManageBookingsView();
      case 'reports':
        return renderReportsView();
      case 'content-management':
        return renderContentManagementView();
      case 'messages':
        return renderMessagesView();
      case 'employee-management':
        return renderEmployeeManagementView();
      case 'customer-view':
        return renderCustomerView();
      default:
        return renderDashboardView();
    }
  };
  
  // Render functions for each view
  
  const renderDashboardView = () => {
    return (
      <div className="bg-slate-50/70">
        <div className="max-w-full mx-auto p-4 space-y-5">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-5 shadow-lg mt-1">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="2" />
                <path d="M0,0 C50,50 50,50 100,0" fill="none" stroke="white" strokeWidth="2" />
                <path d="M0,100 C50,50 50,50 100,100" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="25" cy="25" r="10" fill="white" />
                <circle cx="75" cy="75" r="10" fill="white" />
              </svg>
            </div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
                <p className="text-indigo-100 text-base">
                  Welcome back! Get a comprehensive overview of your travel business metrics.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium mb-2 text-indigo-100 backdrop-blur-sm bg-white/10 inline-block py-1 px-3 rounded-lg">
                  {new Date().toLocaleDateString('en-PH', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <button
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg ml-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-rose-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-rose-800">Database Connection Error</p>
                  <p className="text-rose-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              {
                title: 'Total Cars',
                value: dashboardData.summary.totalCars || 0,
                icon: Car,
                color: 'from-sky-500 to-blue-600',
                iconBg: 'bg-blue-500/20',
                iconColor: 'text-blue-600',
                link: '/owner/manage-cars'
              },
              {
                title: 'Total Tours',
                value: dashboardData.summary.totalTours || 0,
                icon: MapPin,
                color: 'from-emerald-500 to-green-600',
                iconBg: 'bg-emerald-500/20',
                iconColor: 'text-emerald-600',
                link: '/owner/manage-tours'
              },
              {
                title: 'Total Bookings',
                value: dashboardData.summary.totalBookings || 0,
                icon: Calendar,
                color: 'from-violet-500 to-purple-600',
                iconBg: 'bg-violet-500/20',
                iconColor: 'text-violet-600',
                link: '/owner/manage-bookings'
              },
              {
                title: 'Pending Bookings',
                value: dashboardData.summary.pendingBookings || 0,
                icon: Clock,
                color: 'from-amber-500 to-orange-600',
                iconBg: 'bg-amber-500/20',
                iconColor: 'text-amber-600',
                link: '/owner/manage-bookings'
              },
              {
                title: 'Total Messages',
                value: dashboardData.summary.totalMessages || 0,
                icon: MessageSquare,
                color: 'from-pink-500 to-rose-600',
                iconBg: 'bg-pink-500/20',
                iconColor: 'text-pink-600',
                link: '/owner/messages'
              },
              {
                title: 'New Messages',
                value: dashboardData.summary.newMessages || 0,
                icon: Mail,
                color: 'from-indigo-500 to-blue-600',
                iconBg: 'bg-indigo-500/20',
                iconColor: 'text-indigo-600',
                link: '/owner/messages'
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200/70 p-4 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 group"
                onClick={() => handleNavigation(stat.link, stat.link.split('/').pop())}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`w-10 h-10 flex items-center justify-center opacity-10 group-hover:opacity-20`}>
                    <stat.icon className={`w-8 h-8 text-slate-900`} />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                </div>
                <div className={`h-1 w-full mt-3 rounded-full bg-gradient-to-r ${stat.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { 
                  label: 'Add New Car', 
                  icon: Plus, 
                  color: 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
                  link: '/owner/manage-cars',
                  view: 'manage-cars'
                },
                { 
                  label: 'Create Tour', 
                  icon: Plus, 
                  color: 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
                  link: '/owner/manage-tours',
                  view: 'manage-tours'
                },
                { 
                  label: 'View Bookings', 
                  icon: Eye, 
                  color: 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
                  link: '/owner/manage-bookings',
                  view: 'manage-bookings'
                },
                { 
                  label: 'Generate Reports', 
                  icon: BarChart3, 
                  color: 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
                  link: '/owner/reports',
                  view: 'reports'
                }
              ].map((action, index) => (
                <button 
                  key={index}
                  onClick={() => handleNavigation(action.link, action.view)}
                  className={`${action.color} text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 transform hover:scale-[1.02]`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Cars */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 border-b-blue-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Recent Cars ({recentCars.length})
                  </h3>
                  <button 
                    onClick={() => handleNavigation('/owner/manage-cars', 'manage-cars')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Manage All
                  </button>
                </div>
              </div>

              <div className="p-4">
                {recentCars.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentCars.slice(0, 5).map((car) => (
                      <div key={car._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
                            {car.brand} {car.model} ({car.year})
                          </div>
                          <div className="text-sm text-slate-600 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {car.location} 
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> {formatCurrency(car.pricePerDay)}/day
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            car.available 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {car.available ? (
                              <><CheckCircle className="w-3 h-3" /> Available</>
                            ) : (
                              <><AlertTriangle className="w-3 h-3" /> Unavailable</>
                            )}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleNavigation('/owner/manage-cars', 'manage-cars')}
                              className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit car"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {car.available ? (
                              <button
                                onClick={() => handleArchiveCar(car._id)}
                                className="text-amber-600 hover:text-amber-800 p-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Archive car"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreCar(car._id)}
                                className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Restore car"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Car className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Cars Found</h3>
                    <p className="text-slate-500 mb-4 max-w-sm mx-auto">Add your first vehicle to your fleet and start accepting bookings.</p>
                    <button 
                      onClick={() => handleNavigation('/owner/manage-cars', 'manage-cars')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Car
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tours */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 border-b-emerald-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Recent Tours ({recentTours.length})
                  </h3>
                  <button 
                    onClick={() => handleNavigation('/owner/manage-tours', 'manage-tours')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Manage All
                  </button>
                </div>
              </div>

              <div className="p-4">
                {recentTours.length > 0 ? (
                  <div className="space-y-2.5">
                    {recentTours.slice(0, 5).map((tour) => (
                      <div key={tour._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {tour.title || tour.name}
                          </div>
                          <div className="text-sm text-slate-600 flex items-center flex-wrap gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {tour.destination} 
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {tour.duration}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> {formatCurrency(tour.price)}/person
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            tour.available 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {tour.available ? (
                              <><CheckCircle className="w-3 h-3" /> Available</>
                            ) : (
                              <><AlertTriangle className="w-3 h-3" /> Unavailable</>
                            )}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleNavigation('/owner/manage-tours', 'manage-tours')}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Edit tour"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {tour.available ? (
                              <button
                                onClick={() => handleArchiveTour(tour._id)}
                                className="text-amber-600 hover:text-amber-800 p-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Archive tour"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreTour(tour._id)}
                                className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Restore tour"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="bg-emerald-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Tours Found</h3>
                    <p className="text-slate-500 mb-4 max-w-sm mx-auto">Create your first tour package to attract more customers.</p>
                    <button 
                      onClick={() => handleNavigation('/owner/manage-tours', 'manage-tours')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Tour
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-violet-50 border-b-purple-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-600" />
                    Recent Bookings ({dashboardData.recentBookings.length})
                  </h3>
                  <button 
                    onClick={() => handleNavigation('/owner/manage-bookings', 'manage-bookings')}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View All
                  </button>
                </div>
              </div>
              <div className="p-4">
                {dashboardData.recentBookings.length > 0 ? (
                  <div className="space-y-2.5">
                    {dashboardData.recentBookings.map((booking) => (
                      <div key={booking._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">
                            {booking.firstName} {booking.lastName}
                          </div>
                          <div className="text-sm text-slate-600 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              {booking.type === 'car' ? <Car className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                              {booking.itemName}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> {formatCurrency(booking.totalPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="bg-violet-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-7 h-7 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Recent Bookings</h3>
                    <p className="text-slate-500">Your recent bookings will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 border-b-pink-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                    Recent Messages ({dashboardData.recentMessages.length})
                  </h3>
                  <button 
                    onClick={() => handleNavigation('/owner/messages', 'messages')}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View All
                  </button>
                </div>
              </div>
              <div className="p-4">
                {dashboardData.recentMessages.length > 0 ? (
                  <div className="space-y-2.5">
                    {dashboardData.recentMessages.map((message) => (
                      <div key={message._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-pink-700 transition-colors flex items-center">
                            {message.name}
                            {message.status === 'new' && (
                              <span className="ml-2 inline-block w-2 h-2 bg-pink-500 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> {message.subject}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            message.status === 'new' 
                              ? 'bg-pink-100 text-pink-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {message.status === 'new' ? 'New' : 'Read'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="bg-pink-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-7 h-7 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Recent Messages</h3>
                    <p className="text-slate-500">Your recent messages will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Placeholder views for other sections
  // In a real app, these would be fully implemented components

  const renderManageCarsView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Manage Cars</h1>
              <p className="text-blue-100 text-base max-w-3xl">
                Add, edit, and manage your fleet of cars available for rental.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Car className="w-64 h-64" />
            </div>
          </div>
          
          {/* Car Management Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Your Car Inventory</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" /> Add New Car
              </button>
            </div>
            
            {/* Placeholder car management interface */}
            <div className="text-center py-16">
              <Car className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Car Management Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your car management interface with tables, filters, and actions to manage your car inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManageToursView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Manage Tours</h1>
              <p className="text-emerald-100 text-base max-w-3xl">
                Create and manage tour packages, itineraries, and destinations.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <MapPin className="w-64 h-64" />
            </div>
          </div>
          
          {/* Tour Management Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tour Packages</h2>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" /> Create New Tour
              </button>
            </div>
            
            {/* Placeholder tour management interface */}
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Tour Management Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your tour management interface with packages, destinations, and itineraries.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManageBookingsView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Manage Bookings</h1>
              <p className="text-violet-100 text-base max-w-3xl">
                Track and manage all bookings for cars and tours.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Calendar className="w-64 h-64" />
            </div>
          </div>
          
          {/* Bookings Management Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Booking Requests</h2>
              <div className="flex gap-3">
                <button className="bg-violet-100 text-violet-700 hover:bg-violet-200 px-4 py-2 rounded-lg font-medium">
                  Filter
                </button>
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium">
                  Export Data
                </button>
              </div>
            </div>
            
            {/* Placeholder bookings interface */}
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Bookings Management Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your bookings management interface with tables, status updates, and booking details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportsView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Reports & Analytics</h1>
              <p className="text-amber-100 text-base max-w-3xl">
                Generate and view reports on your business performance.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <BarChart3 className="w-64 h-64" />
            </div>
          </div>
          
          {/* Reports Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Business Reports</h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                  <option>This Year</option>
                  <option>Custom Range</option>
                </select>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium">
                  Generate Report
                </button>
              </div>
            </div>
            
            {/* Placeholder reports interface */}
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Reports & Analytics Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your business analytics, charts, and financial reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentManagementView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Content Management</h1>
              <p className="text-slate-200 text-base max-w-3xl">
                Manage website content, images, and promotional materials.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Settings className="w-64 h-64" />
            </div>
          </div>
          
          {/* Content Management Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Website Content</h2>
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" /> Add New Content
              </button>
            </div>
            
            {/* Placeholder content management interface */}
            <div className="text-center py-16">
              <Settings className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Content Management Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your content management interface for website pages, images, and promotional materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessagesView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Messages</h1>
              <p className="text-pink-100 text-base max-w-3xl">
                Manage customer inquiries and communications.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <MessageSquare className="w-64 h-64" />
            </div>
          </div>
          
          {/* Messages Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Customer Inquiries</h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">
                  <option>All Messages</option>
                  <option>Unread</option>
                  <option>Archived</option>
                </select>
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium">
                  Compose Message
                </button>
              </div>
            </div>
            
            {/* Placeholder messages interface */}
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Messages Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your message management interface with inbox, sent items, and message compose functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeeManagementView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Employee Management</h1>
              <p className="text-indigo-100 text-base max-w-3xl">
                Manage staff, roles, and permissions.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Users className="w-64 h-64" />
            </div>
          </div>
          
          {/* Employee Management Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Staff Directory</h2>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" /> Add New Employee
              </button>
            </div>
            
            {/* Placeholder employee management interface */}
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Employee Management Interface</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain your employee management interface with staff directory, roles, and permission settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerView = () => {
    return (
      <div className="bg-slate-50/70 min-h-screen">
        <div className="max-w-full mx-auto p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-800 rounded-xl p-5 shadow-lg mt-1 mb-6">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Customer View</h1>
              <p className="text-cyan-100 text-base max-w-3xl">
                Preview how your website looks to customers.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Globe className="w-64 h-64" />
            </div>
          </div>
          
          {/* Customer View Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/70 p-5 mb-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Website Preview</h2>
              <div className="flex gap-3">
                <select className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">
                  <option>Desktop View</option>
                  <option>Mobile View</option>
                  <option>Tablet View</option>
                </select>
                // ... continuing the renderCustomerView function
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium">
                  Open in New Tab
                </button>
              </div>
            </div>
            
            {/* Placeholder customer view interface */}
            <div className="text-center py-16">
              <Globe className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Customer Website Preview</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                This section would contain an interactive preview of how your website appears to customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50/70 ${darkMode ? 'dark' : ''} flex`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar - Fixed sidebar that stays in place */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:w-64 lg:flex-none`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-indigo-600 font-bold text-xl">D</span>
              </div>
              <span className="ml-3 text-white font-semibold text-lg">DoRayd Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-indigo-100 p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Navigation - Fixed the spacing issue by removing unnecessary padding */}
          <nav className="mt-2 px-3 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href, item.view)}
                    className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      item.current
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
                    }`}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                    }`} />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Settings section - Reduced spacing */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-1 space-y-1">
                <button 
                  onClick={() => handleNavigation('/owner/profile', 'profile')}
                  className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                >
                  <User className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                  <span className="flex-1 text-left">Account Settings</span>
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                >
                  {darkMode ? (
                    <Sun className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                  ) : (
                    <Moon className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                  )}
                  <span className="flex-1 text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </nav>

          {/* User info at bottom */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white">
                <span className="font-semibold">{user?.firstName?.charAt(0) || 'B'}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.firstName} {user?.lastName || 'BlueDrinkingWater'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@dorayd.com'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - Adjusted to properly align with sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200/75 backdrop-blur-md bg-white/90">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-bold text-slate-800">
                {navigation.find(item => item.current)?.name || 'Dashboard'}
              </h1>
              <div className="hidden lg:flex ml-4 text-xs font-medium text-slate-500 items-center">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">v1.2.0</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      <button 
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all as read
                      </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-slate-50 ${!notification.read ? 'bg-indigo-50/50' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'booking' ? 'bg-violet-100 text-violet-600' :
                                notification.type === 'message' ? 'bg-emerald-100 text-emerald-600' : 
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {notification.type === 'booking' && <Calendar className="w-4 h-4" />}
                                {notification.type === 'message' && <MessageSquare className="w-4 h-4" />}
                                {notification.type === 'system' && <Bell className="w-4 h-4" />}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-slate-800 font-medium mb-0.5">{notification.message}</p>
                                <span className="text-xs text-slate-500">{notification.time}</span>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-slate-500 text-sm">
                          No notifications yet
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-100 mt-1 pt-2 px-4 py-2">
                      <button 
                        className="w-full text-center text-xs text-indigo-600 font-medium hover:text-indigo-800"
                        onClick={() => handleNavigation('/owner/notifications', 'notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <span className="font-semibold">{user?.firstName?.charAt(0) || 'B'}</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName || 'BlueDrinkingWater'}
                  </span>
                  <ChevronDown className="w-4 h-4 hidden md:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.firstName || 'BlueDrinking'} {user?.lastName || 'Water'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@dorayd.com'}</p>
                      <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Administrator
                      </span>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => handleNavigation('/owner/profile', 'profile')}
                        className="flex w-full items-center text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 mr-3 text-slate-500" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => handleNavigation('/customer-dashboard', 'customer-view')}
                        className="flex w-full items-center text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Globe className="w-4 h-4 mr-3 text-slate-500" />
                        View Customer Site
                      </button>
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-1">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200/75 py-3 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <div className="mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} DoRayd Travel & Tours. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white text-xs px-2.5 py-1.5 rounded opacity-75">
          User: BlueDrinkingWater | {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CombinedDashboardLayout;
