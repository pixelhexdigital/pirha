import LOGO from "assets/defLogo.png";
import { Circle, ScrollText, Utensils } from "lucide-react";

const TopNavBar = () => {
  return (
    <nav>
      <section className="flex items-center gap-4 p-2">
        <img src={LOGO} alt="logo" className="rounded-full size-8" />
        <h1>Restaurant Name</h1>
      </section>
      <section className="flex gap-4 p-2 bg-[#f8f8f8] items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-2 py-1 text-sm bg-white border shadow-md">
            <ScrollText size={15} className="text-red-700" />
            Bill
          </button>
          <div className="flex items-center gap-1 text-sm">
            <div className="p-2 bg-white border-2 rounded-full">
              <Utensils size={13} />
            </div>
            B1
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-white border-2 rounded-3xl">
            <Circle size={15} />
            Veg
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-white border-2 rounded-3xl">
            <Circle size={15} />
            Non Veg
          </button>
        </div>
      </section>
    </nav>
  );
};

export default TopNavBar;
