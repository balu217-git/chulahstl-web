"use client";
import { useEffect, useState  } from "react";

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
  const [bgImage, setBgImage] = useState<string>("");

  useEffect(() => {
    setBgImage(`url(${dish.image})`);
  }, [dish.image]);

  return (
    <div className="col-md-3">
      <div
        className="dishes-grid-item"
        style={{
          backgroundImage: bgImage, // empty on SSR, filled on client
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          minHeight: "250px",
        }}
      >
        {dish.title && (
          <div className="text-pane text-white">
            <div className="centered">
              <h3 className="title">{dish.title}</h3>
              {dish.description && <p className="text">{dish.description}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishesGrid;
