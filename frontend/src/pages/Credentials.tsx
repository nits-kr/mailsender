import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useGetUsersQuery, useDeleteUserMutation } from "../store/apiSlice";

const Credentials = () => {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
      } catch {
        alert("Error deleting user");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="flex justify-between items-center mb-8 bg-dark-2 p-4 border border-light rounded">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">
            Credentials Management
          </h1>
          <p className="text-gray-400 text-10px italic">
            Add or manage user credentials for SMTP access
          </p>
        </div>
        <button
          className="bg-success text-white font-bold flex items-center gap-2 px-5 py-2 rounded border-b-2 border-primary-30 text-xs shadow-lg"
          onClick={() => alert("Add form coming soon")}
        >
          <Plus size={16} />
          Add New User
        </button>
      </header>

      <div className="overflow-x-auto border border-gray-800 rounded">
        <table className="legacy-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="text-primary font-bold">{user._id.slice(-6)}</td>
                <td className="text-white font-bold">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-10px font-bold uppercase ${
                      user.role === "admin"
                        ? "bg-success-10 text-green-400"
                        : "bg-primary-10 text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="flex justify-center gap-2">
                  <button
                    className="p-1 bg-blue-20 text-blue-400 rounded hover:bg-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="p-1 bg-red-20 text-red-400 rounded hover:bg-red-600 transition-colors"
                    onClick={() => handleDelete(user._id)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="p-12 text-center text-gray-500 italic text-xs">
            Loading users...
          </div>
        )}
      </div>
    </div>
  );
};

export default Credentials;
