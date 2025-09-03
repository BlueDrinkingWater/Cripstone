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
