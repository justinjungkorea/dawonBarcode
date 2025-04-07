import React, { useEffect, useRef, useState } from "react";
import { BarcodeScanner } from "dynamsoft-javascript-barcode";

// Dynamsoft 설정
BarcodeScanner.license =
  "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAzODcxODkyLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAzODcxODkyIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjozMDM1NzAwMjh9";
BarcodeScanner.engineResourcePath =
  "https://cdn.jsdelivr.net/npm/dynamsoft-javascript-barcode@9.6.42/dist/";

function App() {
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [scannedList, setScannedList] = useState([]);
  const [duplicateNotice, setDuplicateNotice] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [manualWeight, setManualWeight] = useState("");
  const [manualBarcode, setManualBarcode] = useState(null);

  const scannedSet = useRef(new Set());

  const startScanner = async () => {
    try {
      const scannerInstance = await BarcodeScanner.createInstance();

      await scannerInstance.updateVideoSettings({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      await scannerInstance.updateRuntimeSettings("coverage");

      setScanner(scannerInstance);
      setScannerStarted(true);
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

              if (scannedSet.current.has(raw)) {
                setDuplicateNotice(true);
                setTimeout(() => setDuplicateNotice(false), 2000);
                return;
              }

              scannedSet.current.add(raw);
              navigator.vibrate && navigator.vibrate(200);
              console.log("🎯 인식된 바코드:", raw);

              const match = raw.match(/3202(\d{6})/);
              let kg = null;

              if (match) {
                const lb = parseInt(match[1], 10) / 100;
                kg = lb * 0.45359237;
                const newItem = {
                  barcode: raw,
                  weightKg: kg.toFixed(2),
                  timestamp: new Date().toLocaleTimeString(),
                };
                setScannedList((prev) => [...prev, newItem]);
              } else {
                setManualBarcode(raw);
                setShowModal(true);
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

  const handleManualSubmit = () => {
    const parsed = parseFloat(manualWeight);
    if (!isNaN(parsed)) {
      const time = new Date().toLocaleTimeString();
      const newItem = {
        barcode: manualBarcode || `MANUAL-${time}`,
        weightKg: parsed.toFixed(2),
        timestamp: time,
      };
      setScannedList((prev) => [...prev, newItem]);
    }
    setManualWeight("");
    setManualBarcode(null);
    setShowModal(false);
  };

  const openManualEntry = () => {
    const time = new Date().toLocaleTimeString();
    setManualBarcode(`MANUAL-${time}`);
    setShowModal(true);
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "20px",
        maxWidth: "480px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* 중복 알림 */}
      {duplicateNotice && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#f87171",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          ⚠️ 이미 스캔된 바코드입니다.
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            zIndex: 2000,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              width: "80%",
              maxWidth: "300px",
              textAlign: "left",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>중량 수동 입력 (kg)</h3>
            <input
              type="number"
              inputMode="decimal"
              value={manualWeight}
              onChange={(e) => setManualWeight(e.target.value)}
              placeholder="예: 14.23"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "1rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginBottom: "12px",
              }}
            />
            <button
              onClick={handleManualSubmit}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "1rem",
                border: "none",
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

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
            maxWidth: "320px",
          }}
        >
          📷 카메라 시작
        </button>
      ) : (
        <>
          <div
            ref={videoRef}
            className="dce-video-container"
            style={{
              position: "relative",
              width: "100%",
              height: "300px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          />
          <button
            onClick={openManualEntry}
            style={{
              marginTop: "12px",
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ➕ 수동 입력
          </button>
        </>
      )}

      {/* 결과 리스트 */}
      {scannerStarted && scannedList.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h2 style={{ marginBottom: "8px" }}>
            📦 총 중량:{" "}
            {scannedList
              .reduce((sum, item) => sum + (parseFloat(item.weightKg) || 0), 0)
              .toFixed(2)}{" "}
            kg
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {scannedList.map((item, idx) => (
              <li
                key={idx}
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div>
                  <strong>⚖️ 중량:</strong>{" "}
                  {item.weightKg ? `${item.weightKg} kg` : "❌ 중량 정보 없음"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  🕒 {item.timestamp}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
