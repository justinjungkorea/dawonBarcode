import React, { useEffect, useRef, useState } from "react";
import { BarcodeScanner } from "dynamsoft-javascript-barcode";

// 라이선스 및 리소스 경로 설정
BarcodeScanner.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzODcxODkyLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzODcxODkyIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjozMDM1NzAwMjh9";
BarcodeScanner.engineResourcePath = "/dynamsoft/";

function App() {
  const videoRef = useRef(null);
  const [barcodeData, setBarcodeData] = useState(null);
  const [weightKg, setWeightKg] = useState(null);

  useEffect(() => {
    let scanner;

    const initScanner = async () => {
      try {
        scanner = await BarcodeScanner.createInstance();
        await scanner.setUIElement(videoRef.current);

        scanner.onFrameRead = results => {
          if (results.length > 0) {
            const raw = results[0].barcodeText;
            console.log("🎯 인식된 바코드:", raw);
            setBarcodeData(raw);

            // GS1의 3202 중량 인식
            const match = raw.match(/3202(\d{5})/);
            if (match) {
              const kg = parseInt(match[1], 10) / 100;
              setWeightKg(kg.toFixed(2));
            } else {
              setWeightKg(null);
            }
          }
        };

        await scanner.open();
      } catch (error) {
        console.error("스캐너 초기화 실패:", error);
      }
    };

    initScanner();

    return () => {
      if (scanner) scanner.destroyContext();
    };
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">📦 GS1 바코드 중량 스캐너</h1>
      <div
        ref={videoRef}
        className="dce-video-container"
        style={{
          width: "320px",
          height: "240px",
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden"
        }}
      ></div>

      {barcodeData && (
        <div className="mt-6 p-4 border rounded shadow bg-white text-left">
          <p><strong>📄 바코드 전체:</strong> {barcodeData}</p>
          {weightKg ? (
            <p className="text-green-600 text-xl mt-2">⚖️ 중량: {weightKg} kg</p>
          ) : (
            <p className="text-red-500 mt-2">❗ 중량 정보 없음 (3202 AI 없음)</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
