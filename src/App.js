import React, { useEffect, useRef, useState } from "react";
import { BarcodeScanner } from "dynamsoft-javascript-barcode";

// Dynamsoft 설정
BarcodeScanner.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzODcxODkyLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzODcxODkyIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjozMDM1NzAwMjh9";
BarcodeScanner.engineResourcePath = "/dynamsoft/";

function App() {
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const [weightKg, setWeightKg] = useState(null);

  const startScanner = async () => {
    try {
      const scannerInstance = await BarcodeScanner.createInstance();
      setScanner(scannerInstance); // scanner 상태 저장
      setScannerStarted(true); // 버튼 숨기고 videoRef 렌더되도록
    } catch (error) {
      console.error("❌ 스캐너 생성 실패:", error);
    }
  };

  useEffect(() => {
    const runScanner = async () => {
      if (scanner && videoRef.current) {
        try {
          await scanner.setUIElement(videoRef.current);

          scanner.onFrameRead = (results) => {
            if (results.length > 0) {
              const raw = results[0].barcodeText;
              console.log("🎯 인식된 바코드:", raw);
              setBarcodeData(raw);

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
          console.error("❌ 스캐너 초기화 실패:", error);
        }
      }
    };

    runScanner();
  }, [scanner]);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "20px",
        maxWidth: "480px",
        margin: "0 auto",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        📦 GS1 바코드 중량 스캐너
      </h1>

      {!scannerStarted ? (
        <button
          onClick={startScanner}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "12px 24px",
            fontSize: "1.1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            width: "100%",
            maxWidth: "320px"
          }}
        >
          📷 카메라 시작
        </button>
      ) : (
        <div
          ref={videoRef}
          className="dce-video-container"
          style={{
            width: "100%",
            height: "300px",
            border: "1px solid #ccc",
            borderRadius: "8px"
          }}
        />
      )}

      {barcodeData && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "left",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          <p><strong>📄 바코드 전체:</strong> {barcodeData}</p>
          {weightKg ? (
            <p style={{ color: "green", fontSize: "1.2rem", marginTop: "8px" }}>
              ⚖️ 중량: {weightKg} kg
            </p>
          ) : (
            <p style={{ color: "red", marginTop: "8px" }}>
              ❗ 중량 정보 없음 (3202 AI 없음)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
