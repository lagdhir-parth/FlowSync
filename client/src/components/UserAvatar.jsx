const UserAvatar = ({ user, size }) => {
  return (
    <div className="cursor-pointer">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl || ""}
          alt="avatar"
          className={`size-${size || "8"} rounded-full object-cover z-10`}
        />
      ) : (
        <div
          className={`size-${size || "8"} bg-indigo-500 border-2 border-gray-400 rounded-full z-10 flex items-center justify-center text-xs font-bold text-white`}
        >
          {user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || user?.username?.charAt(0)}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
