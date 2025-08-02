import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SuggestionRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSchedule = !!localStorage.getItem("moda_schedule");
    navigate(hasSchedule ? "/schedules" : "/suggestion");
  }, []);

  return null;
}
