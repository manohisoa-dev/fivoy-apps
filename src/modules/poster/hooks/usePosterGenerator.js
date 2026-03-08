import { useState } from "react";

export const usePosterGenerator = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [selectedPosters, setSelectedPosters] = useState([]);

  const [localImages, setLocalImages] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState("standard");

  const [orientation, setOrientation] = useState("portrait");

  const [columns, setColumns] = useState(3);

  const addTMDBPoster = (poster) => {

    const newPoster = {
      ...poster,
      id: `tmdb_${poster.id}_${Date.now()}`,
      source: "tmdb"
    };

    setSelectedPosters(prev => [...prev, newPoster]);

  };

  const addLocalImage = (image) => {

    const newPoster = {
      ...image,
      title: image.name,
      source: "local"
    };

    setSelectedPosters(prev => [...prev, newPoster]);

  };

  const removePoster = (posterId) => {

    setSelectedPosters(prev =>
      prev.filter(p => p.id !== posterId)
    );

  };

  const removeLocalImage = (imageId) => {

    setLocalImages(prev =>
      prev.filter(img => img.id !== imageId)
    );

  };

  const resetAll = () => {

    setSearchQuery("");
    setSearchResults([]);
    setSelectedPosters([]);
    setLocalImages([]);
    setOrientation("portrait");
    setColumns(3);

  };

  return {

    searchQuery,
    setSearchQuery,

    searchResults,
    setSearchResults,

    selectedPosters,
    setSelectedPosters,

    localImages,
    setLocalImages,

    selectedTemplate,
    setSelectedTemplate,

    orientation,
    setOrientation,

    columns,
    setColumns,

    addTMDBPoster,
    addLocalImage,
    removePoster,
    removeLocalImage,
    resetAll

  };

};