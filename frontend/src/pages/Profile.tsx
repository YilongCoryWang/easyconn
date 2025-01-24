import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiBase from "../utils/apiBase";

function Profile() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { state: user } = useLocation();
  const { email, name, uuid } = user;

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement & {
      files: FileList;
    };
    setImageFile(target.files[0]);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const nativeEvent = e.nativeEvent as typeof e.nativeEvent & {
        submitter: { name: string };
      };
      if (nativeEvent.submitter.name !== "submitBtn") {
        return;
      }

      const target = e.target as typeof e.target & {
        name: { value: string };
        email: { value: string };
      };
      const form = new FormData();
      form.append("name", target.name.value);
      form.append("email", target.email.value);
      if (imageFile) form.append("image", imageFile);
      // console.log(target.name.value, target.email.value, imageFile, form);
      const res = await apiBase.patch(`/users/${uuid}`, form);
      const {
        status,
        data: { user },
      } = res.data;
      if (status === "success") {
        console.log("updated,", user);
        navigate("/home", { state: { user } });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-cyan-400 min-h-screen">
      {/* <!-- main card --> */}
      <div className="relative flex m-6">
        {/* <!-- content --> */}
        <form
          className="w-96 p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg space-y-6"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {/* <!-- login container --> */}
          <div className="space-y-2">
            <h1 className="text-3xl text-start font-mono">Edit Profile</h1>
            <p className="text-gray-600 mt-2 mb-8">
              Please update your profile:
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="font-medium">
                  User Name
                </label>
                <input
                  id="name"
                  className="w-full border-2 rounded focus:outline-none h-10 p-6 text-gray-500"
                  type="text"
                  defaultValue={name}
                  name="name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="font-medium">
                  Email
                </label>
                <input
                  id="email"
                  className="w-full border-2 rounded focus:outline-none h-10 p-6 text-gray-500"
                  type="text"
                  defaultValue={email}
                  name="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="image" className="font-medium">
                  Profile Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <button
            className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
            name="submitBtn"
          >
            Update Profile
          </button>
          <button
            className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
            onClick={() => {
              navigate("/home", {
                state: { user },
              });
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
