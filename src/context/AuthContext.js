import { createContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    const fetchUser = async () => {
      try {
        const res = await api.get("/me");

        setUser(res.data.user);
        setTrialDaysRemaining(res.data.trial_days_remaining);
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    setAuthToken(token);
    setUser(user);

    // recharger les infos trial
    const me = await api.get("/me");
    setTrialDaysRemaining(me.data.trial_days_remaining);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // Ignore 401 ou erreur serveur
      console.log("Logout error ignored:", err.response?.status);
    }

    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setTrialDaysRemaining(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        trialDaysRemaining
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};