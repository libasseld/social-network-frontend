"use client";
import { useState } from "react";
import { API_BASE_URL} from "@/config/api";
import axios from "axios";

export default function Login() {
  const [errorApi, setErrorApi] = useState("");

  const handleSubmit = async (e) => {
    setErrorApi("");
    e.preventDefault();
    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/signin`, formData);
      
      const data = response.data;
      
      if (data.token) {
        // Stocker le token dans le localStorage
        localStorage.setItem('social-network-token', data.token);
        window.location.href = "/";
        console.log("Connexion réussie et token stocké:", data.token);
      } else {
        setErrorApi("Erreur: Token non reçu du serveur");
        console.error("Pas de token reçu");
      }
      
    } catch (error) {
      if (error.response.status === 429) {
        setErrorApi("Trop de tentatives de connexion. Veuillez réessayer plus tard.");
        console.error("Trop de tentatives de connexion");
      } else if (error.response) {
        setErrorApi("Erreur de connexion : " + error.response.data.message);
        console.error("Erreur de connexion", error.response.data);
      } else {
        setErrorApi("Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d'exécution.");
        console.error("Erreur lors de la connexion:", error);
      }
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-40 w-auto"
          src="/EPF_logo_2021.png"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Connecte vous à votre compte{" "}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {errorApi && (
          <div
            className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {errorApi}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Adresse Email
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Mot de passe
              </label>
            </div>
            <div className="mt-2">
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Se connecter{" "}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Vous n'avez pas de compte ?
          <a
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {" "}
            Créez en Un
          </a>
        </p>
      </div>
    </div>
  );
}
