import React from "react";
import { Upload, FileImage, Plus, Trash2, X } from "lucide-react";

const PosterUpload = ({
  fileInputRef,
  handleFileUpload,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  isDragOver,
  localImages,
  addLocalImage,
  removeLocalImage,
  selectedPosters,
  removePoster
}) => {

  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">

      <div className="flex items-center space-x-2 mb-4">
        <Upload className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Images locales</h2>
      </div>

      {/* zone upload */}
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
              ? "border-primary bg-purple-50"
              : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-100"
          }`}
        >

          <FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />

          <p className="text-gray-600 font-medium">
            {isDragOver
              ? "Relâchez pour ajouter les images"
              : "Glissez-déposez vos images ici"}
          </p>

          <p className="text-sm text-gray-500">
            ou cliquez pour sélectionner
          </p>

        </div>
      </div>

      {/* images uploadées */}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">

        {localImages.map((image) => (

          <div
            key={image.id}
            className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50"
          >

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

      {/* liste dans le pdf */}

      {selectedPosters.length > 0 && (

        <div>

          <h3 className="font-medium text-gray-700 mb-2">
            Dans le PDF ({selectedPosters.length})
          </h3>

          <div className="space-y-1 max-h-32 overflow-y-auto">

            {selectedPosters.map((poster, index) => (

              <div
                key={poster.id}
                className="flex items-center space-x-2 p-1 bg-gray-50 rounded text-xs"
              >

                <span className="w-4 text-center text-gray-500">
                  {index + 1}
                </span>

                <span className="flex-1 truncate">
                  {poster.title}
                </span>

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
  );
};

export default PosterUpload;