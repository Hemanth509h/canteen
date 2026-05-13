import html2canvas from "html2canvas";

const fixOklchColors = (clonedDoc) => {
  const elements = clonedDoc.getElementsByTagName("*");
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    ["color", "backgroundColor", "borderColor"].forEach((prop) => {
      const val = el.style[prop] || window.getComputedStyle(el)[prop];
      if (val && val.includes("oklch")) {
        if (prop === "backgroundColor") el.style[prop] = "#ffffff";
        else if (prop === "color") el.style[prop] = "#000000";
        else el.style[prop] = "#cccccc";
      }
    });
  }
};

async function captureCanvas(element) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: fixOklchColors,
  });
}

export async function printElement(element) {
  if (!element) return;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print Preview");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  try {
    const canvas = await captureCanvas(element);
    const imgData = canvas.toDataURL("image/png");
    const printWindow = iframe.contentWindow;
    const printDocument = iframe.contentDocument || printWindow?.document;
    if (!printWindow || !printDocument) throw new Error("Unable to create print frame");

    printDocument.open();
    printDocument.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Print Preview</title>
    <style>
      @page { size: A4 portrait; margin: 12mm 15mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fff; }
      img { width: 100%; height: auto; display: block; }
    </style>
  </head>
  <body>
    <img id="print-image" src="${imgData}" />
    <script>
      const image = document.getElementById("print-image");
      const triggerPrint = () => {
        window.focus();
        window.print();
      };
      if (image.complete) {
        setTimeout(triggerPrint, 100);
      } else {
        image.onload = () => setTimeout(triggerPrint, 100);
      }
    </script>
  </body>
</html>`);
    printDocument.close();

    const removeFrame = () => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 500);
    };
    printWindow.addEventListener("afterprint", removeFrame, { once: true });
    setTimeout(removeFrame, 30000);
  } catch (err) {
    console.error("Print failed:", err);
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  }
}
