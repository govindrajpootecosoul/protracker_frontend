import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, FolderKanban, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardService } from '@/services/dashboardService';
import { companyService } from '@/services/companyService';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';
import { GlassCard } from '@/components/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const StatCard = ({ icon: Icon, label, value, color = 'ncsBlue' }: { icon: any; label: string; value: number | string; color?: string }) => {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    brightPink: { bg: 'bg-brightPink-500/20', text: 'text-brightPink-500' },
    coral: { bg: 'bg-coral-500/20', text: 'text-coral-500' },
    mantis: { bg: 'bg-mantis-500/20', text: 'text-mantis-500' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
    lightSeaGreen: { bg: 'bg-lightSeaGreen-500/20', text: 'text-lightSeaGreen-500' },
    ncsBlue: { bg: 'bg-ncsBlue-500/20', text: 'text-ncsBlue-500' },
    midnightGreen: { bg: 'bg-midnightGreen-500/20', text: 'text-midnightGreen-500' },
  };
  
  const colorClass = colorClasses[color || 'ncsBlue'] || colorClasses.ncsBlue;
  
  return (
    <GlassCard className={cn('hover:scale-105 transition-transform cursor-pointer')}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className={cn('text-2xl font-bold', colorClass.text)}>{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', colorClass.bg)}>
          <Icon size={24} className={cn(colorClass.text)} />
        </div>
      </div>
    </GlassCard>
  );
};

export const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [showInvitationBanner, setShowInvitationBanner] = useState(true);

  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const hasPendingInvitation = user?.hasPendingInvitation;

  // Fetch companies for superadmin filter
  const { data: companiesResponse } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companyService.list();
      return (response.data as any)?.data || response.data || [];
    },
    enabled: !!isSuperadmin,
  });
  const companies = (companiesResponse as any) || [];

  // Fetch departments based on company filter (for superadmin) or user's company (for admin)
  const { data: departmentsResponse } = useQuery({
    queryKey: ['departments', companyFilter || user?.company],
    queryFn: async () => {
      const response = await departmentService.list(companyFilter || user?.company || undefined);
      return (response.data as any)?.data || response.data || [];
    },
    enabled: !!(isSuperadmin || isAdmin),
  });
  const departments = (departmentsResponse as any) || [];

  // Fetch employees for filter
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', companyFilter || user?.company, departmentFilter || user?.department],
    queryFn: async () => {
      const response = await employeeService.list({
        company: companyFilter || user?.company || undefined,
        department: departmentFilter || user?.department || undefined,
      });
      return (response.data as any)?.data || [];
    },
    // For superadmin, only load after selecting a company; admins load immediately for their own company
    enabled: isAdmin || (isSuperadmin && !!companyFilter),
  });
  const employees = (employeesResponse as any) || [];

  // Build filters object
  const filters: { company?: string; department?: string; employee?: string } = {};
  if (isSuperadmin) {
    if (companyFilter) filters.company = companyFilter;
    if (departmentFilter) filters.department = departmentFilter;
    if (employeeFilter) filters.employee = employeeFilter;
  } else if (isAdmin) {
    // Admin filters: only employee filter
    if (employeeFilter) filters.employee = employeeFilter;
  }

  const { data: statsResp, isLoading } = useQuery({
    queryKey: ['dashboard-stats', companyFilter || '', departmentFilter || '', employeeFilter || ''],
    queryFn: async () => {
      const params: { company?: string; department?: string; employee?: string } = {};
      if (isSuperadmin) {
        if (companyFilter) params.company = companyFilter;
        if (departmentFilter) params.department = departmentFilter;
        if (employeeFilter) params.employee = employeeFilter;
      } else if (isAdmin) {
        if (employeeFilter) params.employee = employeeFilter;
      }
      // eslint-disable-next-line no-console
      if ((import.meta as any).env?.MODE === 'development') console.log('Dashboard → fetching stats with params:', params);
      const response = await dashboardService.getStats(params);
      return response.data; // inner data object
    },
  });

  // Optional: log when filters change (React Query refetches automatically via queryKey)
  useEffect(() => {
    // eslint-disable-next-line no-console
    if ((import.meta as any).env?.MODE === 'development') console.log('Dashboard → filters changed:', { companyFilter, departmentFilter, employeeFilter });
  }, [companyFilter, departmentFilter, employeeFilter]);

  // Reset employee filter when company or department changes to avoid cross-scope mixing
  useEffect(() => {
    if (employeeFilter) {
      setEmployeeFilter('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter, departmentFilter]);


  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i}>
              <div className="skeleton h-20 w-full"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  const stats = statsResp as any;

      return (
        <div className="p-6 space-y-6">
          {hasPendingInvitation && showInvitationBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <GlassCard className="bg-yellow-500/20 border-yellow-500/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/30">
                      <TrendingUp size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Pending Invitation</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        You have a pending invitation. Please check your email and accept it to access the resource.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInvitationBanner(false)}
                    className={cn('p-2 rounded-lg hover:bg-yellow-500/30 transition-colors')}
                  >
                    <span className="text-yellow-800 dark:text-yellow-200">×</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's what's happening.</p>
          </div>
          {(isSuperadmin || isAdmin) && (
            <div className="flex items-center gap-3 flex-wrap">
              {isSuperadmin && (
                <>
                  <select
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value);
                      setDepartmentFilter(''); // Reset department when company changes
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                    )}
                  >
                    <option value="">All Companies</option>
                    {(Array.isArray(companies) ? companies : []).map((c: any) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    disabled={!companyFilter}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-colors',
                      'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50',
                      !companyFilter && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <option value="">All Departments</option>
                    {(Array.isArray(departments) ? departments : []).map((d: any) => (
                      <option key={d._id || d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {isSuperadmin && (
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  disabled={!companyFilter}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50',
                    !companyFilter && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <option value="">All Employees</option>
                  {(Array.isArray(employees) ? employees : []).map((emp: any) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              )}
              {isAdmin && (
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg border transition-colors',
                    'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50'
                  )}
                >
                  <option value="">All Employees</option>
                  {(Array.isArray(employees) ? employees : []).map((emp: any) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              )}
              {(companyFilter || departmentFilter || employeeFilter) && (
                <button
                  onClick={() => {
                    setCompanyFilter('');
                    setDepartmentFilter('');
                    setEmployeeFilter('');
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold transition-colors',
                    'bg-gray-500/20 text-gray-700 dark:text-gray-300 hover:bg-gray-500/30'
                  )}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid - Show only: Total Brands, Total Projects, In Progress Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Building2}
          label="Total Brands"
          value={stats?.brands?.total ?? 0}
          color="brightPink"
        />
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats?.projects?.total ?? 0}
          color="ncsBlue"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress Tasks"
          value={stats?.tasks?.inProgress ?? 0}
          color="emerald"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

const RecentActivity = () => {
  const { data } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const resp = await dashboardService.getRecentActivity();
      return resp.data || [];
    },
  });

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      {data && Array.isArray(data) && data.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((log: any, idx: number) => (
            <div key={idx} className="py-3 flex items-center justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium capitalize">{log.action}</span>
                <span className="mx-1">•</span>
                <span className="capitalize">{log.entity}</span>
                {log.user?.name && (
                  <span className="text-gray-500 dark:text-gray-400"> by {log.user.name}</span>
                )}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {new Date(log.at || log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No recent activity yet.</p>
      )}
    </GlassCard>
  );
};

