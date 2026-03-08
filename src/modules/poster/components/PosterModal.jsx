import React from "react";
import { Plus, X } from "lucide-react";

const PosterModal = ({
  showModal,
  selectedPreviewImage,
  closePreview,
  zoomLevel,
  setZoomLevel,
  addTMDBPoster,
  loadingDetails,
  movieDetails,
  similarMovies
}) => {

  if (!showModal || !selectedPreviewImage) return null;

  return (
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

          {/* IMAGE */}
          <div className="lg:w-1/2 flex flex-col items-center">

            <div className="relative overflow-hidden rounded-lg mb-4">

              <img
                src={selectedPreviewImage.poster_path.replace("w300", "original")}
                alt={selectedPreviewImage.title}
                className="transition-transform duration-300 rounded-lg shadow-2xl max-h-[600px]"
                style={{
                  transform: `scale(${zoomLevel})`,
                  maxWidth: "600px"
                }}
                onClick={(e) => e.stopPropagation()}
              />

            </div>

            {/* ZOOM */}

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


          {/* DETAILS */}

          <div
            className="lg:w-1/2 lg:pl-6 text-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-3xl font-bold mb-2">
              {selectedPreviewImage.title}
            </h2>

            <p className="text-gray-300 mb-4">
              {selectedPreviewImage.type} • {selectedPreviewImage.release_date}
            </p>


            {loadingDetails ? (

              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2">Chargement des détails...</p>
              </div>

            ) : movieDetails ? (

              <div className="space-y-4">

                {/* GENRES */}

                {movieDetails.genres && (

                  <div>

                    <h3 className="font-semibold mb-2">Genres:</h3>

                    <div className="flex flex-wrap gap-2">

                      {movieDetails.genres.map((genre) => (

                        <span
                          key={genre.id}
                          className="px-2 py-1 bg-primary rounded text-sm"
                        >
                          {genre.name}
                        </span>

                      ))}

                    </div>

                  </div>

                )}

                {/* SYNOPSIS */}

                {movieDetails.overview && (

                  <div>

                    <h3 className="font-semibold mb-2">Synopsis:</h3>

                    <p className="text-gray-200 leading-relaxed">
                      {movieDetails.overview}
                    </p>

                  </div>

                )}

                {/* NOTE */}

                {movieDetails.vote_average && (

                  <div>

                    <h3 className="font-semibold mb-1">Note:</h3>

                    <span className="px-2 py-1 bg-yellow-600 rounded text-sm">
                      ⭐ {movieDetails.vote_average.toFixed(1)}/10
                    </span>

                  </div>

                )}

                {/* BANDE ANNONCE */}

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

                {/* POSTERS ALTERNATIFS */}

                {movieDetails.alternativePosters && movieDetails.alternativePosters.length > 0 && (

                  <div>

                    <h3 className="font-semibold mb-3">
                      Posters alternatifs
                    </h3>

                    <div className="grid grid-cols-3 gap-2 mb-3">

                      {movieDetails.alternativePosters.map((poster, index) => (

                        <div key={index} className="relative group">

                          <img
                            src={poster.path}
                            alt={`Poster ${index + 1}`}
                            className="w-full h-50 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          />

                          {poster.vote_average > 0 && (
                            <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                              ⭐ {poster.vote_average.toFixed(1)}
                            </div>
                          )}

                          {poster.language && (
                            <div className="absolute top-1 right-1 bg-primary text-white text-xs px-1 rounded">
                              {poster.language.toUpperCase()}
                            </div>
                          )}

                          <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                            onClick={(e) => {

                              e.stopPropagation()

                              const newPoster = {
                                id: `${selectedPreviewImage.id}_alt_${index}_${Date.now()}`,
                                title: `${selectedPreviewImage.title} (Alt ${index + 1})`,
                                poster_path: poster.fullPath,
                                type: selectedPreviewImage.type,
                                source: 'tmdb'
                              }

                              addTMDBPoster(newPoster)

                            }}
                          >

                            <Plus className="w-6 h-6 text-white" />

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

                {/* BACKDROPS */}

                {movieDetails.backdrops && movieDetails.backdrops.length > 0 && (

                  <div>

                    <h3 className="font-semibold mb-3">
                      Images panoramiques
                    </h3>

                    <div className="grid grid-cols-2 gap-2">

                      {movieDetails.backdrops.map((backdrop, index) => (

                        <div key={index} className="relative group">

                          <img
                            src={backdrop.path}
                            alt={`Backdrop ${index + 1}`}
                            className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          />

                          {backdrop.vote_average > 0 && (
                            <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                              ⭐ {backdrop.vote_average.toFixed(1)}
                            </div>
                          )}

                          <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                            onClick={(e) => {

                              e.stopPropagation()

                              const newPoster = {
                                id: `${selectedPreviewImage.id}_back_${index}_${Date.now()}`,
                                title: `${selectedPreviewImage.title} (Backdrop ${index + 1})`,
                                poster_path: backdrop.fullPath,
                                type: selectedPreviewImage.type,
                                source: 'tmdb'
                              }

                              addTMDBPoster(newPoster)

                            }}
                          >

                            <Plus className="w-6 h-6 text-white" />

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

                {/* SIMILAR */}

                {similarMovies.length > 0 && (

                  <div>

                    <h3 className="font-semibold mb-3">
                      Titres similaires:
                    </h3>

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
                                poster_path: similar.poster_path.replace("w300", "original"),
                              };

                              addTMDBPoster(newPoster);

                            }}
                          />

                          <p className="text-xs mt-1 truncate">
                            {similar.title}
                          </p>

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
  );
};

export default PosterModal;