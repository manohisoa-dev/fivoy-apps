import React, { useState, useRef } from 'react';
import { PrinterCheck , Search, Upload, Download, Trash2, RotateCcw, Plus, X, Grid, FileImage } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PosterGenerator = () => {
  // États pour la recherche TMDB
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // États pour la configuration
  const [orientation, setOrientation] = useState('portrait'); // portrait ou landscape
  const [columns, setColumns] = useState(3);
  
  // État pour les posters sélectionnés
  const [selectedPosters, setSelectedPosters] = useState([]);
  
  // États pour l'upload local
  const [localImages, setLocalImages] = useState([]);
  const fileInputRef = useRef(null);

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
      const API_KEY = '4c491bc729de9f07597d8cd6c688973f';
      
      // Récupérer les détails du film/série
      const detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${API_KEY}&language=${selectedLanguage}`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();
      
      // Récupérer les images (posters + backdrops)
      const imagesUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}/images?api_key=${API_KEY}`;
      const imagesResponse = await fetch(imagesUrl);
      const images = await imagesResponse.json();
      
      // Récupérer les vidéos (bande-annonce)
      const videosUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${API_KEY}&language=fr-FR`;
      const videosResponse = await fetch(videosUrl);
      const videos = await videosResponse.json();
      
      // Récupérer les films/séries similaires
      const similarUrl = `https://api.themoviedb.org/3/${mediaType}/${movieId}/similar?api_key=${API_KEY}&language=${selectedLanguage}&page=1`;
      const similarResponse = await fetch(similarUrl);
      const similar = await similarResponse.json();
      
      const trailer = videos.results?.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.results?.[0];
      
      // Traiter les posters alternatifs (limiter à 12 pour ne pas surcharger)
      const alternativePosters = images.posters?.slice(0, 12).map(poster => ({
        path: `https://image.tmdb.org/t/p/w300${poster.file_path}`,
        fullPath: `https://image.tmdb.org/t/p/original${poster.file_path}`,
        language: poster.iso_639_1,
        vote_average: poster.vote_average
      })) || [];
      
      // Traiter les backdrops (images horizontales)
      const backdrops = images.backdrops?.slice(0, 8).map(backdrop => ({
        path: `https://image.tmdb.org/t/p/w300${backdrop.file_path}`,
        fullPath: `https://image.tmdb.org/t/p/original${backdrop.file_path}`,
        vote_average: backdrop.vote_average
      })) || [];
      
      const similarResults = similar.results?.slice(0, 6).map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
      })).filter(item => item.poster_path) || [];
      
      setMovieDetails({
        ...details,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        alternativePosters,
        backdrops
      });
      setSimilarMovies(similarResults);
      
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
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
        const API_KEY = '4c491bc729de9f07597d8cd6c688973f';
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${selectedLanguage}&include_adult=true`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const results = data.results?.map(item => ({
          id: item.id,
          title: item.title || item.name,
          type: item.media_type,
          poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : null,
          release_date: item.release_date || item.first_air_date || 'N/A'
        })).filter(item => item.poster_path) || [];
        
        setSearchResults(results);
    } catch (error) {
      console.error('Erreur recherche TMDB:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Gestion de l'upload d'images locales
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
    
    // Reset l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Supprimer un poster sélectionné
  const removePoster = (posterId) => {
    setSelectedPosters(prev => prev.filter(p => p.id !== posterId));
  };

  // Supprimer une image locale
  const removeLocalImage = (imageId) => {
    setLocalImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Reset complet
  const resetAll = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPosters([]);
    setLocalImages([]);
    setOrientation('portrait');
    setColumns(3);
  };

  // Génération PDF réelle avec jsPDF
  const generatePDF = async () => {
    if (selectedPosters.length === 0) {
      alert('Veuillez ajouter au moins un poster avant de générer le PDF.');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: orientation === 'portrait' ? 'p' : 'l',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 2;
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);

      // Calcul des dimensions par poster
      const posterWidth = availableWidth / columns;

      // Calcul fixe et simple selon le nombre de posters
      let maxRows;
      let posterHeight;

      if (columns === 1) {
        // En mode 1 colonne, déterminer combien d'images on veut par page
        if (selectedPosters.length <= 2) {
          maxRows = 2; // Max 2 images par page
        } else if (selectedPosters.length <= 4) {
          maxRows = Math.min(4, selectedPosters.length); // Max 4 images par page
        } else {
          maxRows = 5; // Max 5 images par page pour économiser le papier
        }
        posterHeight = availableHeight / maxRows;
      } else {
        // Pour plusieurs colonnes
        maxRows = Math.floor(availableHeight / (posterWidth * 1.4));
        posterHeight = availableHeight / maxRows;
      }

      const postersPerPage = columns * maxRows;

      let currentPage = 0;
      let positionX = margin;
      let positionY = margin;

      // Fonction pour charger une image en base64
      const loadImageAsBase64 = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
          img.src = src;
        });
      };

      // Traitement de chaque poster
      for (let i = 0; i < selectedPosters.length; i++) {
        const poster = selectedPosters[i];
        
        // Nouvelle page si nécessaire
        if (i > 0 && i % postersPerPage === 0) {
          pdf.addPage();
          positionX = margin;
          positionY = margin;
        }

        try {
          let imageSrc = poster.source === 'tmdb' ? poster.poster_path : poster.url;
          
          // Charger l'image
          if (poster.source === 'tmdb') {
            // Pour TMDB, charger depuis l'URL
            imageSrc = await loadImageAsBase64(imageSrc);
          }
          // Pour les images locales, elles sont déjà en base64

          // Ajouter l'image au PDF
          pdf.addImage(
            imageSrc,
            'JPEG',
            positionX,
            positionY,
            posterWidth - 1, // Petite marge entre posters
            posterHeight - 1,
            undefined,
            'FAST'
          );

        } catch (error) {
          console.error('Erreur lors du chargement de l\'image:', error);
          
          // Dessiner un rectangle de remplacement
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(positionX, positionY, posterWidth - 2, posterHeight - 2);
          pdf.setFontSize(10);
          pdf.text('Image non disponible', positionX + 5, positionY + posterHeight / 2);
        }

        // Calculer la position suivante
        positionX += posterWidth;
        if ((i + 1) % columns === 0) {
          positionX = margin;
          positionY += posterHeight - 0.5; // juste -0.5 pour une petite séparation
        }
      }

      // Télécharger le PDF
      const filename = `fivoy-posters-${new Date().getTime()}.pdf`;
      pdf.save(filename);

      // Notification de succès
      if (window.Swal) {
        window.Swal.fire({
          title: 'PDF généré avec succès!',
          text: `${selectedPosters.length} posters • ${orientation} • ${columns} colonnes`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        alert(`PDF téléchargé avec succès!\n${selectedPosters.length} posters inclus`);
      }

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h1 className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-2">
            <PrinterCheck className="w-8 h-8 text-blue-600 mr-2" />
            Générateur de Posters PDF
          </h1>
          <p className="text-gray-600 text-center">
            Recherchez dans TMDB ou uploadez vos images pour créer des posters A4
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 my-6">
          {/* Colonne gauche - Recherche TMDB */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
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
                  <option value="ja-JP">日本語 (Japonais)</option>
                  <option value="ko-KR">한국어 (Coréen)</option>
                  <option value="es-ES">Español</option>
                  <option value="de-DE">Deutsch</option>
                </select>

                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Rechercher films, séries, manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTMDB(searchQuery)}
                />
                <button
                  onClick={() => searchTMDB(searchQuery)}
                  disabled={isSearching}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSearching ? 'Recherche...' : 'Chercher'}
                </button>
            </div>

            {/* Résultats de recherche */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <p>Recherche en cours...</p>
              ) : searchResults.length === 0 ? (
                <p>Aucun film ne correspond à votre recherche.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex flex-col items-center p-2 border rounded-lg hover:bg-gray-50">
                      <img
                        src={result.poster_path}
                        alt={result.title}
                        className="w-full h-30 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity mb-2"
                        onClick={() => openPreview(result)}
                      />
                      <div className="text-center flex-1">
                        <h3 className="font-medium text-base truncate w-full">{result.title}</h3>
                        <p className="text-xs text-gray-500">{result.type} • {result.release_date}</p>
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

          {/* Colonne centrale - Prévisualisation A4 */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <div className="flex  flex-wrap items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileImage className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Prévisualisation A4</h2>
              </div>
              <div className="text-sm text-gray-600">
                {orientation === 'portrait' ? 'Portrait' : 'Paysage'} • {columns} colonnes • {selectedPosters.length} posters
              </div>
            </div>

            {/* Simulation du papier A4 */}
            <div className="flex justify-center">
              <div
                className={`border-2 border-gray-300 bg-white shadow-lg ${
                  orientation === 'portrait' 
                    ? 'w-64 h-80' // Ratio A4 portrait approximatif
                    : 'w-80 h-64' // Ratio A4 paysage approximatif
                }`}
                style={{
                  aspectRatio: orientation === 'portrait' ? '210/297' : '297/210'
                }}
              >
                {selectedPosters.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileImage className="w-12 h-12 mx-auto mb-2" />
                      <p>Ajoutez des posters pour voir la prévisualisation</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`grid gap-8 p-2 h-full`}
                    style={{
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridAutoRows: '1fr'
                    }}
                  >
                    {selectedPosters.map((poster, index) => (
                      <div
                        key={poster.id}
                        className="relative bg-gray-100 rounded overflow-hidden group"
                      >
                        <img
                          src={poster.source === 'tmdb' ? poster.poster_path : poster.url}
                          alt={poster.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay pour montrer le numéro d'ordre */}
                        <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded-br">
                          {index + 1}
                        </div>
                        {/* Bouton supprimer visible au hover */}
                        <button
                          onClick={() => removePoster(poster.id)}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Cases vides pour montrer la grille complète */}
                    {Array.from({ 
                      length: Math.max(0, columns * Math.ceil(selectedPosters.length / columns) - selectedPosters.length)
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Configuration rapide */}
            <div className="flex flex-wrap gap-2 items-center justify-center space-x-4 mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">Orientation:</span>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-2 py-1 text-xs rounded ${
                    orientation === 'portrait' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-2 py-1 text-xs rounded ${
                    orientation === 'landscape' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  Paysage
                </button>
              </div>

              <div className="flex flex-wrap items-center space-x-2">
                <span className="text-sm text-gray-600">Colonnes:</span>
                <select
                  value={columns}
                  onChange={(e) => setColumns(parseInt(e.target.value))}
                  className="px-2 py-1 text-xs border rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </div>


            {/* Boutons d'action principaux */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={generatePDF}
                disabled={selectedPosters.length === 0}
                className="flex-1 min-w-[150px] bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger PDF</span>
              </button>

              <button
                onClick={resetAll}
                className="flex-1 min-w-[150px] bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>

          </div>

          {/* Colonne droite - Upload local et gestion */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Images locales</h2>
            </div>

            {/* Zone de upload avec drag & drop */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-purple-500 hover:bg-gray-100'
                }`}
              >
                <FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">
                  {isDragOver ? 'Relâchez pour ajouter les images' : 'Glissez-déposez vos images ici'}
                </p>
                <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
              </div>
            </div>

            {/* Images uploadées */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {localImages.map((image) => (
                <div key={image.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{image.name}</h3>
                    <p className="text-xs text-gray-500">Image locale</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => addLocalImage(image)}
                      className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeLocalImage(image.id)}
                      className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Liste des posters sélectionnés */}
            {selectedPosters.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Dans le PDF ({selectedPosters.length})</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedPosters.map((poster, index) => (
                    <div key={poster.id} className="flex items-center space-x-2 p-1 bg-gray-50 rounded text-xs">
                      <span className="w-4 text-center text-gray-500">{index + 1}</span>
                      <span className="flex-1 truncate">{poster.title}</span>
                      <button
                        onClick={() => removePoster(poster.id)}
                        className="w-4 h-4 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation avancé */}
      {showModal && selectedPreviewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          <div className="relative w-full h-full max-w-6xl max-h-screen overflow-auto">
            <button
              onClick={closePreview}
              className="fixed top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col lg:flex-row h-full p-4">
              {/* Section image avec zoom */}
              <div className="lg:w-1/2 flex flex-col items-center">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={selectedPreviewImage.poster_path.replace('w300', 'original')}
                    alt={selectedPreviewImage.title}
                    className="transition-transform duration-300 rounded-lg shadow-2xl max-h-[600px]"
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      maxWidth: '600px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Contrôles zoom */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Zoom -
                  </button>
                  <span className="px-3 py-1 bg-gray-800 text-white rounded">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Zoom +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addTMDBPoster(selectedPreviewImage);
                    closePreview();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter ce poster</span>
                </button>
              </div>

              {/* Section détails */}
              <div className="lg:w-1/2 lg:pl-6 text-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-3xl font-bold mb-2">{selectedPreviewImage.title}</h2>
                <p className="text-gray-300 mb-4">{selectedPreviewImage.type} • {selectedPreviewImage.release_date}</p>
                
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="mt-2">Chargement des détails...</p>
                  </div>
                ) : movieDetails ? (
                  <div className="space-y-4">
                    {/* Genres */}
                    {movieDetails.genres && (
                      <div>
                        <h3 className="font-semibold mb-2">Genres:</h3>
                        <div className="flex flex-wrap gap-2">
                          {movieDetails.genres.map(genre => (
                            <span key={genre.id} className="px-2 py-1 bg-blue-600 rounded text-sm">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Classification */}
                    {movieDetails.adult !== undefined && (
                      <div>
                        <h3 className="font-semibold mb-1">Classification:</h3>
                        <span className="px-2 py-1 bg-red-600 rounded text-sm">
                          {movieDetails.adult ? '18+' : 'Tout public'}
                        </span>
                      </div>
                    )}

                    {/* Synopsis */}
                    {movieDetails.overview && (
                      <div>
                        <h3 className="font-semibold mb-2">Synopsis:</h3>
                        <p className="text-gray-200 leading-relaxed">{movieDetails.overview}</p>
                      </div>
                    )}

                    {/* Note */}
                    {movieDetails.vote_average && (
                      <div>
                        <h3 className="font-semibold mb-1">Note:</h3>
                        <span className="px-2 py-1 bg-yellow-600 rounded text-sm">
                          ⭐ {movieDetails.vote_average.toFixed(1)}/10
                        </span>
                      </div>
                    )}

                    {/* Bande-annonce */}
                    {movieDetails.trailer && (
                      <div>
                        <a
                          href={movieDetails.trailer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          🎬 Voir la bande-annonce
                        </a>
                      </div>
                    )}

                    {/* Films/Séries similaires */}
                    {similarMovies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Titres similaires:</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {similarMovies.map(similar => (
                            <div key={similar.id} className="text-center">
                              <img
                                src={similar.poster_path}
                                alt={similar.title}
                                className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  const newPoster = {
                                    ...selectedPreviewImage,
                                    id: similar.id,
                                    title: similar.title,
                                    poster_path: similar.poster_path.replace('w300', 'original'),
                                  };
                                  addTMDBPoster(newPoster);
                                }}
                              />
                              <p className="text-xs mt-1 truncate">{similar.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images alternatives */}
                    {movieDetails.alternativePosters && movieDetails.alternativePosters.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Posters alternatifs:</h3>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {movieDetails.alternativePosters.map((poster, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={poster.path}
                                alt={`Poster ${index + 1}`}
                                className="w-full h-50 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              {/* Badge de qualité */}
                              {poster.vote_average > 0 && (
                                <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                                  ⭐ {poster.vote_average.toFixed(1)}
                                </div>
                              )}
                              {/* Badge langue */}
                              {poster.language && (
                                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                                  {poster.language.toUpperCase()}
                                </div>
                              )}
                              {/* Overlay cliquable */}
                              <div 
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newPoster = {
                                    id: `${selectedPreviewImage.id}_alt_${index}_${Date.now()}`,
                                    title: `${selectedPreviewImage.title} (Alt ${index + 1})`,
                                    poster_path: poster.fullPath,
                                    type: selectedPreviewImage.type,
                                    source: 'tmdb'
                                  };
                                  addTMDBPoster(newPoster);
                                }}
                              >
                                <Plus className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images backdrop (horizontales) */}
                    {movieDetails.backdrops && movieDetails.backdrops.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Images panoramiques:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {movieDetails.backdrops.map((backdrop, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={backdrop.path}
                                alt={`Backdrop ${index + 1}`}
                                className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              {/* Badge de qualité */}
                              {backdrop.vote_average > 0 && (
                                <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                                  ⭐ {backdrop.vote_average.toFixed(1)}
                                </div>
                              )}

                              {/* Overlay cliquable */}
                              <div 
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newPoster = {
                                    id: `${selectedPreviewImage.id}_alt_${index}_${Date.now()}`,
                                    title: `${selectedPreviewImage.title} (Alt ${index + 1})`,
                                    poster_path: backdrop.fullPath,
                                    type: selectedPreviewImage.type,
                                    source: 'tmdb'
                                  };
                                  addTMDBPoster(newPoster);
                                }}
                              >
                                <Plus className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PosterGenerator;