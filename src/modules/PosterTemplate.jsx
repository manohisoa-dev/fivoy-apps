const PosterTemplate = ({ poster, template, watermark = false, boutiqueName, boutiqueLogo }) => {

  const ribbonText = {
    film: "FILM",
    serie: "SÉRIE",
    nouveaute: "NOUVEAUTÉ",
    vostfr: "VOSTFR",
    drama: "DRAMA"
  };

  return (

    <div className="relative w-[1080px] h-[1350px] bg-black rounded-[20px] overflow-hidden">

      <img
        src={poster}
        className="w-full h-full object-cover"
      />

      {template && template !== "none" && (
        <div className="absolute top-6 right-[-60px] rotate-45 text-white font-bold px-24 py-2 text-xl shadow-lg">
          {ribbonText[template] || ""}
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
            <span className="text-white text-6xl opacity-5 font-bold">
              {boutiqueName?.toUpperCase()}
            </span>
          </div>
        </>
      )}

    </div>

  );

};

export default PosterTemplate;