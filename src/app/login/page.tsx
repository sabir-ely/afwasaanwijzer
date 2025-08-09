"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      username: credentials.username,
      password: credentials.password,
      callbackUrl: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col">
        <div className="mb-10 text-3xl font-bold">We gaan afwassen!</div>
        <form onSubmit={handleSubmit} className="space-y-4 w-80">
          <input
            type="text"
            placeholder="Gebruikersnaam"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
}
