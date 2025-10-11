"use client";
import Image from "next/image";

// Define DishItem type
type DishItem = {
  image: string;
  title?: string;
  description?: string;
  id?: string | number;
};

type DishesGridProps = {
  dishes: DishItem[];
};

const DishesGrid = ({ dishes = [] }: DishesGridProps) => {
  return (
    <div className="dishes-grid row mt-5">
      {dishes.map((dishItem, index) => (
        <DishCard key={dishItem.id ?? index} dish={dishItem} />
      ))}
    </div>
  );
};

const DishCard = ({ dish }: { dish: DishItem }) => {
  // const [bgImage, setBgImage] = useState<string>("");

  // useEffect(() => {
  //   setBgImage(`url(${dish.image})`);
  // }, [dish.image]);

  return (
    <div className="col-md-3">
      <div
        className="dishes-grid-item"
        // style={{
        //   backgroundImage: bgImage, // empty on SSR, filled on client
        //   backgroundPosition: "center center",
        //   backgroundRepeat: "no-repeat",
        //   backgroundSize: "cover",
        //   minHeight: "250px",
        // }}
      >
        <Image className="img-fluid" src={dish.image} alt="chulauh" width={600} height={800} priority/>
        {dish.title && (
          <div className="text-pane text-white">
            <div className="centered">
              <h4 className="title">{dish.title}</h4>
              {dish.description && <p className="text">{dish.description}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishesGrid;
