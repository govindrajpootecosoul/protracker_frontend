import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Building2, User, Users, FileText, MessageSquare, FolderKanban, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { taskService } from '@/services/taskService';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';
import { brandService } from '@/services/brandService';
import { projectService } from '@/services/projectService';
import { GlassCard } from '@/components/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import { EmailsChipsInput } from '@/components/EmailsChipsInput';

export const SendTasksEmail = () => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const [toList, setToList] = useState<string[]>([]);
  const [ccList, setCcList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [regards, setRegards] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [errors, setErrors] = useState<{ to?: string; cc?: string }>({});

  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';

  // Fetch all departments for superadmin
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentService.list();
      return response.data || [];
    },
    enabled: isSuperadmin,
  });

  // Fetch all brands
  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandService.getAll();
      return response.data || [];
    },
    enabled: isSuperadmin || isAdmin,
  });

  // Fetch projects for selected brand
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', selectedBrandId],
    queryFn: async () => {
      if (!selectedBrandId) return [];
      const response = await projectService.getByBrand(selectedBrandId);
      return response.data || [];
    },
    enabled: (isSuperadmin || isAdmin) && !!selectedBrandId,
  });

  // Fetch employees for superadmin (filtered by selected department)
  const { data: departmentEmployees, isLoading: deptEmployeesLoading } = useQuery({
    queryKey: ['department-employees', selectedDepartment],
    queryFn: async () => {
      const response = await employeeService.list({
        department: selectedDepartment || undefined,
        // Don't filter by role - get all roles (user, admin, superadmin)
      });
      return response.data || [];
    },
    enabled: isSuperadmin && !!selectedDepartment,
  });

  // Fetch employees for admin (filtered by their department)
  const { data: employeesResponse, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', user?.department],
    queryFn: async () => {
      const response = await employeeService.list({
        department: user?.department || undefined,
        // Don't filter by role - get all roles (user, admin, superadmin)
      });
      return response.data || [];
    },
    enabled: isAdmin && !!user?.department,
  });

  const adminEmployees = employeesResponse || [];
  const availableEmployees = isSuperadmin ? (departmentEmployees || []) : adminEmployees;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: taskService.sendTasksEmail,
    onSuccess: (data) => {
      const message = data?.data?.message || 'Email sent successfully!';
      alert(message);
      // Reset form
      setToList([]);
      setCcList([]);
      setSubject('');
      setRegards('');
      setSelectedDepartment('');
      setSelectedEmployeeIds([]);
      setSelectedBrandId('');
      setSelectedProjectId('');
      setErrors({});
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send email. Please check email configuration.';
      alert(errorMessage);
      console.error('Email send error:', error);
    },
  });

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

    // For superadmin: send department + employeeIds (if selected), for admin: send employeeIds, and include brand/project filters
    await sendEmailMutation.mutateAsync({
      to: toList.length === 1 ? toList[0] : toList,
      cc: ccList.length > 0 ? (ccList.length === 1 ? ccList[0] : ccList) : undefined,
      subject: subject.trim() || undefined,
      regards: regards.trim() || undefined,
      department: isSuperadmin && selectedDepartment ? selectedDepartment : undefined,
      employeeIds: (isSuperadmin || isAdmin) && selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
      employeeId: (isSuperadmin || isAdmin) && selectedEmployeeIds.length === 1 ? selectedEmployeeIds[0] : undefined,
      brandId: selectedBrandId || undefined,
      projectId: selectedProjectId || undefined,
    });
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    if (availableEmployees.length > 0) {
      setSelectedEmployeeIds(availableEmployees.map((emp: any) => emp._id));
    }
  };

  const deselectAllEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="p-6">
        <GlassCard className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
            Access Denied
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page is only available for Superadmin and Admin users.
          </p>
          <button
            onClick={() => navigate('/my-tasks')}
            className="px-4 py-2 rounded-lg bg-ncsBlue-500 text-white hover:bg-ncsBlue-600"
          >
            Go to My Tasks
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ncsBlue-400 to-ncsBlue-600 bg-clip-text text-transparent">
          Send Tasks Email
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isSuperadmin 
            ? 'Select a department to send in-progress tasks for all employees in that department'
            : 'Select employees from your department to send their in-progress tasks'}
        </p>
      </motion.div>

      <GlassCard className="p-6 space-y-6">
        {/* Superadmin: Department Selection */}
        {isSuperadmin && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Building2 size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
              <span className="text-gray-900 dark:text-gray-100">Select Department</span>
              <span className="text-red-600 dark:text-red-400 font-bold">*</span>
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedEmployeeIds([]); // Reset employee selection when department changes
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                isDark
                  ? 'bg-slate-700/90 border-slate-600 text-white'
                  : 'bg-slate-50/90 border-slate-300 text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500'
              )}
              disabled={sendEmailMutation.isPending || departmentsLoading}
            >
              <option value="">-- Select Department --</option>
              {departmentsLoading && <option disabled>Loading departments...</option>}
              {!departmentsLoading && Array.isArray(departments) && departments.length > 0 && departments.map((dept: any) => (
                <option key={dept._id || dept.name} value={dept.name || dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Select a department to filter employees. Then you can select specific employees or leave empty to select all.
            </p>
            {selectedDepartment && availableEmployees.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{availableEmployees.length}</strong> employee(s) found in <strong>{selectedDepartment}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Superadmin: Employee Selection (after department is selected) */}
        {isSuperadmin && selectedDepartment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <User size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                <span className="text-gray-900 dark:text-gray-100">Select Employees</span>
                <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional - leave empty to select all)</span>
              </label>
              {availableEmployees.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={selectAllEmployees}
                    className="text-xs px-3 py-1 rounded bg-ncsBlue-500 text-white hover:bg-ncsBlue-600"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllEmployees}
                    className="text-xs px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className={cn(
              'border rounded-xl p-4 max-h-64 overflow-y-auto',
              isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50/50'
            )}>
              {deptEmployeesLoading ? (
                <p className="text-sm text-gray-500">Loading employees...</p>
              ) : availableEmployees.length === 0 ? (
                <p className="text-sm text-gray-500">No employees found in selected department</p>
              ) : (
                <div className="space-y-2">
                  {availableEmployees.map((employee: any) => (
                    <label
                      key={employee._id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                        selectedEmployeeIds.includes(employee._id)
                          ? 'bg-ncsBlue-500/20 border border-ncsBlue-500/50'
                          : 'hover:bg-white/10 border border-transparent',
                        isDark ? '' : ''
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee._id)}
                        onChange={() => toggleEmployeeSelection(employee._id)}
                        className="w-4 h-4 rounded border-gray-300 text-ncsBlue-500 focus:ring-ncsBlue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{employee.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {selectedEmployeeIds.length > 0 
                ? `Selected ${selectedEmployeeIds.length} employee(s). Their names and tasks will be included in the email.`
                : 'No employees selected. All employees from the selected department will be included. Their names and tasks will be shown in the email.'}
            </p>
          </div>
        )}

        {/* Brand Selection (for both superadmin and admin) */}
        {(isSuperadmin || isAdmin) && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <Briefcase size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
              <span className="text-gray-900 dark:text-gray-100">Select Brand</span>
              <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setSelectedProjectId(''); // Reset project when brand changes
              }}
              className={cn(
                'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                isDark
                  ? 'bg-slate-700/90 border-slate-600 text-white'
                  : 'bg-slate-50/90 border-slate-300 text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500'
              )}
              disabled={sendEmailMutation.isPending || brandsLoading}
            >
              <option value="">-- All Brands --</option>
              {brandsLoading && <option disabled>Loading brands...</option>}
              {!brandsLoading && Array.isArray(brands) && brands.length > 0 && brands.map((brand: any) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Filter tasks by brand. Leave empty to include tasks from all brands.
            </p>
          </div>
        )}

        {/* Project Selection (for both superadmin and admin) */}
        {(isSuperadmin || isAdmin) && selectedBrandId && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              <FolderKanban size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
              <span className="text-gray-900 dark:text-gray-100">Select Project</span>
              <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional)</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl border transition-all duration-200',
                isDark
                  ? 'bg-slate-700/90 border-slate-600 text-white'
                  : 'bg-slate-50/90 border-slate-300 text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-ncsBlue-500/50 focus:border-ncsBlue-500'
              )}
              disabled={sendEmailMutation.isPending || projectsLoading || !selectedBrandId}
            >
              <option value="">-- All Projects in Selected Brand --</option>
              {projectsLoading && <option disabled>Loading projects...</option>}
              {!projectsLoading && Array.isArray(projects) && projects.length > 0 && projects.map((project: any) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
              {!projectsLoading && (!projects || projects.length === 0) && (
                <option disabled>No projects found in selected brand</option>
              )}
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Filter tasks by project. Leave empty to include tasks from all projects in the selected brand.
            </p>
          </div>
        )}

        {/* Admin: Employee Selection */}
        {isAdmin && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <User size={16} className="text-ncsBlue-500 dark:text-ncsBlue-400" />
                <span className="text-gray-900 dark:text-gray-100">Select Employees</span>
                <span className="text-xs font-normal text-gray-600 dark:text-gray-400">(Optional - leave empty to select all)</span>
              </label>
              {availableEmployees.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={selectAllEmployees}
                    className="text-xs px-3 py-1 rounded bg-ncsBlue-500 text-white hover:bg-ncsBlue-600"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllEmployees}
                    className="text-xs px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className={cn(
              'border rounded-xl p-4 max-h-64 overflow-y-auto',
              isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50/50'
            )}>
              {employeesLoading ? (
                <p className="text-sm text-gray-500">Loading employees...</p>
              ) : availableEmployees.length === 0 ? (
                <p className="text-sm text-gray-500">No employees found in your department</p>
              ) : (
                <div className="space-y-2">
                  {availableEmployees.map((employee: any) => (
                    <label
                      key={employee._id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                        selectedEmployeeIds.includes(employee._id)
                          ? 'bg-ncsBlue-500/20 border border-ncsBlue-500/50'
                          : 'hover:bg-white/10 border border-transparent',
                        isDark ? '' : ''
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee._id)}
                        onChange={() => toggleEmployeeSelection(employee._id)}
                        className="w-4 h-4 rounded border-gray-300 text-ncsBlue-500 focus:ring-ncsBlue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{employee.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {selectedEmployeeIds.length > 0 
                ? `Selected ${selectedEmployeeIds.length} employee(s). Their names and tasks will be included in the email.`
                : 'No employees selected. All employees from your department will be included. Their names and tasks will be shown in the email.'}
            </p>
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
              disabled={sendEmailMutation.isPending}
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
              disabled={sendEmailMutation.isPending}
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
            disabled={sendEmailMutation.isPending}
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
            disabled={sendEmailMutation.isPending}
          />
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Custom closing message that will appear at the end of the email
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => navigate('/my-tasks')}
            disabled={sendEmailMutation.isPending}
            className={cn(
              'px-5 py-2.5 rounded-xl font-medium transition-all duration-200',
              'hover:bg-white/10 dark:hover:bg-gray-700/50',
              isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900',
              sendEmailMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sendEmailMutation.isPending || toList.length === 0 || (isSuperadmin && !selectedDepartment) || (isAdmin && availableEmployees.length === 0 && selectedEmployeeIds.length === 0)}
            className={cn(
              'px-6 py-2.5 rounded-xl font-medium text-white transition-all duration-200',
              'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600',
              'hover:from-ncsBlue-600 hover:to-ncsBlue-700',
              'shadow-lg shadow-ncsBlue-500/30',
              'flex items-center gap-2',
              ((toList.length === 0) || sendEmailMutation.isPending || (isSuperadmin && !selectedDepartment) || (isAdmin && availableEmployees.length === 0))
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-xl hover:shadow-ncsBlue-500/40 active:scale-95'
            )}
          >
            {sendEmailMutation.isPending ? (
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
      </GlassCard>
    </div>
  );
};
