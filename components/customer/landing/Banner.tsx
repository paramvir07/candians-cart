const Banner = () => {
  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      {/* Background Image */}
      <img
        src="https://cdn.pixabay.com/photo/2015/09/21/14/24/supermarket-949913_1280.jpg"
        alt="Groceries"
        className="w-full h-full object-cover"
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[5px]"></div>

      {/* Text on top */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white font-bold text-2xl md:text-4xl text-center px-4">
          Smart Grocery Shopping for Families
        </p>
      </div>
    </div>
  );
};

export default Banner;
