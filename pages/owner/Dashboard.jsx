import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  Edit,
  Archive,
  Plus,
  BarChart3,
  Activity,
  MessageSquare,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataService from '../../components/services/DataService.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
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
    fetchDashboardData();
  }, []);

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
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Fetching data from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Manage your travel business efficiently
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold mb-2">
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
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <p className="font-medium text-red-800">Database Connection Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
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
              color: 'bg-blue-500',
              link: '/owner/manage-cars'
            },
            {
              title: 'Total Tours',
              value: dashboardData.summary.totalTours || 0,
              icon: MapPin,
              color: 'bg-green-500',
              link: '/owner/manage-tours'
            },
            {
              title: 'Total Bookings',
              value: dashboardData.summary.totalBookings || 0,
              icon: Calendar,
              color: 'bg-purple-500',
              link: '/owner/manage-bookings'
            },
            {
              title: 'Pending Bookings',
              value: dashboardData.summary.pendingBookings || 0,
              icon: Clock,
              color: 'bg-orange-500',
              link: '/owner/manage-bookings'
            },
            {
              title: 'Total Messages',
              value: dashboardData.summary.totalMessages || 0,
              icon: MessageSquare,
              color: 'bg-pink-500',
              link: '/owner/messages'
            },
            {
              title: 'New Messages',
              value: dashboardData.summary.newMessages || 0,
              icon: Mail,
              color: 'bg-indigo-500',
              link: '/owner/messages'
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add New Car', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700', link: '/owner/manage-cars' },
              { label: 'Create Tour', icon: Plus, color: 'bg-green-600 hover:bg-green-700', link: '/owner/manage-tours' },
              { label: 'View Bookings', icon: Eye, color: 'bg-purple-600 hover:bg-purple-700', link: '/owner/manage-bookings' },
              { label: 'Generate Reports', icon: BarChart3, color: 'bg-orange-600 hover:bg-orange-700', link: '/owner/reports' }
            ].map((action, index) => (
              <button 
                key={index}
                onClick={() => navigate(action.link)}
                className={`${action.color} text-white px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 transform hover:scale-105`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cars */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-blue-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  Recent Cars ({recentCars.length})
                </h3>
                <button 
                  onClick={() => navigate('/owner/manage-cars')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Manage All
                </button>
              </div>
            </div>

            <div className="p-4">
              {recentCars.length > 0 ? (
                <div className="space-y-3">
                  {recentCars.slice(0, 5).map((car) => (
                    <div key={car._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {car.brand} {car.model} ({car.year})
                        </div>
                        <div className="text-sm text-gray-600">
                          📍 {car.location} • 💰 {formatCurrency(car.pricePerDay)}/day
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          car.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {car.available ? '✅ Available' : '🔒 Unavailable'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate('/owner/manage-cars')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit car"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {car.available ? (
                            <button
                              onClick={() => handleArchiveCar(car._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Archive car"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreCar(car._id)}
                              className="text-green-600 hover:text-green-700 p-1"
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
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Cars Found</h3>
                  <p className="text-gray-600 mb-4">Add some cars to get started.</p>
                  <button 
                    onClick={() => navigate('/owner/manage-cars')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Car
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tours */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-green-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Recent Tours ({recentTours.length})
                </h3>
                <button 
                  onClick={() => navigate('/owner/manage-tours')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Manage All
                </button>
              </div>
            </div>

            <div className="p-4">
              {recentTours.length > 0 ? (
                <div className="space-y-3">
                  {recentTours.slice(0, 5).map((tour) => (
                    <div key={tour._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {tour.title || tour.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          🏝️ {tour.destination} • ⏱️ {tour.duration} • 💰 {formatCurrency(tour.price)}/person
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tour.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tour.available ? '✅ Available' : '🔒 Unavailable'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate('/owner/manage-tours')}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Edit tour"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {tour.available ? (
                            <button
                              onClick={() => handleArchiveTour(tour._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Archive tour"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreTour(tour._id)}
                              className="text-green-600 hover:text-green-700 p-1"
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
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tours Found</h3>
                  <p className="text-gray-600 mb-4">Add some tours to get started.</p>
                  <button 
                    onClick={() => navigate('/owner/manage-tours')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-purple-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Bookings ({dashboardData.recentBookings.length})
              </h3>
            </div>
            <div className="p-4">
              {dashboardData.recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          👤 {booking.firstName} {booking.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          🎯 {booking.itemName} • 💰 {formatCurrency(booking.totalPrice)}
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No recent bookings</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-pink-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-600" />
                Recent Messages ({dashboardData.recentMessages.length})
              </h3>
            </div>
            <div className="p-4">
              {dashboardData.recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentMessages.map((message) => (
                    <div key={message._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          👤 {message.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          📧 {message.subject}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        message.status === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.status === 'new' ? '🆕 New' : '📖 Read'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No recent messages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;