import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/utils/cn';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal = ({ onClose }: NotificationsModalProps) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await authService.getInvitation();
        setInvitation((resp as any)?.data || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-ncsBlue-500/20">
                  <Bell size={18} className="text-ncsBlue-500" />
                </div>
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className={cn('p-2 rounded-lg hover:bg-ncsBlue-500/20 transition-colors')}
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div className="skeleton h-40 w-full" />
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : invitation ? (
              <div className="space-y-3">
                <div className={cn(
                  'p-3 rounded-lg border',
                  (!invitation?.type || !invitation?.id) 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-yellow-500/10 border-yellow-500/30'
                )}>
                  <p className="text-sm font-medium">
                    {(!invitation?.type || !invitation?.id) 
                      ? 'Invalid invitation - context missing' 
                      : `Pending invitation for ${invitation.type}`}
                  </p>
                  {invitation?.type && invitation?.id ? (
                    <p className="text-xs opacity-70 mt-1">Type: {invitation.type} • ID: {invitation.id}</p>
                  ) : (
                    <p className="text-xs opacity-70 mt-1">
                      This invitation cannot be accepted. Please dismiss it and ask for a new invitation.
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={busy || !invitation?.type || !invitation?.id}
                    onClick={async () => {
                      try {
                        setBusy(true);
                        const resp = await authService.acceptInvitationAuth();
                        const respData = (resp as any)?.data;
                        if (respData?.cleared) {
                          // Invitation was cleared automatically
                          setInvitation(null);
                          alert('Invalid invitation has been cleared. Please ask for a new invitation.');
                        } else {
                          // If tokens provided, refresh user
                          if (respData?.accessToken && respData?.refreshToken) {
                            try {
                              localStorage.setItem('accessToken', respData.accessToken);
                              localStorage.setItem('refreshToken', respData.refreshToken);
                              const me = await authService.getMe();
                              const newUser = (me as any)?.data;
                              if (newUser) {
                                setAuth(newUser, respData.accessToken, respData.refreshToken);
                              }
                            } catch (_) {}
                          }
                          alert('Invitation accepted successfully!');
                          setInvitation(null);
                          onClose();
                        }
                      } catch (e: any) {
                        const errorMsg = e?.response?.data?.message || e?.message || 'Failed to accept invitation';
                        alert(errorMsg);
                        // If invitation was cleared, update UI
                        if (e?.response?.data?.cleared) {
                          setInvitation(null);
                        }
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-semibold transition-all',
                      (!invitation?.type || !invitation?.id || busy)
                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-ncsBlue-500 to-ncsBlue-600 text-white hover:from-ncsBlue-600 hover:to-ncsBlue-700'
                    )}
                  >
                    {busy ? 'Processing...' : (!invitation?.type || !invitation?.id) ? 'Cannot Accept' : 'Accept'}
                  </button>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      try {
                        setBusy(true);
                        await authService.dismissInvitation();
                        alert('Invitation dismissed');
                        setInvitation(null);
                        // Close modal and refresh to update user data
                        setTimeout(() => {
                          onClose();
                          window.location.reload();
                        }, 500);
                      } catch (e: any) {
                        alert(e?.response?.data?.message || e?.message || 'Failed to dismiss invitation');
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold transition-colors',
                      'bg-gray-500/20 text-gray-700 dark:text-gray-300 hover:bg-gray-500/30',
                      busy && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-80">No notifications.</p>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


