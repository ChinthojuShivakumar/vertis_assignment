import WebsiteNavbar from "../Navbar/Navbar";

const Home = () => {
  return (
    <>
      <WebsiteNavbar />
      <div className="">
        <div className="min-h-[90vh] bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 flex items-center">
          <div className="max-w-7xl mx-auto px-6 text-white text-center">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              We Create Digital
              <br />
              Experiences That Matter
            </h1>
            <p className="mt-8 text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Transforming businesses through creative strategy, cutting-edge
              design, and powerful technology.
            </p>
            <div className="mt-12 flex gap-6 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition"
              >
                Start a Project
              </a>
              <a
                href="/about"
                className="border-2 border-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
