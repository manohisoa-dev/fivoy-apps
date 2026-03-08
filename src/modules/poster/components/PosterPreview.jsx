import React from "react";
import { FileImage, Plus, X, Download, RotateCcw } from "lucide-react";
import PosterTemplate from "../../PosterTemplate";

const PosterPreview = ({
  user,
  selectedPosters,
  orientation,
  setOrientation,
  columns,
  setColumns,
  selectedTemplate,
  showWatermark,
  exportRef,
  previewRef,
  getPosterUrl,
  removePoster,
  generatePDF,
  exportImage,
  resetAll
}) => {
  const scale =
    columns === 1 ? 0.45 :
    columns === 2 ? 0.28 :
    columns === 3 ? 0.18 :
    columns === 4 ? 0.14 :
    0.10;

  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">

      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileImage className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Prévisualisation A4</h2>
        </div>

        <div className="text-sm text-gray-600">
          {orientation === "portrait" ? "Portrait" : "Paysage"} • {columns} colonnes • {selectedPosters.length} posters
        </div>
      </div>

      {/* zone invisible pour export */}
      <div
        style={{
          position: "fixed",
          top: "-10000px",
          left: "-10000px",
          opacity: 1,
          pointerEvents: "none"
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "20px",
            padding: "20px",
            background: "white"
          }}
        >

          {selectedPosters.map((poster) => (
            <PosterTemplate
              key={poster.id}
              poster={poster.source === "tmdb" ? poster.poster_path : poster.url}
              template={selectedTemplate}
              watermark={showWatermark}
              boutiqueName={user?.boutique?.name}
              boutiqueLogo={user?.boutique?.logo_url}
            />
          ))}

        </div>
      </div>

      {/* preview */}
      <div className="flex justify-center">

        <div
          ref={previewRef}
          className={`border-2 border-gray-300 bg-white shadow-lg ${
            orientation === "portrait"
              ? "w-64 h-80"
              : "w-80 h-64"
          }`}
          style={{
            aspectRatio: orientation === "portrait" ? "210/297" : "297/210"
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
                className="grid gap-2 p-2 h-full"
                style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`
                }}
              >
                
              {selectedPosters.map((poster, index) => (

                  <div
                    key={poster.id}
                    className="relative bg-gray-100 rounded overflow-hidden group flex items-center justify-center"
                  >


                  <div
                    style={{
                        width: "1080px",
                        height: "1350px",
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }}
                  >

                  <PosterTemplate
                    poster={getPosterUrl(poster)}
                    template={selectedTemplate}
                    watermark={showWatermark}
                    boutiqueName={user?.boutique?.name}
                    boutiqueLogo={user?.boutique?.logo_url}
                  />
                  </div>

                  <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded-br">
                    {index + 1}
                  </div>

                  <button
                    onClick={() => removePoster(poster.id)}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-2 h-2" />
                  </button>

                </div>

              ))}

              {Array.from({
                length: Math.max(
                  0,
                  columns * Math.ceil(selectedPosters.length / columns) -
                    selectedPosters.length
                )
              }).map((_, index) => (

                <div
                  key={index}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-gray-300" />
                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* configuration */}
      <div className="flex flex-wrap gap-2 items-center justify-center mt-4 p-3 bg-gray-50 rounded-lg">

        <span className="text-sm text-gray-600">Orientation:</span>

        <button
          onClick={() => setOrientation("portrait")}
          className={`px-2 py-1 text-xs rounded ${
            orientation === "portrait"
              ? "bg-primary text-white"
              : "bg-white border"
          }`}
        >
          Portrait
        </button>

        <button
          onClick={() => setOrientation("landscape")}
          className={`px-2 py-1 text-xs rounded ${
            orientation === "landscape"
              ? "bg-primary text-white"
              : "bg-white border"
          }`}
        >
          Paysage
        </button>

        <span className="text-sm text-gray-600 ml-4">Colonnes:</span>

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

      {/* actions */}
      <div className="flex flex-col gap-2 mt-4">

        <button
          onClick={generatePDF}
          disabled={selectedPosters.length === 0}
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Télécharger PDF</span>
        </button>

        <button
          onClick={exportImage}
          disabled={selectedPosters.length === 0}
          className="bg-purple-600 text-black py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
        >
          <FileImage className="w-5 h-5" />
          <span>Télécharger Image</span>
        </button>

        <button
          onClick={resetAll}
          className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>

      </div>

    </div>
  );
};

export default PosterPreview;