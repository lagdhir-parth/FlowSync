import { TbMenu2 } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar";

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1E2535] bg-[#0F172A]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#1E2535]"
        >
          <TbMenu2 className="w-5 h-5" />
        </button>

        <Link to="/" className="text-lg font-semibold">
          FlowSync
        </Link>
      </div>

      {/* TODO: create search query input / searchbar */}

      <div className="flex items-center gap-4">
        <UserAvatar user={user} />
      </div>
    </header>
  );
}
