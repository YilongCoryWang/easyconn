import { useEffect, useState } from "react";
import apiBase from "../utils/apiBase";
import UserCard from "../uiComponents/UserCard";
import { useLocation } from "react-router-dom";

export type User = {
  email: string;
  id: string;
  image: string;
  isCalling: boolean;
  name: string;
  uuid: string;
};

type GetUserListResp = {
  data: {
    status: string;
    data: { users: User[] };
  };
};

function UserList() {
  const [userList, setUserList] = useState<User[] | null>(null);
  const {
    state: { currentUser },
  } = useLocation();

  console.log(currentUser);

  useEffect(() => {
    const getUserList = async () => {
      const res: GetUserListResp = await apiBase.get("/api/v1/users");
      const { status, data } = res.data;
      if (status === "success") {
        setUserList(data.users);
      }
    };

    getUserList();
  }, []);

  return (
    // background
    <div className="flex justify-center w-full min-h-screen bg-cyan-200">
      {/* friends list container */}
      <div className="w-96 h-full bg-cyan-600 text-gray-200 rounded-md shadow-2xl p-3 m-6 space-y-3">
        {/* welcome banner container */}
        <h3 className="text-lg font-bold">All users:</h3>
        {/* <div className="flex flex-row justify-center items-center"> */}
        <div className="flex flex-col justify-center items-center text-slate-900 space-y-3">
          {userList && userList.map((u) => <UserCard key={u.uuid} user={u} />)}
        </div>
      </div>
    </div>
  );
}

export default UserList;
