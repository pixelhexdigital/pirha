import { useGetMenuCategoryByIdQuery } from "api/menuApi";
import TopNavBar from "components/TopNavBar";
import { errorToast } from "lib/helper";
import { Link, useLocation, useParams } from "react-router-dom";
import { ROUTES } from "routes/RouterConfig";

const DUMMY_CATEGORY = [
  {
    id: 1,
    name: "Starters",
    description: "Starters",
    imageSrc: "https://picsum.photos/200/?random=1",
  },
  {
    id: 2,
    name: "Main Course",
    description: "Main Course",
    imageSrc: "https://picsum.photos/200/?random=2",
  },
  {
    id: 3,
    name: "Pizza",
    description: "Pizza",
    imageSrc: "https://picsum.photos/200/?random=3",
  },
  {
    id: 4,
    name: "Pasta",
    description: "Pasta",
    imageSrc: "https://picsum.photos/200/?random=4",
  },
  {
    id: 5,
    name: "Wraps",
    description: "Wraps",
    imageSrc: "https://picsum.photos/200/?random=5",
  },
  {
    id: 6,
    name: "Shakes",
    description: "Shakes",
    imageSrc: "https://picsum.photos/200/?random=6",
  },
  {
    id: 7,
    name: "Desserts",
    description: "Desserts",
    imageSrc: "https://picsum.photos/200/?random=7",
  },
  {
    id: 8,
    name: "Beverages",
    description: "Beverages",
    imageSrc: "https://picsum.photos/200/?random=8",
  },
  {
    id: 9,
    name: "Mocktails",
    description: "Mocktails",
    imageSrc: "https://picsum.photos/200/?random=9",
  },
  {
    id: 10,
    name: "Cocktails",
    description: "Cocktails",
    imageSrc: "https://picsum.photos/200/?random=10",
  },
];

const CategoriesPage = () => {
  // get id from the URL which is passed as ?tableId=123?restaurantId=123
  const { search } = useLocation();
  const restaurantId = new URLSearchParams(search).get("restaurantId");
  const tableId = new URLSearchParams(search).get("tableId");

  console.log("restaurantId", restaurantId);

  const { data, error, isLoading } = useGetMenuCategoryByIdQuery(restaurantId);

  console.log("error", error);
  if (error) {
    console.log("inside error");
    // errorToast({ error });
  }

  return (
    <div className="container flex flex-col gap-4">
      <TopNavBar />
      <div className="w-full">
        <h1 className="mb-4 font-semibold">Categories</h1>
        <section className="grid items-center content-center justify-center grid-cols-2 gap-4 px-4 py-2 mx-auto sm:grid-cols-3">
          {data?.menu?.categories?.map(({ image, items, name }, index) => (
            <Link
              key={index}
              to={`${ROUTES.MENU}/${tableId}/${restaurantId}/${name}`}
              state={{ items } || {}}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md bg-card ring-1 ring-slate-800 ring-opacity-20"
            >
              {console.log("items", items)}
              <img src={image} alt={name} className="size-28" />
              <h2>{name}</h2>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};

export default CategoriesPage;
