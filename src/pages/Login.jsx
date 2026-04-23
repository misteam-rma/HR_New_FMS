import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Loader2, Eye, EyeOff, AlertCircle, LogIn, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const LOGIN_URL = import.meta.env.DEV ? "/api/login" : import.meta.env.VITE_LOGIN_SHEET_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim() || !password.trim() || !pin.trim()) {
      setError("Please enter your User ID, Secret Key, and Security PIN.");
      return;
    }

    setLoading(true);

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // POST request with JSON body as expected by doPost()
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Use text/plain to avoid CORS preflight (OPTIONS request)
        },
        body: JSON.stringify({
          action: "login",
          code: code.trim(),
          password: password.trim(),
          pin: pin.trim(),
        }),
        signal: controller.signal,
      });

      const result = await response.json();

      console.log("🔍 Raw login response:", result);

      if (result.success) {
        const userCode = code.trim();

        const incomingRole = (result.role || "").toString().trim();
        const role = incomingRole;

        const name = result.name?.toString().trim() || userCode;

        // Determine admin status (based on role or legacy Admin field)
        const isAdmin =
          role === "admin" ||
          result.Admin === "Yes" ||
          String(result.Admin).toLowerCase() === "yes";

        const userData = {
          code: userCode,
          name,
          role,
          isAdmin,
          username: result.username,
          redirectUrl: result.redirectUrl,
          attendanceUrl: result.attendanceUrl,
          forceChange: result.forceChange || false,
        };

        console.group("🔐 User Authentication Successful");
        console.log("%cProfile:", "color: #10b981; font-weight: bold;", userData);
        console.log("%cRaw Role from Backend:", "color: #6366f1;", result.role);
        console.log("%cIs Admin Status:", "color: #6366f1;", userData.isAdmin);
        console.groupEnd();

        // ------------------------------------------------------------------
        // DEVELOPMENT ONLY: Fetch and log the full user row (columns A–H)
        // ------------------------------------------------------------------
        if (import.meta.env.DEV) {
          try {
            // Fetch the specific user row using the existing "getUserRow" action
            const rowResponse = await fetch(LOGIN_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({ action: "getUserRow", code: userCode }),
              signal: controller.signal,
            });
            const rowResult = await rowResponse.json();

            if (rowResult.success && rowResult.rowData) {
              console.group("📋 Full User Row (Columns A–H)");
              console.table(rowResult.rowData);
              console.groupEnd();
            } else {
              console.warn("User row not found or empty:", rowResult.message);
            }

            // Optional: Also fetch full master data for comparison
            const masterResponse = await fetch(LOGIN_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({ action: "getAllLoginData" }),
              signal: controller.signal,
            });
            const masterResult = await masterResponse.json();

            if (masterResult.success && masterResult.allData) {
              console.group("📋 LOGIN MASTER DATA (FULL SHEET)");
              const [headers, ...rows] = masterResult.allData;
              const tableData = rows.map((row) => {
                const obj = {};
                const maxCols = Math.max(headers.length, row.length);
                for (let index = 0; index < maxCols; index++) {
                  const headerName = headers[index] || (index === 7 ? "Role" : `Col ${String.fromCharCode(65 + index)}`);
                  obj[headerName] = row[index] !== undefined ? row[index] : "";
                }
                return obj;
              });
              console.table(tableData);
              console.groupEnd();
            }
          } catch (debugErr) {
            console.warn("Debug fetch failed:", debugErr);
          }
        }

        // Update Global Auth State
        login(userData);
        // Set legacy localStorage key for compatibility with existing components
        localStorage.setItem("user", JSON.stringify(userData));

        // Handle forced password/PIN change
        if (result.forceChange) {
          toast.success("Please set a new password and PIN.");
          navigate("/change-password", {
            state: { username: result.username },
            replace: true,
          });
        } else {
          toast.success("Login successful!");
          // Redirect to dashboard by default
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError(result.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Login fetch error:", error);
        toast.error("Network error. Please check your connection.");
        setError("A system error occurred. Please try again later.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="flex-1 w-full flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2rem] animate-fade-in-up relative overflow-hidden flex flex-col">
          <div className="p-8 sm:p-12 pb-8">
            {/* Logo & Title Block */}
            <div className="flex flex-col items-center text-center space-y-4 mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/10 hover:scale-105 duration-500 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-800">
                  HR<span className="text-indigo-600">_</span>MANAGEMENT
                </h1>
                <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mt-2">
                  Management Portal Access
                </p>
              </div>
            </div>

            {/* Error Message Block */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-3 animate-shake"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User ID Input Group */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-gray-400 focus-within:text-indigo-600 transition-colors duration-300 ml-1 block"
                >
                  User ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                    placeholder="Enter your user ID"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-200/50 focus:bg-white border-2 border-transparent focus:border-indigo-600/20 rounded-2xl font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Secret Key Input Group */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-gray-400 focus-within:text-indigo-600 transition-colors duration-300 ml-1 block"
                >
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3.5 bg-gray-200/50 focus:bg-white border-2 border-transparent focus:border-indigo-600/20 rounded-2xl font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-300 disabled:opacity-50 ${
                      !showPassword && password ? "tracking-[0.2em]" : "tracking-normal"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security PIN Input Group */}
              <div className="space-y-1.5">
                <label
                  htmlFor="pin"
                  className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-gray-400 focus-within:text-indigo-600 transition-colors duration-300 ml-1 block"
                >
                  Security PIN
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                  </div>
                  <input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={loading}
                    placeholder="••••"
                    className={`w-full pl-11 pr-12 py-3.5 bg-gray-200/50 focus:bg-white border-2 border-transparent focus:border-indigo-600/20 rounded-2xl font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none transition-all duration-300 disabled:opacity-50 ${
                      !showPin && pin ? "tracking-[0.2em]" : "tracking-normal"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPin ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 relative flex items-center justify-center py-4 px-4 rounded-2xl text-sm font-black tracking-[0.2em] uppercase text-white bg-indigo-600 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-95 disabled:opacity-70 disabled:active:scale-100 overflow-hidden group transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    Access Portal
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-6 text-center">
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400">
              Secure Authentication Protocol Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}