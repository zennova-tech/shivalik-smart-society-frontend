import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginUser, resetLoginUser } from "@/store/slices/authSlice";
import { setToLocalStorage } from "@/utils/localstorage";
import { showMessage } from "@/utils/Constant";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/utils/validationSchemas/loginSchema";
import * as Yup from "yup";

type LoginFormValues = Yup.InferType<typeof loginSchema>;

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const {
    status,
    error,
    user: authUser,
  }: any = useSelector((state: any) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  useEffect(() => {
    if (status === "complete" && authUser) {
      // Handle successful login
      console.log("auth user", authUser);
      const userData = authUser?.data?.user
      const userInfo = {
        id: userData.id || "",
        name:
          userData.name ||
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        email: userData.email || "",
        phone: userData.mobileNumber || "",
        role: userData.role || "",
        userRoles: userData.roles || [],
        avatar: userData.avatar || "",
      };
        console.log("user info", userInfo);

      const accessToken = authUser.data.token || "";
      authLogin(userInfo, accessToken);
      setToLocalStorage("userInfo", JSON.stringify(userInfo));
      setToLocalStorage("auth_token", accessToken);

      showMessage("Login successful");
      dispatch(resetLoginUser());
      
      const role: string = userData?.role;
      if (role?.toLowerCase() === "superadmin") {
        navigate("/society-management");
      } else {
        navigate("/dashboard");
      }

    } else if (status === "failed") {
      showMessage(
        error || "Login failed. Please check your credentials.",
        "error"
      );
    }
  }, [status, authUser, navigate, dispatch, authLogin]);

  const handleSubmit = (values: LoginFormValues, { setSubmitting }: any) => {
    dispatch(loginUser({ email: values.email, password: values.password }));
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center p-4 bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: "url('/authBgImage.svg')" }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 text-center p-6">
        <div className="w-12 h-12 mx-auto rounded-[10px] bg-white border border-[#F0F0F0] flex items-center justify-center flex-shrink-0">
          <img
            src="/loginIcon.svg"
            alt="Login"
            className="w-5 h-5"
            loading="lazy"
          />
        </div>
        <h1 className="my-4 text-2xl font-bold text-[#2E2E2E] flex-shrink-0">
          R-OS
        </h1>
        <p className="inline-block px-[14px] py-[6px] h-[36px] rounded-full bg-[#EDEDED] text-[#757575] text-[14px] leading-[24px] font-semibold text-center flex-shrink-0">
          Admin Login
        </p>
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form className="mt-6">
              {/* Email Field */}
              <div className="">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter Email Address"
                    className={`w-full pl-12 pr-4 py-2 bg-transparent h-12 border-0 border-b ${
                      errors.email && touched.email
                        ? "border-red-500"
                        : "border-[#E0E0E0]"
                    } focus:border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 text-sm transition-colors`}
                    disabled={isSubmitting || status === "loading"}
                  />
                </div>
                <div className="h-5 mt-1">
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-xs text-red-500 text-left"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <Field name="password">
                    {({ field }: any) => (
                      <input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className={`w-full pl-12 pr-12 py-2 bg-transparent h-12 border-0 border-b ${
                          errors.password && touched.password
                            ? "border-red-500"
                            : "border-[#E0E0E0]"
                        } focus:border-black focus:ring-0 focus:outline-none placeholder:text-gray-400 text-sm transition-colors`}
                        disabled={isSubmitting || status === "loading"}
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm focus:outline-none z-10"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="h-5 mt-1">
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-xs text-red-500 text-left"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  status === "loading" ||
                  isSubmitting ||
                  !values.email ||
                  !values.password
                }
                className="w-full h-12 bg-primary-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Form>
          )}
        </Formik>
        {/* Version Info */}
        <p className="mt-6 text-xs text-gray-400">R-OS Admin v1.0.0</p>
      </div>
    </div>
  );
};