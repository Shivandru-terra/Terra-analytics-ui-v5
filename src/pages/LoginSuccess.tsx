import { generalFunctions } from "@/lib/generalFuntion";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [threadId, setThreadId] = useState("");

  useEffect(()=>{
    console.log("LoginSuccess mounted");
    console.log("Query string:", location.search);
  },[])

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const name = queryParams.get("name");
    const userId = queryParams.get("userId");
    const threadIdFromUrl = queryParams.get("threadId");
    if ( threadIdFromUrl ) {
      setThreadId(threadIdFromUrl);
    }

    console.log("✅ Extracted from URL:", { token, email, name });

    // if (!email?.endsWith("@letsterra.com")) {
    //   navigate("/unauthorized");
    // } else {
      localStorage.setItem("token", token!);
      localStorage.setItem("email", email!);
      localStorage.setItem("name", name!);
      localStorage.setItem("userId", userId);
      generalFunctions.setPlatform("terra");
      // navigate("/dashboard");
      navigate(`/dashboard/${threadIdFromUrl}`);
    // }
  }, [location.search, navigate]);

  return <p>Logging in...</p>;
};

export default LoginSuccess;
