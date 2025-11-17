// src\pages\Redirects.jsx
import { Navigate, useParams } from "react-router-dom";

export const ManagerProjectRedirect = () => {
  const { project_id } = useParams();
  return <Navigate to={`/manager/detail/projects/${project_id}/`} replace />;
};

export const ManagerBuildingTaskRedirect = () => {
  const { project_id, building_assign_id } = useParams();
  return (
    <Navigate
      to={`/manager/detail/projects/${project_id}/buildings/${building_assign_id}/`}
      replace
    />
  );
};

export const ManagerClientRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/manager/detail/clients/view/${id}/`} replace />;
};

export const TeamLeadProjectRedirect = () => {
  const { project_id } = useParams();
  return <Navigate to={`/teamlead/detail/projects/${project_id}/`} replace />;
};

export const TeamLeadBuildingTaskRedirect = () => {
  const { project_id, building_assign_id } = useParams();
  return (
    <Navigate
      to={`/teamlead/detail/projects/${project_id}/buildings/${building_assign_id}/`}
      replace
    />
  );
};
