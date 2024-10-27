import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import XSvg from "../../../components/svgs/svg";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterDataProps } from "../../../shared/interface/AuthData";
import { User } from "../../../shared/interface/User";

const SignUpPage = () => {
  // Initialize form data state
  const [formData, setFormData] = useState<RegisterDataProps>({
    email: "",
    username: "",
    name: "",
    password: "",
  });

  const queryClient = useQueryClient();
  // Mutation for signup with error handling
  const { mutate, isError, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const { email, name, username, password } = formData;
        await axios.post<User>("/api/auth/signup", {
          email,
          username,
          name,
          password,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw toast.error(`${error.response.data.error}`);
        }
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  // Update form data on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      {/* Display SVG on large screens */}
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className=" lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>

          {/* Email input */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          {/* Username input */}
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow "
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>

            {/* FullName input */}
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="name"
                onChange={handleInputChange}
                value={formData.name}
              />
            </label>
          </div>

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

          {/* Signup button with loading state */}
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign up"}
          </button>

          {/* Error message */}
          {isError && (
            <p className="text-red-500">Please Fill Correct Information</p>
          )}
        </form>

        {/* Sign in link */}
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
