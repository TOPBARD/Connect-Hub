import { useEffect, useState } from "react";
import { User } from "../../shared/interface/User";
import toast from "react-hot-toast";
import { UpdateProfileProps } from "../../shared/interface/UpdateProfile";
import profileActionApi from "@/api/profile/profile.action";

const EditProfileModal = ({ authUser }: { authUser: User }) => {
  // From for profile data
  const [formData, setFormData] = useState<UpdateProfileProps>({
    name: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  // Fetch update profile action from API.
  const { updateProfileDetails, isUpdatingProfileDetails } = profileActionApi();

  // Handle Form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pre-fill auth user data
  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name,
        username: authUser.username,
        email: authUser.email,
        bio: authUser.bio as string,
        link: authUser.link as string,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  // Profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email) {
      toast.error(`Please fill the required fields`);
      return;
    }
    updateProfileDetails(formData);
  };
  return (
    <>
      {/* Button to open the edit profile modal */}
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() => {
          const modal = document.getElementById("edit_profile_modal");
          if (modal && modal instanceof HTMLDialogElement) {
            modal.showModal();
          }
        }}
      >
        Edit profile
      </button>

      {/* Modal for editing profile */}
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form className="flex flex-col gap-4" onSubmit={handleProfileUpdate}>
            {/* Full Name and Username Input Fields */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.name}
                name="name"
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Email and Bio Input Fields */}
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
                required
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>

            {/* Current Password and New Password Input Fields */}
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>

            {/* Link Input Field */}
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />

            {/* Submit Button */}
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {isUpdatingProfileDetails ? "Updating..." : "Update"}
            </button>
          </form>
        </div>

        {/* Backdrop for closing the modal */}
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
