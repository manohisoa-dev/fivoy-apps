const PosterTemplate = ({ poster, template, watermark = false, boutiqueName, boutiqueLogo }) => {

  const ribbonText = {
    film: "FILM",
    serie: "SÉRIE",
    nouveaute: "NOUVEAUTÉ",
    vostfr: "VOSTFR",
    drama: "DRAMA",
    cartoon: "CARTOON",
    manga: "MANGA"
  };

  const badgeColors = {
    film: "#3b82f6",
    serie: "#10b981",
    nouveaute: "#ef4444",
    vostfr: "#f59e0b",
    drama: "#8b5cf6",
    cartoon: "#06b6d4",
    manga: "#ec4899"
  }

  return (

    <div className="relative w-[1080px] h-[1350px] bg-black rounded-[20px] overflow-hidden">

      <img
        src={poster}
        className="w-full h-full object-cover"
      />

      {template && template !== "none" && (
        <div
          className="absolute top-6 right-6 text-white px-4 py-8 rounded-md text-4xl font-bold"
          style={{
            backgroundColor: badgeColors[template] || "#ef4444",
            zIndex: 20
          }}
        >
          {ribbonText[template]}
        </div>
      )}
      

      {watermark && (
        <>
          {boutiqueLogo && (
            <img
              src={boutiqueLogo}
              className="absolute bottom-10 right-10 w-[120px] opacity-20"
            />
          )}

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: "rotate(-30deg)"
            }}
          >
            <span className="text-white text-8xl opacity-5 font-bold">
              {boutiqueName?.toUpperCase()}
            </span>
          </div>
        </>
      )}

    </div>

  );

};

export default PosterTemplate;