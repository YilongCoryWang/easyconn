import { useEffect, useState } from "react";
import getSocket from "../utils/getSocket";
import { useLocation, useNavigate } from "react-router-dom";
import FriendCard, { type Friend } from "../uiComponents/FriendCard";
import { useUpdateCallStatus } from "../contexts/callStatusContext";
import { useResourceURL } from "../contexts/configContext";

function Home() {
  const {
    state: { user },
  } = useLocation();
  const [friendList, setFriendList] = useState<Friend[] | null>(null);
  const updateCallStatus = useUpdateCallStatus();
  const resourceURL = useResourceURL();
  const navigate = useNavigate();
  const { uuid, image, name } = user;

  useEffect(() => {
    if (friendList === null) {
      setFriendList(user.friends);
    }
  }, [friendList, user.friends]);

  useEffect(() => {
    const socket = getSocket(uuid);
    socket.on("updateFriendList", (e) => {
      console.log("updateFriendList", e);
      setFriendList(e);
    });

    socket.on("newOfferWaiting", async (offer) => {
      console.log("newOfferWaiting", offer);
      updateCallStatus("offer", offer);
    });
  }, [uuid, updateCallStatus]);

  const handleClick = () => {
    navigate(`/profile/${uuid}`, { state: user });
  };

  return (
    // background
    <div className="flex justify-center w-full min-h-screen bg-cyan-200">
      {/* friends list container */}
      <div className="w-96 h-full bg-cyan-600 text-gray-200 rounded-md shadow-2xl p-3 m-6 space-y-3">
        {/* welcome banner container */}
        <div
          className="flex items-center space-x-3 hover:cursor-pointer"
          onClick={handleClick}
        >
          {image && (
            <img
              className="w-16 h-16"
              src={`${resourceURL}/${image}`}
              alt={`${name}-image`}
            />
          )}
          <h1 className="text-2xl">Welcome{name && ` ${name}`}!</h1>
        </div>
        <h3 className="text-lg">Now you can video chat with friends:</h3>
        {/* <div className="flex flex-row justify-center items-center"> */}
        <div className="flex flex-col justify-center items-center text-slate-900 space-y-3">
          {friendList &&
            friendList.map((f) => (
              <FriendCard key={f.uuid} friend={f} user={user} />
            ))}
        </div>
        <button
          className="bg-blue-700 rounded text-gray-100 font-bold text-lg p-2 hover:bg-blue-600 shadow transition"
          onClick={() =>
            navigate("/user-list", { state: { currentUser: user } })
          }
        >
          See who's here
        </button>
      </div>
    </div>
  );
}

export default Home;
