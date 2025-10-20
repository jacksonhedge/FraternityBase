import { Outlet } from 'react-router-dom';

/**
 * Wrapper for React Router's Outlet
 * Animations disabled for instant page transitions
 */
const AnimatedOutlet = () => {
  return (
    <div className="page-container">
      <Outlet />
    </div>
  );
};

export default AnimatedOutlet;
