import { useNavigate } from "react-router-dom";
import { useResourceURL } from "../contexts/configContext";

export type Friend = {
  uuid: string;
  userName: string;
  email: string;
  image: string;
  isCalling: boolean;
};

function FriendCard({ userId, friend }: { userId: string; friend: Friend }) {
  const navigate = useNavigate();
  const resourceURL = useResourceURL();

  const handleCall = () => {
    navigate(`/offererchat?offerer=${userId}&answerer=${friend.uuid}`);
  };

  const handleAnswer = () => {
    navigate(`/answererchat?offerer=${friend.uuid}&answerer=${userId}`);
  };

  return (
    // <div className="bg-gray-100 text-slate-900">
    <div className="flex justify-between items-center bg-gray-100 w-full p-2 rounded shadow-xl">
      {/* info container */}
      <div className="flex justify-start items-center space-x-3">
        <img
          className="w-16 h-16 rounded-full bg-slate-300"
          src={`${resourceURL}/${friend.image}`}
          alt={`${friend.userName}-profile`}
        />
        <div className="flex flex-col justify-start items-center space-y-3">
          <h1 className="text-xl font-bold">{friend.userName}</h1>
          <h3 className="font-medium">{friend.email}</h3>
        </div>
      </div>
      {/* call container */}
      {friend.isCalling ? (
        <div className="flex flex-col justify-center items-center space-y-2">
          <h4 className="animate-ping text-red-700">is calling</h4>
          <button
            className="bg-lime-800 rounded text-gray-100 font-bold text-lg p-2 hover:bg-lime-600 shadow transition"
            onClick={handleAnswer}
          >
            Answer
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-700 rounded text-gray-100 font-bold text-lg p-2 hover:bg-blue-600 shadow transition"
          onClick={handleCall}
        >
          Call
        </button>
      )}
    </div>
  );
}

export default FriendCard;
