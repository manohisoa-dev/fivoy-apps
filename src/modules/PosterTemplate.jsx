const PosterTemplate = ({
  poster,
  template,
  watermark = false,
  boutiqueName,
  boutiqueLogo,
  badgeConfig = {}
}) => {

  const config =
    typeof badgeConfig === "string"
      ? JSON.parse(badgeConfig)
      : badgeConfig;

  const badge = config?.[template];

  return (
    <div className="relative w-[1080px] h-[1350px] bg-black rounded-[20px] overflow-hidden">

      <img
        src={poster}
        className="w-full h-full object-cover"
      />

      {badge && (
        <div
          className="absolute top-6 right-6 text-white px-4 py-6 rounded-md text-4xl font-bold"
          style={{
            backgroundColor: badge.color,
            zIndex: 20
          }}
        >
          {badge.label}
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