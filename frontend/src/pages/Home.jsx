import { useNavigate } from "react-router-dom";
import teamImg from "../assets/image/cardimg1.jpg";
import taskImg from "../assets/image/cardimg2.jpg";
import secureImg from "../assets/image/cardimg3.jpg";
import aboutGif from "../assets/media/aboutcard.gif";
import logoImg from "../assets/image/logo.png"; // add your logo

export default function Home() {
  const navigate = useNavigate();

  // smooth scroll
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#2B2B2B]">

      {/* NAVBAR */}
      <div className="flex items-center justify-between px-12 py-6">

        {/* LOGO */}
        <div className="flex items-center gap-4">
          <img
            src={logoImg}
            className="w-14 h-14 rounded-full border-2 border-[#2B2B2B] bg-gray-300"
          />

          <span className="font-bold text-3xl">
            TaskFlow
          </span>
        </div>

        {/* MENU */}
       <div className="hidden md:flex gap-14 font-semibold text-[20px]">

  <button
    onClick={() => scrollTo("home")}
    className="transition duration-300 hover:scale-110 hover:border-b-[3px] hover:border-[#2B2B2B]"
  >
    Home
  </button>

  <button
    onClick={() => scrollTo("features")}
    className="transition duration-300 hover:scale-110 hover:border-b-[3px] hover:border-[#2B2B2B]"
  >
    Features
  </button>

  <button
    onClick={() => scrollTo("about")}
    className="transition duration-300 hover:scale-110 hover:border-b-[3px] hover:border-[#2B2B2B]"
  >
    About
  </button>

  <button
    onClick={() => scrollTo("contact")}
    className="transition duration-300 hover:scale-110 hover:border-b-[3px] hover:border-[#2B2B2B]"
  >
    Contact
  </button>

</div>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="bg-[#2B2B2B] text-[#B0B0B0] px-10 py-3 rounded-full text-lg hover:scale-105 transition"
        >
         Join Now
        </button>

      </div>

      {/* HERO */}
      <div id="home" className="flex flex-col items-center text-center mt-28 px-6">
        <h1 className="text-6xl font-bold">
          Manage Teams & Tasks Effortlessly
        </h1>

        <p className="mt-6 text-gray-700 max-w-2xl text-lg">
          TaskFlow helps teams collaborate, assign tasks, and track progress in a modern workflow system.
          Built for productivity, speed, and simplicity for modern teams.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-10 bg-[#2B2B2B] text-[#B0B0B0] px-12 py-4 rounded-full text-lg hover:scale-105 transition"
        >
          Try It Now
        </button>
      </div>

      {/* FEATURES SECTION */}
      <div id="features" className="mt-28 bg-[#2B2B2B] py-20 px-12 text-white">

        <h2 className="text-4xl font-bold text-center mb-14">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {/* CARD 1 */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-6 h-[480px] flex flex-col justify-between hover:scale-[1.03] transition">
            <div>
              <h2 className="text-2xl font-bold">Team Management</h2>
              <p className="mt-3 text-gray-200">
                Create teams, manage members, assign roles and improve collaboration with ease.
              </p>
            </div>
            <img src={teamImg} className="h-56 w-full object-cover rounded-xl" />
          </div>

          {/* CARD 2 */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-6 h-[480px] flex flex-col justify-between hover:scale-[1.03] transition">
            <div>
              <h2 className="text-2xl font-bold">Task Tracking</h2>
              <p className="mt-3 text-gray-200">
                Assign tasks, track progress, set deadlines, and manage workflows in real time.
              </p>
            </div>
            <img src={taskImg} className="h-56 w-full object-cover rounded-xl" />
          </div>

          {/* CARD 3 */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-6 h-[480px] flex flex-col justify-between hover:scale-[1.03] transition">
            <div>
              <h2 className="text-2xl font-bold">Secure System</h2>
              <p className="mt-3 text-gray-200">
                Authentication, sessions, and secure access control powered by PostgreSQL.
              </p>
            </div>
            <img src={secureImg} className="h-56 w-full object-cover rounded-xl" />
          </div>

        </div>
      </div>

      {/* ABOUT */}
      <div id="about" className="mt-28 flex flex-col md:flex-row items-center gap-10 px-12">

        <div className="flex-1">
          <h2 className="text-4xl font-bold">About TaskFlow</h2>
          <p className="mt-4 text-gray-700 text-lg leading-relaxed">
            TaskFlow is a modern productivity platform designed for teams that want clarity and speed.
            It simplifies task management, improves collaboration, and helps teams stay organized.
            Built with modern technologies like React, Node.js, and PostgreSQL for performance and scalability.
          </p>
        </div>

        <div className="flex-1">
          <div className="h-[520px] w-full rounded-2xl overflow-hidden border border-white/40 shadow-lg">
            <img src={aboutGif} className="w-full h-full object-cover" />
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div id="contact" className="mt-28 bg-[#1f1f1f] text-[#B0B0B0] py-12 px-12">

        <div className="grid md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-xl font-bold text-white">TaskFlow</h3>
            <p className="mt-2">Modern team & task management system.</p>
          </div>

          <div>
            <h3 className="font-bold text-white">Menu</h3>
            <p className="cursor-pointer">Home</p>
            <p className="cursor-pointer">Features</p>
            <p className="cursor-pointer">About</p>
            <p className="cursor-pointer">Contact</p>
          </div>

          <div>
            <h3 className="font-bold text-white">Contact</h3>
            <p>support@taskflow.com</p>
          </div>

        </div>

        <div className="text-center mt-10 text-sm">
          © 2026 TaskFlow. All rights reserved.
        </div>

      </div>

    </div>
  );
}
