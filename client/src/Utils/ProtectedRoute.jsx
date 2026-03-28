import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const oldToken = JSON.parse(localStorage.getItem("token"));

  const location = useLocation();
  // console.log(token, "---protected-route-token")
  return oldToken ? (
    <div>{children}</div>
  ) : (
    <Navigate to="/login" replace state={{ path: location.pathname }} />
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // 'children' must be a React node
};

export default ProtectedRoute;
