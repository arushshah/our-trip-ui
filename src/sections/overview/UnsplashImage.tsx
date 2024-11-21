import React, { useState, useEffect } from "react";
import axios from "axios";

interface UnsplashImageProps {
  destination: string;
}

const UnsplashImage: React.FC<UnsplashImageProps> = ({ destination }) => {
  const [imageUrl, setImageUrl] = useState("");
  const UNSPLASH_ACCESS_KEY = "rK48Qgb-fG1hIftA623JEnaib9v-uTXcDCktNfS__7Y";

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get("https://api.unsplash.com/search/photos", {
          params: { query: destination, per_page: 1 },
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        });
        const image = response.data.results[0];
        if (image) {
          setImageUrl(image.urls.regular);
        }
      } catch (error) {
        console.error("Error fetching image from Unsplash:", error);
      }
    };

    fetchImage();
  }, [destination]);

  if (!imageUrl) return <p>Loading image...</p>;

  return (
      <img
        src={imageUrl}
        alt={destination}
        style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
      />
  );
};

export default UnsplashImage;
