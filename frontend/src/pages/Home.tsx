import { useEffect, useState } from "react";
import getSocket from "../utils/getSocket";
import { useLocation } from "react-router-dom";
import FriendCard, { type Friend } from "../uiComponents/FriendCard";
import { useUpdateCallStatus } from "../contexts/callStatusContext";
import { useResourceURL } from "../contexts/configContext";

function Home() {
  const {
    state: { uuid, image, userName },
  } = useLocation();
  const [friendList, setFriendList] = useState<Friend[] | null>(null);
  const updateCallStatus = useUpdateCallStatus();
  const resourceURL = useResourceURL();

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

  return (
    // background
    <div className="flex justify-center w-full min-h-screen bg-cyan-200">
      {/* friends list container */}
      <div className="w-96 h-full bg-cyan-600 text-gray-200 rounded-md shadow-2xl p-3 m-6 space-y-3">
        {/* welcome banner container */}
        <div className="flex items-center space-x-3">
          <img
            className="w-16 h-16"
            src={`${resourceURL}/${image}`}
            alt={`${userName}-image`}
          />
          <h1 className="text-2xl">
            Welcome back{userName && `, ${userName}`}!
          </h1>
        </div>
        <h3 className="text-lg">Now you can video chat with friends:</h3>
        {/* <div className="flex flex-row justify-center items-center"> */}
        <div className="flex flex-col justify-center items-center text-slate-900 space-y-3">
          {friendList &&
            friendList.map((f) => (
              <FriendCard key={f.uuid} userId={uuid} friend={f} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
