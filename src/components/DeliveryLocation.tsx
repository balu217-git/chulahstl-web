// "use client";

// import { useLoadScript, Autocomplete } from "@react-google-maps/api";

// import { useRef, useState } from "react";

// export default function DeliveryLocationDynamic() {
//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // replace with your key
//     libraries: ["places"],
//   });

//   const autocompleteRef = useRef<any>(null);
//   const [location, setLocation] = useState("");

//  const handlePlaceChanged = () => {
//   if (!autocompleteRef.current) return;
//   const place = autocompleteRef.current.getPlace() as PlaceResult;

//   const country = place.address_components?.find(
//     (c: GeocoderAddressComponent) => c.types.includes("country")
//   )?.short_name;

//   if (country !== "IN") {
//     alert("Please select a location in India.");
//     return;
//   }

//   console.log("Selected location:", place.formatted_address);
// };

//   if (!isLoaded) return <p>Loading Google Maps...</p>;

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-lg font-bold mb-2">Enter Your Delivery Location</h2>
//       <Autocomplete
//         onLoad={(ref) => (autocompleteRef.current = ref)}
//         onPlaceChanged={handlePlaceChanged}
//         options={{
//           componentRestrictions: { country: "in" }, // restrict to India
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search for your location in India..."
//           className="border p-2 rounded w-full"
//         />
//       </Autocomplete>
//       {location && (
//         <p className="mt-2 text-sm text-gray-600">
//           Selected Location: {location}
//         </p>
//       )}
//       <button
//         onClick={() => alert(location ? `Delivering to ${location}` : "Please select a location")}
//         className="bg-blue-600 text-white p-2 mt-2 rounded hover:bg-blue-700 w-full"
//       >
//         Set Location
//       </button>
//     </div>
//   );
// }
