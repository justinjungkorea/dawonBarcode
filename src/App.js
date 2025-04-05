import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const boxData = {
  "4248424835": {
    weightKg: 14.23,
    description: "Boneless Pork Shoulder Butts",
    packedDate: "2024-09-04"
  }
};

function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannedSetRef = useRef(new Set());
  const [scannedBarcodes, setScannedBarcodes] = useState([]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result && !scannedSetRef.current.has(result.text)) {
              scannedSetRef.current.add(result.text);

              const data = boxData[result.text];
              const entry = {
                barcode: result.text,
                ...data
              };
              setScannedBarcodes(prev => [...prev, entry]);
            }
          }
        );

        // 비디오 스트림을 나중에 종료할 수 있도록 참조 저장
        streamRef.current = controls;
      } catch (error) {
        console.error("카메라 접근 오류:", error);
      }
    };

    startScanner();

    return () => {
      // 스트림 정지
      if (streamRef.current && typeof streamRef.current.stop === "function") {
        streamRef.current.stop();
      }
    };
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        📦 박스 중량 스캐너
      </h1>
      <video ref={videoRef} style={{ width: "100%", borderRadius: "10px", border: "1px solid #ccc" }} />

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
        {scannedBarcodes.map((item, index) => (
          <li key={index} style={{ marginBottom: "15px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div><strong>바코드:</strong> {item.barcode}</div>
            {item.weightKg ? (
              <>
                <div><strong>중량:</strong> {item.weightKg} kg</div>
                <div><strong>품목:</strong> {item.description}</div>
                <div><strong>포장일:</strong> {item.packedDate}</div>
              </>
            ) : (
              <div style={{ color: "red" }}>데이터 없음</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
