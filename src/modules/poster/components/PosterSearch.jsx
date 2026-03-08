import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import api from "../../../api/api";

const PosterSearch = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  setIsSearching,
  addTMDBPoster,
  openPreview
}) => {

  const [selectedLanguage, setSelectedLanguage] = useState("fr-FR");

  const searchTMDB = async (query) => {

    if (!query.trim()) return;

    setIsSearching(true);

    try {

      const response = await api.get("/tmdb/search", {
        params: {
          query,
          language: selectedLanguage
        }
      });

      const data = response.data;

      const results = data.results?.map(item => ({
        id: item.id,
        title: item.title || item.name,
        type: item.media_type,
        poster_path: item.poster_path
          ? `https://image.tmdb.org/t/p/original${item.poster_path}`
          : null,
        release_date: item.release_date || item.first_air_date || "N/A"
      })).filter(item => item.poster_path) || [];

      setSearchResults(results);

    } catch (error) {

      console.error("Erreur recherche TMDB:", error);
      setSearchResults([]);

    }

    setIsSearching(false);

  };

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">

      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Recherche TMDB</h2>
      </div>

      <div className="mb-4">

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
        >
          <option value="fr-FR">Français</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
          <option value="ko-KR">한국어</option>
          <option value="es-ES">Español</option>
          <option value="de-DE">Deutsch</option>
        </select>

        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Rechercher films, séries, manga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchTMDB(searchQuery)}
        />

        <button
          onClick={() => searchTMDB(searchQuery)}
          disabled={isSearching}
          className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? "Recherche..." : "Chercher"}
        </button>

      </div>

      <div className="max-h-96 overflow-y-auto">

        {isSearching ? (

          <p>Recherche en cours...</p>

        ) : searchResults.length === 0 ? (

          <p>Aucun film ne correspond à votre recherche.</p>

        ) : (

          <div className="grid grid-cols-2 gap-3">

            {searchResults.map((result) => (

              <div
                key={result.id}
                className="flex flex-col items-center p-2 border rounded-lg hover:bg-gray-50"
              >

                <img
                  src={result.poster_path}
                  alt={result.title}
                  className="w-full h-30 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity mb-2"
                  onClick={() => openPreview(result)}
                />

                <div className="text-center flex-1">
                  <h3 className="font-medium text-base truncate w-full">
                    {result.title}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {result.type} • {result.release_date}
                  </p>
                </div>

                <button
                  onClick={() => addTMDBPoster(result)}
                  className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 mt-2"
                >
                  <Plus className="w-3 h-3" />
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default PosterSearch;