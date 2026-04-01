import React, { useState, useContext } from 'react';
import { PrinterCheck, Plus, X } from 'lucide-react';
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import PosterTemplate from "../PosterTemplate";
import LoadingOverlay from "../../components/LoadingOverlay";
import { jsPDF } from "jspdf";

import usePosterGenerator from "./hooks/usePosterGenerator";

import PosterSearch from "./components/PosterSearch";
import PosterPreview from "./components/PosterPreview";
import PosterModal from "./components/PosterModal";
import PosterUpload from "./components/PosterUpload";
import html2canvas from "html2canvas";

const PosterGenerator = () => {

  const { user } = useContext(AuthContext);

  const poster = usePosterGenerator(user);
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const badgeConfig =
  typeof user?.boutique?.badge_config === "string"
    ? JSON.parse(user?.boutique?.badge_config)
    : user?.boutique?.badge_config || {};

  const {
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

    exportRef,
    previewRef,
    fileInputRef,

    isGenerating,

    getPosterUrl,
    removePoster,
    resetAll,
    exportImage

  } = poster;

  const [isDragOver, setIsDragOver] = useState(false);

  // Etats et gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // États pour le modal avancé
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [movieDetails, setMovieDetails] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // États pour la langue (ajoute ça avec les autres états)
  const [selectedLanguage, setSelectedLanguage] = useState('fr-FR');

  const fetchMovieDetails = async (movieId, mediaType) => {
    setLoadingDetails(true);

    try {
      const response = await api.get(`/tmdb/details/${mediaType}/${movieId}`, {
        params: {
          language: selectedLanguage
        }
      });

      const { details, images, videos, similar } = response.data;

      const trailer = videos.results?.find(v => 
        v.type === "Trailer" && v.site === "YouTube"
      ) || videos.results?.[0];

      const alternativePosters = images.posters?.slice(0, 12).map(poster => ({
        path: `https://image.tmdb.org/t/p/w300${poster.file_path}`,
        fullPath: `https://image.tmdb.org/t/p/original${poster.file_path}`,
        language: poster.iso_639_1,
        vote_average: poster.vote_average
      })) || [];

      const backdrops = images.backdrops?.slice(0, 8).map(backdrop => ({
        path: `https://image.tmdb.org/t/p/w300${backdrop.file_path}`,
        fullPath: `https://image.tmdb.org/t/p/original${backdrop.file_path}`,
        vote_average: backdrop.vote_average
      })) || [];

      const similarResults = similar.results?.slice(0, 6).map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path 
          ? `https://image.tmdb.org/t/p/w200${item.poster_path}` 
          : null,
      })).filter(item => item.poster_path) || [];

      setMovieDetails({
        ...details,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        alternativePosters,
        backdrops
      });

      setSimilarMovies(similarResults);

    } catch (error) {
      console.error("Erreur détails TMDB:", error);
    }

    setLoadingDetails(false);
  };

  const openPreview = async (poster) => {
    setSelectedPreviewImage(poster);
    setShowModal(true);
    setZoomLevel(1);
    await fetchMovieDetails(poster.id, poster.type);
  };

  const closePreview = () => {
    setShowModal(false);
    setSelectedPreviewImage(null);
    setMovieDetails(null);
    setSimilarMovies([]);
    setZoomLevel(1);
  };

  // Simulation de l'API TMDB
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
        release_date: item.release_date || item.first_air_date || 'N/A'
      })).filter(item => item.poster_path) || [];

      setSearchResults(results);

    } catch (error) {
      console.error("Erreur recherche TMDB:", error);
      setSearchResults([]);
    }

    setIsSearching(false);
  };

  // Gestion de l'upload d'images locales
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
    
    // Reset l'input
    if (poster.fileInputRef.current) {
      poster.fileInputRef.current.value = '';
    }
  };

  // Ajouter un poster depuis TMDB
  const addTMDBPoster = (poster) => {
    const newPoster = {
      ...poster,
      id: `tmdb_${poster.id}_${Date.now()}`,
      source: 'tmdb'
    };
    setSelectedPosters(prev => [...prev, newPoster]);
  };

  // Fonction commune pour traiter les fichiers (drag & drop + clic)
  const processFiles = (files) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: e.target.result,
            type: 'local',
            file: file
          };
          setLocalImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Ajouter une image locale
  const addLocalImage = (image) => {
    const newPoster = {
      ...image,
      title: image.name,
      source: 'local'
    };
    setSelectedPosters(prev => [...prev, newPoster]);
  };


  // Supprimer une image locale
  const removeLocalImage = (imageId) => {
    setLocalImages(prev => prev.filter(img => img.id !== imageId));
  };


  // Génération PDF réelle avec jsPDF
  const generatePDF = async () => {
    if (!exportRef.current) return;

    const canvas = await html2canvas(exportRef.current, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF({
      orientation: orientation === "portrait" ? "p" : "l",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

    pdf.save(`fivoy-posters-${Date.now()}.pdf`);
  };

  return (
    <>
    {isGenerating && <LoadingOverlay />}
    
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h1 className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-2">
            <PrinterCheck className="w-8 h-8 text-primary mr-2" />
            Générateur de Posters PDF
          </h1>
          <p className="text-gray-600 text-center">
            Recherchez dans TMDB ou uploadez vos images pour créer des posters A4
          </p>

        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">Badge :</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="none">Aucun badge</option>

            {Object.entries(badgeConfig).map(([key, badge]) => (
              <option key={key} value={key}>
                {badge.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 mt-2">
            <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
            />
            <label className="text-sm text-gray-600">
                Ajouter le watermark de la boutique
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 my-6">
          {/* Colonne gauche - Recherche TMDB */}
          <PosterSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            addTMDBPoster={addTMDBPoster}
            openPreview={openPreview}
          />

          {/* Colonne centrale - Prévisualisation A4 */}
          <PosterPreview
            user={user}
            badgeConfig={badgeConfig}
            selectedPosters={selectedPosters}
            orientation={orientation}
            setOrientation={setOrientation}
            columns={columns}
            setColumns={setColumns}
            selectedTemplate={selectedTemplate}
            showWatermark={showWatermark}
            exportRef={exportRef}
            previewRef={previewRef}
            getPosterUrl={getPosterUrl}
            removePoster={removePoster}
            generatePDF={generatePDF}
            exportImage={exportImage}
            resetAll={resetAll}
          />

          {/* Colonne droite - Upload local et gestion */}
          <PosterUpload
            fileInputRef={poster.fileInputRef}
            handleFileUpload={handleFileUpload}
            handleDragOver={handleDragOver}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            isDragOver={isDragOver}
            localImages={localImages}
            addLocalImage={addLocalImage}
            removeLocalImage={removeLocalImage}
            selectedPosters={selectedPosters}
            removePoster={removePoster}
           />
        </div>
      </div>

      {/* Modal de prévisualisation avancé */}
      <PosterModal
        showModal={showModal}
        selectedPreviewImage={selectedPreviewImage}
        closePreview={closePreview}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        addTMDBPoster={addTMDBPoster}
        loadingDetails={loadingDetails}
        movieDetails={movieDetails}
        similarMovies={similarMovies}
      />

    </div>
    </>
  );
};

export default PosterGenerator;