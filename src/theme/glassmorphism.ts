export const glassStyles = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  ncsBlue: {
    background: 'rgba(17, 138, 178, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(17, 138, 178, 0.3)',
    shadow: '0 8px 32px 0 rgba(17, 138, 178, 0.2)',
  },
};

export const getGlassStyles = (variant: 'light' | 'dark' | 'ncsBlue' = 'light') => {
  const styles = glassStyles[variant];
  return {
    background: styles.background,
    backdropFilter: styles.backdropFilter,
    WebkitBackdropFilter: styles.backdropFilter,
    border: styles.border,
    boxShadow: styles.shadow,
  };
};

