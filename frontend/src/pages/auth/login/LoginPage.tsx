import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/svg";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { LoginDataProps } from "../../../shared/interface/AuthData";
import loginUserApi from "../../../api/auth/login.user";

const LoginPage = () => {
  // Initialize form data state
  const [formData, setFormData] = useState<LoginDataProps>({
    username: "",
    password: "",
  });

  // Login APIs
  const { loginMutation, isPending, isError } = loginUserApi();

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation(formData);
  };

  // Update form data on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      {/* Display SVG on large screens */}
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>

          {/* Username input */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="Username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          {/* Password input */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>

          {/* Login button with loading state */}
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Login"}
          </button>

          {/* Error message */}
          {isError && (
            <p className="text-red-500">Please Fill Correct Information</p>
          )}
        </form>

        {/* Sign up link */}
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
