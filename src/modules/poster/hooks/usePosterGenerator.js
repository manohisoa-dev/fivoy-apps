import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

export default function usePosterGenerator(user) {

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedPosters, setSelectedPosters] = useState([]);
  const [localImages, setLocalImages] = useState([]);

  const [orientation, setOrientation] = useState("portrait");
  const [columns, setColumns] = useState(3);

  const [selectedTemplate, setSelectedTemplate] = useState("none");
  const [showWatermark, setShowWatermark] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  const exportRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  const getPosterUrl = (poster) => {
    return poster.source === "tmdb"
      ? poster.poster_path
      : poster.url;
  };

  const removePoster = (id) => {
    setSelectedPosters((prev) =>
      prev.filter((p) => p.id !== id)
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

  const exportImage = async () => {

    if (!exportRef.current) return;

    const toastId = toast.loading("Génération de l'image...");
    setIsGenerating(true);

    try {

      const images = exportRef.current.querySelectorAll("img");

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = `fivoy-poster-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");

      link.click();

      toast.success("Image générée avec succès", { id: toastId });

    } catch (error) {

      console.error(error);
      toast.error("Erreur génération image", { id: toastId });

    } finally {

      setIsGenerating(false);

    }
  };

  return {

    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,

    selectedPosters,
    setSelectedPosters,

    localImages,
    setLocalImages,

    orientation,
    setOrientation,

    columns,
    setColumns,

    selectedTemplate,
    setSelectedTemplate,

    showWatermark,
    setShowWatermark,

    isGenerating,

    exportRef,
    previewRef,
    fileInputRef,

    getPosterUrl,
    removePoster,
    resetAll,
    exportImage

  };
}