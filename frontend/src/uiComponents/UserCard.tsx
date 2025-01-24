import { useResourceURL } from "../contexts/configContext";
import { User } from "../pages/UserList";

function UserCard({
  user,
  addFriend,
}: {
  user: User;
  addFriend: (userId: string) => void;
}) {
  const resourceURL = useResourceURL();

  return (
    // <div className="bg-gray-100 text-slate-900">
    <div className="flex justify-between items-center bg-gray-100 w-full p-2 rounded shadow-xl">
      {/* info container */}
      <div className="flex justify-start items-center space-x-3">
        <img
          className="w-16 h-16 rounded-full bg-slate-300"
          src={`${resourceURL}/${user.image}`}
          alt={`${user.name}-profile`}
        />
        <div className="flex flex-col justify-start items-center space-y-3">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <h3 className="font-medium">{user.email}</h3>
        </div>
      </div>
      <button
        className="bg-blue-700 rounded text-gray-100 font-bold text-lg p-2 hover:bg-blue-600 shadow transition"
        onClick={() => addFriend(user.uuid)}
      >
        Add Friend
      </button>
    </div>
  );
}

export default UserCard;
