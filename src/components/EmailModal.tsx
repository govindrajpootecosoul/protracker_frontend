import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Mail, Send, User, Users, FileText, MessageSquare, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';
import { EmailsChipsInput } from './EmailsChipsInput';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { to: string | string[]; cc?: string | string[]; subject?: string; regards?: string; department?: string; employeeId?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const EmailModal = ({ isOpen, onClose, onSend, isLoading = false }: EmailModalProps) => {
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [toList, setToList] = useState<string[]>([]);
  const [ccList, setCcList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [regards, setRegards] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [errors, setErrors] = useState<{ to?: string; cc?: string }>({});

  // Check role - no lowercase conversion needed as role should be exact match
  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  // Always log in development to debug
  console.log('🔍 EmailModal Debug:', {
    user: user,
    userRole: user?.role,
    roleType: typeof user?.role,
    isSuperadmin,
    isAdmin,
    isOpen,
    'shouldShowDepartment': isSuperadmin && isOpen,
    'shouldShowEmployee': isAdmin && isOpen
  });

  // Fetch all departments for superadmin
  const { data: departments, isLoading: departmentsLoading, error: departmentsError } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentService.list();
      return response.data || [];
    },
    enabled: isSuperadmin && isOpen,
  });

  // Fetch employees for admin (filtered by department)
  const { data: employeesResponse, isLoading: employeesLoading, error: employeesError } = useQuery({
    queryKey: ['employees', user?.department],
    queryFn: async () => {
      const response = await employeeService.list({
        department: user?.department || undefined,
        role: 'user',
      });
      return response.data || [];
    },
    enabled: isAdmin && isOpen && !!user?.department,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const employees = (employeesResponse || []) as any[];
  const departmentsArray = (departments || []) as any[];

  const handleSend = async () => {
    const newErrors: { to?: string; cc?: string } = {};

    // Validate TO
    if (!toList || toList.length === 0) {
      newErrors.to = 'TO email is required';
    } else {
      const invalidToEmails = toList.filter(e => !validateEmail(e));
      if (invalidToEmails.length > 0) newErrors.to = `Invalid email(s): ${invalidToEmails.join(', ')}`;
    }

    // Validate CC if provided
    if (ccList && ccList.length > 0) {
      const invalidCcEmails = ccList.filter(e => !validateEmail(e));
      if (invalidCcEmails.length > 0) newErrors.cc = `Invalid email(s): ${invalidCcEmails.join(', ')}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    await onSend({
      to: toList.length === 1 ? toList[0] : toList,
      cc: ccList.length > 0 ? (ccList.length === 1 ? ccList[0] : ccList) : undefined,
      subject: subject.trim() || undefined,
      regards: regards.trim() || undefined,
      department: isSuperadmin && selectedDepartment ? selectedDepartment : undefined,
      employeeId: isAdmin && selectedEmployeeId ? selectedEmployeeId : undefined,
    });
  };

  const handleClose = () => {
    setToList([]);
    setCcList([]);
    setSubject('');
    setRegards('');
    setSelectedDepartment('');
    setSelectedEmployeeId('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl"
        >
          <GlassCard className="p-0 relative max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-gradient-to-r from-ncsBlue-500/10 to-ncsBlue-600/10">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <X size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
              </button>

              <div className="flex items-start gap-4 pr-10">
                <div className="p-3 rounded-xl bg-gradient-to-br from-ncsBlue-500 to-ncsBlue-600 shadow-lg shadow-ncsBlue-500/20">
                  <Mail className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-ncsBlue-500 via-ncsBlue-600 to-ncsBlue-700 dark:from-ncsBlue-400 dark:via-ncsBlue-500 dark:to-ncsBlue-600 bg-clip-text text-transparent mb-1">
                    Send Tasks Email
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {isSuperadmin 
                      ? 'Send in-progress tasks by department in a formatted email'
                      : isAdmin 
                      ? 'Send in-progress tasks from your department or specific employee'
                      : 'Send your in-progress tasks in a formatted email'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Superadmin: Department Filter */}
                {isSuperadmin && (
                  <div className="space-y-2 border-2 border-blue-500 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                      ✅ SUPERADMIN DETECTED - Department Filter Active
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <Building2 size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                      <span className="text-gray-900 dark:text-gray-100">Department</span>
                      <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                        isDark
                          ? 'bg-slate-700/90 border-slate-600 text-white'
                          : 'bg-slate-50/90 border-slate-300 text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500'
                      )}
                      disabled={isLoading || departmentsLoading}
                    >
                      <option value="">All Departments</option>
                      {departmentsLoading && <option disabled>Loading departments...</option>}
                      {!departmentsLoading && Array.isArray(departmentsArray) && departmentsArray.length > 0 && departmentsArray.map((dept: any) => (
                        <option key={dept._id || dept.name} value={dept.name || dept._id}>
                          {dept.name}
                        </option>
                      ))}
                      {!departmentsLoading && (!departmentsArray || departmentsArray.length === 0) && (
                        <option disabled>No departments found</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Select a department to filter in-progress tasks. Leave empty to get all departments.
                    </p>
                    {departmentsError && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Error loading departments: {departmentsError.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Admin: Employee Selector */}
                {isAdmin && (
                  <div className="space-y-2 border-2 border-green-500 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                    <div className="text-xs font-bold text-green-700 dark:text-green-300 mb-2">
                      ✅ ADMIN DETECTED - Employee Selector Active
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <User size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                      <span className="text-gray-900 dark:text-gray-100">Employee</span>
                      <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                    </label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                        isDark
                          ? 'bg-slate-700/90 border-slate-600 text-white'
                          : 'bg-slate-50/90 border-slate-300 text-gray-900',
                        'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500'
                      )}
                      disabled={isLoading || employeesLoading}
                    >
                      <option value="">All Employees in {user?.department || 'Department'}</option>
                      {employeesLoading && <option disabled>Loading employees...</option>}
                      {!employeesLoading && Array.isArray(employees) && employees.length > 0 && employees.map((employee: any) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.email})
                        </option>
                      ))}
                      {!employeesLoading && (!employees || employees.length === 0) && (
                        <option disabled>No employees found in your department</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Select a specific employee to send their in-progress tasks only. Leave empty to send all tasks from your department ({user?.department}).
                    </p>
                    {employeesError && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Error loading employees: {employeesError.message}
                      </p>
                    )}
                    {!user?.department && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Warning: Your account doesn't have a department assigned. Please contact an administrator.
                      </p>
                    )}
                  </div>
                )}

                {/* TO Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <User size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                    <span className="text-gray-900 dark:text-gray-100">To Recipients</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">*</span>
                  </label>
                  <div className="mt-1">
                    <EmailsChipsInput
                      label=""
                      required
                      value={toList}
                      onChange={(next) => {
                        setToList(next);
                        if (errors.to) setErrors({ ...errors, to: undefined });
                      }}
                      placeholder="Add recipient and press Enter"
                      helperText="Type an address and press Enter, comma, or paste multiple."
                      error={errors.to}
                      disabled={isLoading}
                      dark={isDark}
                    />
                  </div>
                </div>

                {/* CC Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <Users size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                    <span className="text-gray-900 dark:text-gray-100">CC Recipients</span>
                    <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                  </label>
                  <div className="mt-1">
                    <EmailsChipsInput
                      label=""
                      value={ccList}
                      onChange={(next) => {
                        setCcList(next);
                        if (errors.cc) setErrors({ ...errors, cc: undefined });
                      }}
                      placeholder="Add CC and press Enter"
                      helperText="Optional. Press Enter/comma to add multiple."
                      error={errors.cc}
                      disabled={isLoading}
                      dark={isDark}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <FileText size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                    <span className="text-gray-900 dark:text-gray-100">Subject</span>
                    <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="In-Progress Tasks Report"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                      isDark
                        ? 'bg-slate-700/90 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-slate-50/90 border-slate-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500',
                      'hover:border-ncsBlue-400/50'
                    )}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Leave empty to use default: "In-Progress Tasks - X Task(s)"
                  </p>
                </div>

                {/* Regards */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <MessageSquare size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                    <span className="text-gray-900 dark:text-gray-100">Closing Message</span>
                    <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={regards}
                    onChange={(e) => setRegards(e.target.value)}
                    placeholder="Best regards,&#10;Your Name"
                    rows={4}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none',
                      isDark
                        ? 'bg-slate-700/90 border-slate-600 text-white placeholder-gray-400'
                        : 'bg-slate-50/90 border-slate-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm',
                      'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500',
                      'hover:border-ncsBlue-400/50'
                    )}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Custom closing message that will appear at the end of the email
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-ncsBlue-500/5 to-ncsBlue-600/5">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className={cn(
                    'px-5 py-2.5 rounded-xl font-medium transition-all duration-200',
                    'hover:bg-white/10 dark:hover:bg-gray-700/50',
                    isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900',
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || toList.length === 0}
                  className={cn(
                    'px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200',
                    'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600',
                    'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
                    'shadow-lg shadow-ncsBlue-500/30',
                    'flex items-center gap-2',
                    ((toList.length === 0) || isLoading) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-xl hover:shadow-ncsBlue-500/40 active:scale-95'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

