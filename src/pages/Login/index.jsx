import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={submit}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">
          Sign in to Lasak Analytics
        </h2>
        <input className="w-full mb-3 p-2 border rounded" placeholder="Email" />
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Password"
          type="password"
        />
        <button className="w-full py-2 bg-indigo-600 text-white rounded">
          Sign in
        </button>
      </form>
    </div>
  );
}
