import api from "../../../api/api";

export const searchTMDB = async (query, language = "fr-FR") => {

  if (!query.trim()) return [];

  try {

    const response = await api.get("/tmdb/search", {
      params: {
        query,
        language
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

    return results;

  } catch (error) {

    console.error("Erreur recherche TMDB:", error);
    return [];

  }

};