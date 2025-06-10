import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "components/ui/button";

const LOTTIE_IFRAME_URL =
  "https://lottie.host/embed/4afc7f8f-b48c-4d4a-b9f0-00f8c7a828d8/MLRcCS7yFD.lottie";

const LOTTIE_IFRAME_URL_WITHOUT_EMBED =
  "https://lottie.host/4afc7f8f-b48c-4d4a-b9f0-00f8c7a828d8/MLRcCS7yFD.lottie";

export default function FeatureComingSoon() {
  const [isLottieAvailable, setIsLottieAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only HEAD request to check if file exists
    fetch(LOTTIE_IFRAME_URL_WITHOUT_EMBED, { method: "HEAD" })
      .then((res) => {
        console.log("Response status:");
        if (res.ok) setIsLottieAvailable(true);
        else setIsLottieAvailable(false);
      })
      .catch(() => setIsLottieAvailable(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null; // or a loader if you prefer

  return (
    <div className="flex flex-col text-center px-4 animate-fadeIn bg-white min-h-screen pt-10 pb-6 gap-4 max-w-2xl mx-auto">
      {isLottieAvailable ? (
        <iframe
          src={LOTTIE_IFRAME_URL}
          className="w-full  max-w-md rounded-lg mt-10 "
          title="Chef's Special Animation"
          allowFullScreen
          style={{ border: "none" }}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        ></iframe>
      ) : (
        <div className="text-6xl mb-4 animate-bounce">👨‍🍳</div>
      )}

      <h2 className="text-3xl font-semibold text-gray-800 mt-6">
        Chef’s Special in Progress!
      </h2>
      <p className="text-gray-500 max-w-md mb-6">
        We're preparing something delicious for you. This feature will be served
        hot and fresh very soon!
      </p>
      <Button
        variant="outline"
        onClick={() => window.history.back()}
        className="flex items-center gap-2 max-w-lg w-52 mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Button>
    </div>
  );
}
