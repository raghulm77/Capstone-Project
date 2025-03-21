import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const history = useHistory();
  const { login } = useContext(UserContext);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(/@/, "Please include an '@'.")
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await axios.get(
          `http://localhost:4000/users?email=${values.email}&password=${values.password}`
        );
        if (response.data.length > 0) {
          const user = response.data[0];
          login(user);
          history.push(user.role === "admin" ? "/" : "/profiles");
        } else {
          setErrors({ password: "Invalid email or password" });
        }
      } catch (error) {
        console.error("Error logging in:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={formik.handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email ? (
            <div style={{ color: "red" }}>{formik.errors.email}</div>
          ) : null}
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password ? (
            <div style={{ color: "red" }}>{formik.errors.password}</div>
          ) : null}
        </label>
        <button type="submit" disabled={formik.isSubmitting}>
          Login
        </button>
      </form>
      <button onClick={() => history.push("/signup")}>Sign Up</button>
    </div>
  );
};

export default Login;
