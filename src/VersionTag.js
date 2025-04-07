import { useEffect, useState } from "react";

function VersionTag() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetch("/version.txt")
      .then((res) => res.text())
      .then((text) => setVersion(`v${text.trim()}`))
      .catch(() => setVersion(""));
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 12,
        fontSize: "0.8rem",
        color: "#999",
        zIndex: 9999,
      }}
    >
      {version}
    </div>
  );
}

export default VersionTag;
