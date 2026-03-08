import PosterTemplate from "../../PosterTemplate";

const PosterPreview = ({
  selectedPosters,
  columns,
  orientation,
  selectedTemplate,
  removePoster
}) => {

  const getPosterUrl = (poster) => {
    return poster.source === "tmdb"
      ? poster.poster_path
      : poster.url;
  };

  return (

    <div
      className={`border-2 border-gray-300 bg-white shadow-lg ${
        orientation === "portrait"
          ? "w-64 h-80"
          : "w-80 h-64"
      }`}
      style={{
        aspectRatio: orientation === "portrait"
          ? "210/297"
          : "297/210"
      }}
    >

      {selectedPosters.length === 0 ? (

        <div className="h-full flex items-center justify-center text-gray-400">
          Ajoutez des posters
        </div>

      ) : (

        <div
          className="grid gap-2 p-2 h-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`
          }}
        >

          {selectedPosters.map((poster, index) => (

            <div key={poster.id} className="relative group">

              <img
                src={getPosterUrl(poster)}
                className="w-full h-full object-cover rounded"
              />

              <div className="absolute top-0 left-0 text-white text-xs bg-black px-1">
                {index + 1}
              </div>

              <button
                onClick={() => removePoster(poster.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                ×
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default PosterPreview;